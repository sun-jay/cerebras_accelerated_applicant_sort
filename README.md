
# 🏆 Cerebras Accelerated Applicant Sort

  

This candidate sorting system takes inspiration from GPU reduction algorithms used in parallel computing. Just like how GPUs efficiently reduce large datasets by processing pairs in parallel, our AI-powered system eliminates candidates in a structured, logarithmic fashion to quickly find the best matches.

  

## ⚡ Why This Approach?

  

-  **⚡ Efficient**: Handle 2^n candidates in just log₂(n) rounds

-  **🚀 Scalable**: You could theoretically process 33 Million candidates in just 25 rounds (under 25s with Cerebras accelerated inference)—and it gets more efficient the more candidates you have

-  **🎯 Fair**: Given multiple runs of the bracket, each candidate gets equal opportunity to be the best, without fear of being lost in a giant context window

-  **🧠 Versatile**: This has applications far outside of recruiting, can be used to semantically sort any set of items



## 🚀 Quick Start

  

**Web App:**  `cd tournament-app && npm install && npm run dev`

**Python POC:**  `cd python_poc && python sort.py`

  

Set `CEREBRAS_API_KEY` in `.env.local` (web) or `gpt.py` (python)

  



  

## ✨ Features

  

**Web App:** Interactive brackets, real-time updates, candidate editing, responsive design, dark mode

**Python POC:** Initial test to prove concept, was translated into TS

  

## 🤖 GPU-Inspired Algorithm

  

Like GPU reduction operations, we process pairs in parallel and eliminate half the candidates each round, making us more efficient with scale.

  

Uses Cerebras AI (Qwen-3-32B) for ultra-fast pairwise comparisons. Configure for 4-32 candidates, 2-8 pairs per batch, multiple evaluation roles.

  

## 🛠️ Development

  

**Requirements:** Node.js 18+, Python 3.8+, Cerebras API key

**Scripts:**  `npm run dev/build/start/lint`

  

## Tech Stack

  

Built with Cerebras AI, Next.js, TypeScript, and Python 🚀