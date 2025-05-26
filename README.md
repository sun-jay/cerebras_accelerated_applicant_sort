# 🏆 Cerebras Accelerated Applicant Sort

## LIVE: https://cerebras-accelerated-applicant-sort.vercel.app/

This candidate sorting system takes inspiration from GPU reduction algorithms used in parallel computing. Just like how GPUs efficiently reduce large datasets by processing pairs in parallel, our **Cerebras AI-powered** system eliminates candidates in a structured, logarithmic fashion to quickly find the best matches.

**🔥 Powered by Cerebras** - Ultra-fast inference enables real-time candidate evaluation at unprecedented speeds!

## ⚡ Why This Approach?

-  **⚡ Efficient**: Handle 2^n candidates in just log₂(n) rounds
-  **🚀 Scalable**: You could theoretically process 33 Million candidates in just 25 rounds (under 25s with **Cerebras accelerated inference**)—and it gets more efficient the more candidates you have
-  **🎯 Fair**: Given multiple runs of the bracket, each candidate gets equal opportunity to be the best, without fear of being lost in a giant context window
-  **🧠 Versatile**: This has applications far outside of recruiting, can be used to semantically sort any set of items
-  **⚡ Cerebras Speed**: Lightning-fast AI inference makes this practical for real-time use cases

## 🚀 Quick Start

**Web App:**  `cd tournament-app && npm install && npm run dev`
**Python POC:**  `cd python_poc && python sort.py`

Set `CEREBRAS_API_KEY` in `.env.local` (web) or `gpt.py` (python)

**⚡ Pro Tip**: Cerebras inference is so fast that you can run multiple tournament brackets in seconds to get even more reliable results!

## ✨ Features

**Web App:** Interactive brackets, real-time updates, candidate editing, responsive design, dark mode
**Python POC:** Initial test to prove concept, was translated into TS
**⚡ Cerebras Integration:** Ultra-fast AI inference for instant candidate comparisons

## 🤖 GPU-Inspired Algorithm + Cerebras Acceleration

Like GPU reduction operations, we process pairs in parallel and eliminate half the candidates each round, making us more efficient with scale. **Cerebras AI acceleration** makes this lightning-fast in practice!

Uses **Cerebras AI (Qwen-3-32B)** for ultra-fast pairwise comparisons. The incredible inference speed means you can:
- Run multiple tournament brackets for better accuracy
- Handle real-time sorting of large candidate pools  
- Scale to thousands of candidates without performance concerns

Configure for 4-32 candidates, 2-8 pairs per batch, multiple evaluation roles.

## 🛠️ Development

**Requirements:** Node.js 18+, Python 3.8+, **Cerebras API key**
**Scripts:**  `npm run dev/build/start/lint`

## Tech Stack

Built with **Cerebras AI** (the speed is incredible!), Next.js, TypeScript, and Python 🚀
