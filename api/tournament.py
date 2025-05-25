import json
import os
import re
import random
from typing import List, Dict, Tuple
import copy
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras

app = FastAPI()

# Pydantic models for request/response
class TournamentRequest(BaseModel):
    candidates: List[Dict]
    batch_size: int = 4
    role: str = "software engineering"
    delay: float = 2.0

class TournamentResponse(BaseModel):
    champion: Dict
    elimination_tree: List[Dict]

# GPT function
def call_gpt(prompt: str) -> tuple[str, str]:
    """Call Cerebras GPT API."""
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="CEREBRAS_API_KEY environment variable is not set")

    try:
        client = Cerebras(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="qwen-3-32b",
        )

        content = chat_completion.choices[0].message.content

        # Parse out the <think>...</think> section and the actual response
        think_match = re.search(r'<think>(.*?)</think>', content, re.DOTALL)
        thinking = think_match.group(1).strip() if think_match else None
        response = content.split('</think>')[-1].strip() if '</think>' in content else content.strip()

        return response, thinking

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT API error: {str(e)}")

# Tournament functions
def create_pairs(candidates: List[Dict]) -> List[Tuple[Dict, Dict]]:
    """Create random pairs of candidates."""
    if len(candidates) % 2 != 0:
        raise HTTPException(status_code=400, detail=f"Number of candidates must be even, got {len(candidates)}")
    
    candidates_copy = copy.deepcopy(candidates)
    random.shuffle(candidates_copy)
    pairs = []
    for i in range(0, len(candidates_copy), 2):
        pairs.append((candidates_copy[i], candidates_copy[i + 1]))
    return pairs

def create_batches(pairs: List[Tuple[Dict, Dict]], batch_size: int) -> List[List[Tuple[Dict, Dict]]]:
    """Create batches of pairs for processing."""
    if batch_size % 2 != 0:
        raise HTTPException(status_code=400, detail=f"Batch size must be even, got {batch_size}")
    
    batches = []
    for i in range(0, len(pairs), batch_size):
        batch = pairs[i:i + batch_size]
        batches.append(batch)
    return batches

def compare_batch(batch: List[Tuple[Dict, Dict]], role: str = "software engineering") -> List[Dict]:
    """Compare a batch of candidate pairs using GPT and return winners."""
    prompt = f"Compare these pairs for a {role} role and return only an array indicating the winner of each pair (1 for first candidate, 2 for second candidate):\n\n"
    
    for i, (candidate1, candidate2) in enumerate(batch, 1):
        prompt += f"Pair {i}:\n"
        prompt += f"Candidate 1: {candidate1['name']} - {candidate1['intro']}\n"
        prompt += f"Candidate 2: {candidate2['name']} - {candidate2['intro']}\n\n"
    
    prompt += f"Return only: [1,2,1] (example format for {len(batch)} pairs)"
    
    response, thinking = call_gpt(prompt)
    
    # Parse the JSON response
    try:
        response = response.strip()
        if response.startswith('[') and response.endswith(']'):
            winners_indices = json.loads(response)
        else:
            # Try to find JSON array in the response
            start = response.find('[')
            end = response.rfind(']') + 1
            if start != -1 and end != 0:
                winners_indices = json.loads(response[start:end])
            else:
                raise ValueError("No valid JSON array found in response")
        
        if len(winners_indices) != len(batch):
            raise ValueError(f"Expected {len(batch)} winners, got {len(winners_indices)}")
        
        winners = []
        for i, winner_index in enumerate(winners_indices):
            if winner_index == 1:
                winners.append(batch[i][0])
            elif winner_index == 2:
                winners.append(batch[i][1])
            else:
                raise ValueError(f"Invalid winner index: {winner_index}, expected 1 or 2")
        
        return winners
    
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error parsing response: {e}")
        print(f"Response was: {response}")
        # Fallback: randomly select winners
        print("Falling back to random selection for this batch")
        return [random.choice(pair) for pair in batch]

def run_tournament(candidates: List[Dict], batch_size: int = 4, role: str = "software engineering", delay: float = 2.0) -> Dict:
    """Run the tournament with batched comparisons and return the champion with the elimination tree."""
    if len(candidates) % 2 != 0:
        raise HTTPException(status_code=400, detail=f"Total number of candidates must be even, got {len(candidates)}")
    
    elimination_tree = []
    current_round = 1
    
    while len(candidates) > 1:
        pairs = create_pairs(candidates)
        batches = create_batches(pairs, batch_size)
        
        round_results = []
        all_winners = []
        
        for batch_num, batch in enumerate(batches, 1):
            winners = compare_batch(batch, role)
            all_winners.extend(winners)
            
            # Record results for this batch
            for i, (pair, winner) in enumerate(zip(batch, winners)):
                round_results.append({
                    "candidate1": pair[0],
                    "candidate2": pair[1],
                    "winner": winner,
                    "batch": batch_num
                })
            
            # Add delay between batches to respect rate limits
            if batch_num < len(batches):
                time.sleep(delay)
        
        elimination_tree.append({
            "round": current_round,
            "matches": round_results,
            "total_batches": len(batches)
        })
        
        candidates = all_winners
        current_round += 1
    
    return {
        "champion": candidates[0],
        "elimination_tree": elimination_tree
    }

# API Routes
@app.get("/api/tournament/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Tournament API is running"}

@app.post("/api/tournament/run", response_model=TournamentResponse)
async def run_tournament_api(request: TournamentRequest):
    """Run a tournament with the provided candidates."""
    try:
        result = run_tournament(
            candidates=request.candidates,
            batch_size=request.batch_size,
            role=request.role,
            delay=request.delay
        )
        return TournamentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tournament/candidates")
async def get_all_candidates():
    """Get all candidates from the JSON file."""
    try:
        with open("api/candidates.json", "r") as f:
            candidates = json.load(f)
        return {"candidates": candidates}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Candidates file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing candidates file")

@app.get("/api/tournament/sample-candidates")
async def get_sample_candidates():
    """Get a small sample of candidates for testing."""
    try:
        with open("api/candidates.json", "r") as f:
            all_candidates = json.load(f)
        # Return first 4 candidates for testing
        sample_candidates = all_candidates[:4]
        return {"candidates": sample_candidates}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Candidates file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing candidates file")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 