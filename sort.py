import json
from gpt import call_gpt
import random
from typing import List, Dict, Tuple
import copy
import time

def load_candidates() -> List[Dict]:
    """Load candidate profiles from JSON file."""
    return json.load(open("candidate_intros.json"))

def create_pairs(candidates: List[Dict]) -> List[Tuple[Dict, Dict]]:
    """Create random pairs of candidates."""
    # Check if we have an even number of candidates
    if len(candidates) % 2 != 0:
        raise ValueError(f"Number of candidates must be even, got {len(candidates)}")
    
    candidates_copy = copy.deepcopy(candidates)
    random.shuffle(candidates_copy)
    pairs = []
    for i in range(0, len(candidates_copy), 2):
        pairs.append((candidates_copy[i], candidates_copy[i + 1]))
    return pairs

def create_batches(pairs: List[Tuple[Dict, Dict]], batch_size: int) -> List[List[Tuple[Dict, Dict]]]:
    """Create batches of pairs for processing."""
    # Ensure batch size is even
    if batch_size % 2 != 0:
        raise ValueError(f"Batch size must be even, got {batch_size}")
    
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
        # Extract JSON array from response
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
    # Check if total candidates is even
    if len(candidates) % 2 != 0:
        raise ValueError(f"Total number of candidates must be even, got {len(candidates)}")
    
    elimination_tree = []
    current_round = 1
    
    while len(candidates) > 1:
        print(f"\nRound {current_round} - {len(candidates)} candidates remaining")
        pairs = create_pairs(candidates)
        batches = create_batches(pairs, batch_size)
        
        round_results = []
        all_winners = []
        
        for batch_num, batch in enumerate(batches, 1):
            print(f"Processing batch {batch_num}/{len(batches)} ({len(batch)} pairs)")
            
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
                print(f"Waiting {delay} seconds before next batch...")
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

def main():
    candidates = load_candidates()
    print(f"Starting tournament with {len(candidates)} candidates")
    
    # Configuration
    batch_size = 4  # Number of pairs per batch (must be even)
    delay = 2.0     # Seconds to wait between batches
    
    try:
        results = run_tournament(candidates, batch_size=batch_size, delay=delay)
        
        print("\nTournament Results:")
        print(f"Champion: {results['champion']['name']}")
        print(f"Profile: {results['champion']['intro']}")
        
        print("\nElimination Summary:")
        for round_data in results['elimination_tree']:
            print(f"\nRound {round_data['round']} - {len(round_data['matches'])} matches in {round_data['total_batches']} batches")
            for match in round_data['matches']:
                print(f"  {match['candidate1']['name']} vs {match['candidate2']['name']} → {match['winner']['name']} (Batch {match['batch']})")
    
    except ValueError as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()