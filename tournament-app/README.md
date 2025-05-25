# 🏆 AI-Powered Candidate Tournament

A modern, stateless tournament application that uses Cerebras AI to intelligently evaluate and rank candidates through elimination rounds.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   echo "CEREBRAS_API_KEY=your_api_key_here" > .env.local
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Features

- 🤖 **AI-Powered Evaluation**: Uses Cerebras for intelligent candidate comparison
- 🏆 **Tournament Bracket**: Classic elimination tournament structure  
- 📊 **Real-time Progress**: Live updates as rounds complete
- 🎛️ **Configurable Settings**: Customize tournament size and evaluation parameters
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode**: Automatic dark/light theme support
- 💾 **Stateless Backend**: Each round is independent for reliability
- ⚡ **Batched Processing**: Efficient API usage with configurable batch sizes
- ⏯️ **Automatic Progression**: Tournament runs automatically with pause/resume control
- ✏️ **Live Editing**: Modify candidate profiles during the tournament
- 🏷️ **Edit Tracking**: Visual indicators for modified candidates

## 🏗️ Architecture

### Stateless Backend Design
- **Frontend State Management**: React manages tournament progression
- **Independent Rounds**: Each API call processes one tournament round
- **Scalable**: No server-side state to manage or lose

### API Endpoints
- `GET /api/candidates` - Retrieve all available candidates
- `GET /api/tournament` - API status and information
- `POST /api/tournament` - Process a single tournament round

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **AI**: Cerebras Cloud SDK (qwen-3-32b model)
- **Deployment**: Vercel-ready

## 🎮 How to Use

1. **Configure Tournament:**
   - Select number of candidates (4, 8, 16, or 32)
   - Choose batch size for API efficiency
   - Pick evaluation role (software engineering, data science, etc.)


2. **Run Tournament:**
   - Click "Start Tournament" to initialize
   - Tournament runs automatically through all rounds
   - **Edit candidates**: Click any candidate card to modify their profile
   - **Pause/Resume**: Control tournament progression as needed
   - Watch real-time progress and results

3. **View Results:**
   - See tournament champion and complete history
   - Review all matches and elimination tree
   - Reset and run new tournaments

## 🔧 Configuration Options

- **Candidate Count**: 4, 8, 16, or 32 participants
- **Batch Size**: 2, 4, 6, or 8 pairs per API call
- **Evaluation Role**: Software engineering, data science, product management, research


## 📁 Project Structure

```
tournament-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── candidates/route.ts    # Candidate data endpoint
│   │   │   └── tournament/route.ts    # Tournament round processor
│   │   ├── page.tsx                   # Main tournament interface
│   │   └── layout.tsx                 # App layout
│   ├── lib/
│   │   └── tournament-api.ts          # API client utilities
│   └── types/
│       └── tournament.ts              # TypeScript interfaces
├── API_SETUP.md                       # API documentation
├── QUICKSTART.md                      # Setup guide
└── README.md                          # This file
```

## 🔗 API Usage

### Get Candidates
```bash
curl http://localhost:3000/api/candidates
```

### Run Tournament Round
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

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables
- `CEREBRAS_API_KEY` - Your Cerebras Cloud API key (required)

## 📚 Documentation

- [API Setup Guide](./API_SETUP.md) - Detailed API documentation
- [Quick Start Guide](./QUICKSTART.md) - Step-by-step setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using Next.js, TypeScript, and Cerebras AI
