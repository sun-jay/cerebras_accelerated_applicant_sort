import { NextRequest, NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

// Types
interface Candidate {
  name: string;
  intro: string;
}

interface Match {
  candidate1: Candidate;
  candidate2: Candidate;
  winner: Candidate;
  batch: number;
}

interface RoundData {
  round: number;
  matches: Match[];
  total_batches: number;
}

// Removed unused TournamentResult interface


// Utility functions
// Utility functions

function createBatches(pairs: [Candidate, Candidate][], batchSize: number): [Candidate, Candidate][][] {
  if (batchSize % 2 !== 0) {
    throw new Error(`Batch size must be even, got ${batchSize}`);
  }
  
  const batches: [Candidate, Candidate][][] = [];
  for (let i = 0; i < pairs.length; i += batchSize) {
    batches.push(pairs.slice(i, i + batchSize));
  }
  
  return batches;
}

async function callCerebras(prompt: string): Promise<{ response: string; thinking?: string }> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error('CEREBRAS_API_KEY environment variable is not set');
  }

  try {
    const client = new Cerebras({ apiKey });

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
      model: 'qwen-3-32b',
    });

    const content = (chatCompletion.choices as any)[0].message.content || '';

    // Parse out the <think>...</think> section and the actual response
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    const thinking = thinkMatch ? thinkMatch[1].trim() : undefined;
    const response = content.includes('</think>') 
      ? content.split('</think>')[1].trim() 
      : content.trim();

    return { response, thinking };

  } catch (error) {
    throw new Error(`Cerebras API error: ${error}`);
  }
}

async function compareBatch(batch: [Candidate, Candidate][], role: string = "software engineering"): Promise<Candidate[]> {
  let prompt = `Compare these pairs for a ${role} role and return only an array indicating the winner of each pair (1 for first candidate, 2 for second candidate):\n\n`;
  
  batch.forEach((pair, index) => {
    prompt += `Pair ${index + 1}:\n`;
    prompt += `Candidate 1: ${pair[0].name} - ${pair[0].intro}\n`;
    prompt += `Candidate 2: ${pair[1].name} - ${pair[1].intro}\n\n`;
  });
  
  prompt += `Return only: [1,2,1] (example format for ${batch.length} pairs)`;
  
  const { response } = await callCerebras(prompt);
  
  try {
    // Extract JSON array from response
    let cleanResponse = response.trim();
    
    // Try to find JSON array in the response
    const start = cleanResponse.indexOf('[');
    const end = cleanResponse.lastIndexOf(']') + 1;
    
    if (start !== -1 && end !== 0) {
      cleanResponse = cleanResponse.substring(start, end);
    }
    
    const winnersIndices: number[] = JSON.parse(cleanResponse);
    
    if (winnersIndices.length !== batch.length) {
      throw new Error(`Expected ${batch.length} winners, got ${winnersIndices.length}`);
    }
    
    const winners: Candidate[] = [];
    winnersIndices.forEach((winnerIndex, i) => {
      if (winnerIndex === 1) {
        winners.push(batch[i][0]);
      } else if (winnerIndex === 2) {
        winners.push(batch[i][1]);
      } else {
        throw new Error(`Invalid winner index: ${winnerIndex}, expected 1 or 2`);
      }
    });
    
    return winners;
    
  } catch (error) {
    console.error('Error parsing response:', error);
    console.error('Response was:', response);
    // Fallback: randomly select winners
    console.log('Falling back to random selection for this batch');
    return batch.map(pair => Math.random() < 0.5 ? pair[0] : pair[1]);
  }
}

// API Routes
export async function GET() {
  try {
    return NextResponse.json({ 
      message: "Tournament API is running - stateless round processor",
      description: "Send candidates to /api/tournament POST to run a single round"
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get tournament info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      candidates: inputCandidates,
      batchSize = 4, 
      role = "software engineering"
    } = body;

    // Validate inputs
    if (!inputCandidates || !Array.isArray(inputCandidates)) {
      return NextResponse.json(
        { error: 'Candidates array is required' },
        { status: 400 }
      );
    }

    if (inputCandidates.length % 2 !== 0) {
      return NextResponse.json(
        { error: 'Number of candidates must be even' },
        { status: 400 }
      );
    }

    if (batchSize % 2 !== 0) {
      return NextResponse.json(
        { error: 'Batch size must be even' },
        { status: 400 }
      );
    }

    console.log(`Processing round with ${inputCandidates.length} candidates`);
    
    // Create pairs from input candidates (adjacent pairing)
    const pairs: [Candidate, Candidate][] = [];
    for (let i = 0; i < inputCandidates.length; i += 2) {
      pairs.push([inputCandidates[i], inputCandidates[i + 1]]);
    }

    // Create batches
    const batches = createBatches(pairs, batchSize);
    
    const roundResults: Match[] = [];
    const allWinners: Candidate[] = [];
    
    // Process each batch
    for (let batchNum = 0; batchNum < batches.length; batchNum++) {
      const batch = batches[batchNum];
      console.log(`Processing batch ${batchNum + 1}/${batches.length} (${batch.length} pairs)`);
      
      const winners = await compareBatch(batch, role);
      allWinners.push(...winners);
      
      // Record results for this batch
      batch.forEach((pair, i) => {
        roundResults.push({
          candidate1: pair[0],
          candidate2: pair[1],
          winner: winners[i],
          batch: batchNum + 1
        });
      });
      
      // No delay between batches - process immediately
    }
    
    return NextResponse.json({
      success: true,
      winners: allWinners,
      matches: roundResults,
      totalBatches: batches.length
    });

  } catch (error) {
    console.error('Tournament round error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 