'use client';

import { useState } from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🧠 How Does This Work?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'architecture'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              System Architecture
            </button>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Text */}
                <div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    This candidate sorting system takes inspiration from <strong>GPU reduction algorithms</strong> used in parallel computing. 
                    Just like how GPUs efficiently reduce large datasets by processing pairs in parallel, our AI-powered 
                    system eliminates candidates in a structured, logarithmic fashion to quickly find the best matches.
                  </p>
                  
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-3">⚡</span>
                      <span><strong>Efficient:</strong> Handle 2^n candidates in just log₂(n) rounds</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3">🚀</span>
                      <span><strong>Scalable:</strong> You could theoretically process 33 Million candidates in just 25 rounds (under 25s with Cerebras accelerated inference)—and it gets more efficient the more candidates you have</span>
                    </li>
                   
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-3">🎯</span>
                      <span><strong>Fair:</strong> Given multiple runs of the bracket, each candidate gets equal opportunity to be the best, without fear of being lost in a giant context window</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-3">🧠</span>
                      <span><strong>Versatile:</strong> This has applications far outside of recruiting, can be used to semantically sort any set of items</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column - Image */}
                <div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/gpuadd.png" 
                      alt="GPU Reduction Algorithm Visualization" 
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                      GPU reduction: Each level processes pairs in parallel, halving the problem size
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div className="flex flex-col items-center">
          
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/diagram.jpg" 
                    alt="System Architecture Diagram" 
                    className="w-6/12 h-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                    System architecture showing the flow from API routes to frontend components
                  </p>
                
               
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Got it! Let&apos;s process some candidates 🧠
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        How does this work?
      </button>
      
      <HowItWorksModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 