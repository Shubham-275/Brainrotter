"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GenerationInfoProps {
  isVisible: boolean;
}

export default function GenerationInfo({ isVisible }: GenerationInfoProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex-shrink-0">
              <motion.div
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                TinyFish agents are browsing the web to create your memes...
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Each agent navigates imgflip.com, picks a template, fills in
                captions, and generates a meme.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
