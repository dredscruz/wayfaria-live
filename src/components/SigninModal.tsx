'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SigninModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SigninModal({ isOpen, onClose }: SigninModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 bg-gray-900 border-2 border-gray-600 rounded-2xl p-8 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-amber-400 clip-diamond" />
              <h2 className="text-2xl font-bold mb-2">Welcome to Wayfaria</h2>
              <p className="text-gray-400 text-sm">
                Sign in to start planning your next adventure
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="space-y-3">
              <motion.button
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.54 9.43c-.17-.82-.4-1.6-0.82-2.34L20.5 5.83c-.76-.73-1.74-1.18-2.78-1.36C16.5 4 16 4 15 4c-1 0-2 .19-2.87.65-.87.46-1.63 1.18-2.19 2.07C9.83 7.9 9 8.8 9 10v.5c0 .28.22.5.5.5s.5-.22.5-.5V10c0-.55.35-1 .8-1.22.45-.22 1.03-.4 1.61-.4.63 0 1.14-.52 1.14-1.15s-.5-1.15-1.15-1.15c-.64 0-1.28.17-1.77.53-.88.6-1.45 1.7-1.45 2.82 0 .83.13 1.74.35 2.72.02.13.05.25.08.38.35 1.25 1.2 2.15 2.65 2.52 1.45.32 2.95.02 4.06-1.14.12-.12.22-.26.3-.41.17-.3 1.49-2.83 1.66-3.2-.58-.17-1.2-.3-1.83-.3h-.13c-.55 0-1.1.04-1.64.12-1.32.16-2.43-.33-3.04-1.51-.55-1.05-.4-2.43.32-3.36.71-.9 1.85-1.23 3-1.07.32.05.65.1 1 .17.56.13 1.11.22 1.66.27.17.02.34.03.5.05.18.02.36-.03.5-.15.15-.13.28-.32.38-.5.23-.39.4-1.1.4-1.86 0-.83-.1-1.67-.32-2.45C20.53 3.36 20.75 2.42 21 1.5A6.06 6.06 0 0123.5 7c0 .57-.09 1.13-.27 1.68a6.17 6.17 0 01-1.68 2.91c-.08.07-.17.12-.27.18z"/>
                </svg>
                Continue with Google
              </motion.button>

              <motion.button
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 text-gray-200 font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg border border-gray-700"
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">🍎</span>
                Continue with Apple
              </motion.button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="px-4 text-gray-500 text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-gray-200 placeholder-gray-500"
              />
              <motion.button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              By continuing, you agree to our <a href="#terms" className="text-purple-400 hover:underline">Terms</a> and <a href="#privacy" className="text-purple-400 hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inject clip-path utility
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `.clip-diamond { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }`;
  document.head.appendChild(style);
}