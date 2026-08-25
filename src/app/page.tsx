'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import DestinationBackground from '@/components/DestinationBackground';
import SigninModal from '@/components/SigninModal';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';
import { useShareTrip } from '@/hooks/useShareTrip';
import { destinations } from '@/components/DestinationBackground';

export default function Home() {
  // Client-only state
  const [mounted, setMounted] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(destinations[0]);

  const { isListening, transcript, startListening, stopListening } = useVoiceDictation();
  const { shareLink, generateShareLink } = useShareTrip();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVoiceSubmit = useCallback(() => {
    if (transcript) {
      setShowSignin(true);
    }
  }, [transcript]);

  const handleShare = useCallback(async () => {
    if (currentDestination) {
      await generateShareLink({
        destination: currentDestination.name,
        tripType: 'adventure',
      });
    }
  }, [currentDestination, generateShareLink]);

  // Render loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-amber-400 clip-diamond" />
          <h1 className="text-4xl font-bold text-white mb-4">Wayfaria</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-100">
      {/* Animated Background */}
      <DestinationBackground onDestinationChange={setCurrentDestination} />

      {/* Theme Toggle */}
      <motion.button
        onClick={() => document.documentElement.classList.toggle('light')}
        className="fixed top-6 right-6 z-20 w-12 h-12 bg-gray-800/50 border-2 border-gray-600 rounded-xl flex items-center justify-center text-xl hover:bg-gray-700 transition-all"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle theme"
      >
        ☀️
      </motion.button>

      {/* Share Button */}
      <motion.button
        onClick={handleShare}
        className="fixed bottom-32 right-6 z-20 w-14 h-14 bg-gradient-to-r from-purple-500 to-amber-400 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share trip"
      >
        🔗
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="w-28 h-28 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-amber-400 clip-diamond animate-pulse-slow" />
            <div className="absolute inset-3 bg-gradient-to-br from-purple-600 to-amber-500 clip-diamond" />
          </div>
          <h1 className="text-5xl font-bold text-center mt-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-amber-300">
            Wayfaria
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Every journey deserves the right teammate
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Weather-aware planning, real-time voice dictation, group collaboration,
            Google Calendar sync, and health-aware recommendations — all in one app.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full max-w-3xl">
          <motion.button
            onClick={() => setShowSignin(true)}
            className="flex-1 group relative overflow-hidden rounded-xl bg-gray-800/50 border-2 border-purple-400 hover:border-amber-400 text-gray-100 font-semibold py-6 px-8 transition-all duration-300 shadow-2xl"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">✈️</span>
              <span className="text-xl">I have plans already</span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Forward confirmations or import from TripIt
            </div>
          </motion.button>

          <motion.button
            onClick={() => setShowSignin(true)}
            className="flex-1 group relative overflow-hidden rounded-xl bg-gray-800/50 border-2 border-amber-400 hover:border-purple-400 text-gray-100 font-semibold py-6 px-8 transition-all duration-300 shadow-2xl"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">✨</span>
              <span className="text-xl">No plan yet, start fresh</span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Answer 3 questions or dictate your dream trip
            </div>
          </motion.button>
        </div>

        {/* Voice Dictation */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-4">Or speak your plans aloud:</p>
          <motion.button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse'
                : 'bg-gradient-to-r from-purple-500 to-amber-400 hover:scale-110'
            }`}
            whileTap={{ scale: 0.95 }}
            aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
          >
            🎙️
          </motion.button>

          {transcript && (
            <motion.div
              className="mt-4 p-4 bg-gray-800/50 border border-purple-400/30 rounded-xl max-w-md mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-gray-400 mb-1">Transcribed:</p>
              <p className="text-center text-gray-200">"{transcript}"</p>
              <button
                onClick={handleVoiceSubmit}
                className="mt-2 px-4 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                Use this plan
              </button>
            </motion.div>
          )}
        </div>

        {/* Features Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="text-2xl mb-1">🌤️</div>
            <div className="text-sm text-gray-300">Weather Packing</div>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="text-2xl mb-1">🎙️</div>
            <div className="text-sm text-gray-300">Voice Dictation</div>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-sm text-gray-300">Family Sharing</div>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-sm text-gray-300">Budget Tips</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="text-center text-sm text-gray-500 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="mb-2">Available in 50+ languages • No signup required to start planning</p>
          <div className="mt-3">
            <span className="text-xs">🌐 Currently viewing: </span>
            <span className="font-medium text-amber-400">{currentDestination.name}, {currentDestination.country}</span>
          </div>
        </motion.footer>
      </div>

      {/* Signin Modal */}
      <SigninModal isOpen={showSignin} onClose={() => setShowSignin(false)} />
    </div>
  );
}