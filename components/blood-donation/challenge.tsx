'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { X, RefreshCw } from 'lucide-react';

interface MathCaptchaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MathCaptcha({ isOpen, onClose, onSuccess }: MathCaptchaProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [mounted, setMounted] = useState(false);

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, result: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        result = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        result = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        result = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        result = 2;
    }
    
    setQuestion(`${num1} ${operation} ${num2} = ?`);
    setAnswer(result.toString());
    setUserAnswer('');
    setIsCorrect(null);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateQuestion();
      setAttempts(0);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userAnswer.trim() === answer) {
      setIsCorrect(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } else {
      setIsCorrect(false);
      setAttempts(prev => prev + 1);
      setUserAnswer('');
      
      if (attempts >= 2) {
        setTimeout(() => {
          generateQuestion();
          setAttempts(0);
        }, 1000);
      }
    }
  };

  const handleRefresh = () => {
    generateQuestion();
    setAttempts(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md mx-auto relative my-auto">
        <Card className="p-4 sm:p-6 border-0 shadow-2xl bg-white rounded-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Verify You're Human
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </div>
        
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Please solve this simple math problem to view the phone number:
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{question}</span>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Generate new question"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="relative">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 border-0 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-center text-lg sm:text-xl font-bold placeholder-gray-400"
                  autoFocus
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-base sm:text-lg"
              >
                Verify Answer
              </button>
            </form>
          
            {isCorrect === false && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-xs sm:text-sm font-medium">
                  Incorrect answer. Please try again.
                  {attempts >= 2 && (
                    <span className="block mt-1 sm:mt-2 text-xs">New question generated!</span>
                  )}
                </p>
              </div>
            )}
            
            {isCorrect === true && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 text-xs sm:text-sm font-medium">✅ Correct! Access granted.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (!isOpen || !mounted) return null;
  
  return createPortal(modalContent, document.body);
}
