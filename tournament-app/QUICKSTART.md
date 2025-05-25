# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- A Cerebras API key

## Setup

1. **Clone and navigate to the project:**
   ```bash
   cd tournament-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the `tournament-app` directory:
   ```bash
   echo "CEREBRAS_API_KEY=your_cerebras_api_key_here" > .env.local
   ```
   Replace `your_cerebras_api_key_here` with your actual Cerebras API key.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Using the Tournament App

1. **Configure Tournament Settings:**
   - Choose number of candidates (4, 8, 16, or 32)
   - Set batch size for API calls (2, 4, 6, or 8)
   - Select the role to evaluate candidates for
   - Adjust delay between API calls if needed

2. **Start Tournament:**
   - Click "Start Tournament" to begin
   - The app will randomly shuffle and select your chosen number of candidates

3. **Watch Tournament Run:**
   - Tournament runs automatically through all elimination rounds
   - **Edit candidates**: Click on any candidate card to modify their name or introduction
   - Modified candidates are highlighted with an orange border and "Modified" badge
   - **Pause/Resume**: Control tournament progression with pause/resume buttons
   - Watch real-time progress as the AI evaluates candidates
   - View match results and tournament history

4. **View Results:**
   - See the champion when the tournament completes
   - Review the complete elimination tree
   - Reset and run new tournaments with different settings

## Features

- 🤖 **AI-Powered Evaluation**: Uses Cerebras for intelligent candidate comparison
- 🏆 **Tournament Bracket**: Classic elimination tournament structure
- 📊 **Real-time Progress**: Live updates as rounds complete
- 🎛️ **Configurable Settings**: Customize tournament size and evaluation parameters
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode**: Automatic dark/light theme support
- 💾 **Stateless Backend**: Each round is independent for reliability
- ✏️ **Live Editing**: Modify candidate profiles during the tournament
- 🏷️ **Edit Tracking**: Visual indicators for modified candidates
- ⏯️ **Automatic Progression**: Tournament runs automatically with pause/resume control

## Troubleshooting

- **API Key Issues**: Make sure your `.env.local` file is in the `tournament-app` directory and contains a valid Cerebras API key
- **Network Errors**: Check your internet connection and API key validity
- **Build Errors**: Try deleting `node_modules` and running `npm install` again

## API Testing

You can also test the API directly:

```bash
# Get all candidates
curl http://localhost:3000/api/candidates

# Run a single round
curl -X POST http://localhost:3000/api/tournament \
  -H "Content-Type: application/json" \
  -d '{
    "candidates": [
      {"name": "Alice", "intro": "Software engineer"},
      {"name": "Bob", "intro": "Data scientist"}
    ],
    "batchSize": 2,
    "role": "software engineering"
  }'
``` 