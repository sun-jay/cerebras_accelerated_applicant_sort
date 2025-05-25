# Tournament API Setup

## Environment Variables

Create a `.env.local` file in the tournament-app directory with:

```
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

## API Endpoints

### GET /api/candidates
Returns all available candidates.

**Response:**
```json
{
  "candidates": [
    {
      "name": "Candidate Name",
      "intro": "Candidate description..."
    }
  ],
  "totalCount": 32
}
```

### GET /api/tournament
Returns basic information about the tournament API.

**Response:**
```json
{
  "message": "Tournament API is running",
  "totalCandidates": 32
}
```

### POST /api/tournament
Runs a single tournament round with the provided candidates (stateless).

**Request Body:**
```json
{
  "candidates": [           // Array of candidates for this round
    {
      "name": "Candidate 1",
      "intro": "Description..."
    },
    {
      "name": "Candidate 2", 
      "intro": "Description..."
    }
  ],
  "batchSize": 4,           // Number of pairs per batch (must be even)
  "role": "software engineering"   // Role to evaluate candidates for
}
```

**Response:**
```json
{
  "success": true,
  "winners": [              // Winners from this round
    {
      "name": "Winner Name",
      "intro": "Winner description..."
    }
  ],
  "matches": [              // All matches from this round
    {
      "candidate1": { "name": "...", "intro": "..." },
      "candidate2": { "name": "...", "intro": "..." },
      "winner": { "name": "...", "intro": "..." },
      "batch": 1
    }
  ],
  "totalBatches": 2
}
```

## Usage Examples

### Get all candidates
```bash
curl http://localhost:3000/api/candidates
```

### Test the API
```bash
curl http://localhost:3000/api/tournament
```

### Run a single round
```bash
curl -X POST http://localhost:3000/api/tournament \
  -H "Content-Type: application/json" \
  -d '{
    "candidates": [
      {"name": "Alice", "intro": "Software engineer with 5 years experience"},
      {"name": "Bob", "intro": "Data scientist with ML expertise"}
    ],
    "batchSize": 2,
    "role": "software engineering"
  }'
```

## Architecture

This implementation uses a **stateless backend** approach:

- **Frontend State Management**: The React frontend manages the tournament state, including current candidates, elimination tree, and round progression
- **Stateless API**: Each API call processes one round of the tournament and returns winners
- **Round-by-Round Processing**: The frontend calls the API for each round, allowing for real-time progress updates and user control

## Features Converted from Python POC

- ✅ **Stateless API Design**: Each round is processed independently
- ✅ **Frontend Tournament Management**: React state handles tournament progression
- ✅ **Candidate data served via API**: Separate endpoint for candidate data
- ✅ **Batched AI comparisons using Cerebras**: Maintains efficient batch processing
- ✅ **Rate limiting with configurable delays**: Respects API rate limits
- ✅ **Complete elimination tree tracking**: Frontend builds the full tournament history
- ✅ **Error handling and fallback**: Graceful degradation to random selection
- ✅ **Input validation**: Both frontend and backend validation
- ✅ **TypeScript types**: Full type safety throughout the application
- ✅ **Beautiful UI**: Modern, responsive interface with real-time updates
- ✅ **Tournament Controls**: Start, pause, reset, and configure tournaments 