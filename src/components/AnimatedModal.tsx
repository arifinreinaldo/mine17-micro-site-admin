'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function AnimatedModal({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                duration: 0.25,
              }}
              className={`relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 ${maxWidth} w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Success feedback animation component
export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
      >
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// Error shake animation hook helper
export function useShakeAnimation(trigger: boolean) {
  return {
    animate: trigger
      ? {
          x: [0, -6, 6, -6, 6, 0],
          transition: { duration: 0.3 },
        }
      : {},
  };
}

// Staggered list animation variants
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};
