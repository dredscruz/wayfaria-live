'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Destination data with colors and imagery
const destinations = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    colors: {
      primary: 'from-[#1a1a2e] via-[#2a2a4a] to-[#3a3a6a]',
      accent: 'rgba(93, 108, 177, 0.25)',
      particles: 'rgba(255, 228, 185, 0.5)',
    },
    elements: ['🌸', '🏯', '🎋', '🍃'],
    subtitle: 'Temples & Cherry Blossoms',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    colors: {
      primary: 'from-[#1a1a2e] via-[#3c3228] to-[#282818]',
      accent: 'rgba(255, 193, 7, 0.15)',
      particles: 'rgba(255, 193, 7, 0.4)',
    },
    elements: ['🗼', '🎨', '🍷', '🌹'],
    subtitle: 'City of Light & Art',
  },
  {
    id: 'iceland',
    name: 'Iceland',
    country: 'Iceland',
    colors: {
      primary: 'from-[#0a0f23] via-[#0f1932] to-[#1a2a4a]',
      accent: 'rgba(16, 185, 129, 0.2)',
      particles: 'rgba(93, 108, 177, 0.3)',
    },
    elements: ['🌋', '❄️', '🌌', '🐧'],
    subtitle: 'Land of Fire & Ice',
  },
];

interface DestinationBackgroundProps {
  onDestinationChange?: (dest: typeof destinations[0]) => void;
}

export default function DestinationBackground({ onDestinationChange }: DestinationBackgroundProps) {
  const [activeDest, setActiveDest] = useState(0);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  // Generate stars once on mount
  useEffect(() => {
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
    setStars(newStars);

    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Cycle destinations every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDest((prev) => {
        const next = (prev + 1) % destinations.length;
        onDestinationChange?.(destinations[next]);
        return next;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [onDestinationChange]);

  const currentDest = destinations[activeDest];

  return (
    <>
      <div className="fixed inset-0 z-0">
        {/* Starfield background */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((star) => (
            <motion.div
              key={`star-${star.id}`}
              className="absolute rounded-full bg-yellow-300"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: 0.7,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.4],
                scale: [0.8, 1, 0.9],
              }}
              transition={{
                duration: 2 + star.delay,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>

        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${currentDest.colors.primary.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')}`}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Destination-specific overlays */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDest.id}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {/* Aurora waves for Iceland */}
            {currentDest.id === 'iceland' && (
              <>
                <motion.div
                  className="absolute top-1/4 left-0 w-[200%] h-16 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
                  animate={{ x: ['-25%', '0%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'blur(3px)' }}
                />
                <motion.div
                  className="absolute top-2/5 left-0 w-[200%] h-10 bg-gradient-to-r from-transparent via-teal-400/25 to-transparent"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{ filter: 'blur(2px)' }}
                />
              </>
            )}

            {/* Floating elements */}
            {particles.map((p) => (
              <motion.div
                key={`particle-${currentDest.id}-${p.id}`}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: currentDest.colors.particles,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 0.7, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4 + p.delay,
                  delay: p.delay,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Mountain silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-3/4 pointer-events-none">
          <motion.div
            className="absolute bottom-0 left-[5%] w-[35%] h-[70%] bg-gray-950 opacity-70"
            style={{ clipPath: 'polygon(0% 100%, 50% 35%, 100% 100%)' }}
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute bottom-0 left-[60%] w-[40%] h-[65%] bg-gray-950 opacity-70"
            style={{ clipPath: 'polygon(0% 100%, 40% 45%, 100% 100%)' }}
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Destination indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
        {destinations.map((dest, idx) => (
          <motion.button
            key={dest.id}
            onClick={() => {
              setActiveDest(idx);
              onDestinationChange?.(dest);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              idx === activeDest
                ? 'bg-gold-400 text-gray-900 shadow-lg shadow-gold-400/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {dest.elements[0]} {dest.name}
          </motion.button>
        ))}
      </div>
    </>
  );
}

export { destinations };