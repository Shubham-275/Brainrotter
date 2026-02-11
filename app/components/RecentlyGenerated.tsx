"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface RecentMeme {
  index: number;
  imageUrl: string;
  templateName: string;
  query: string;
  timestamp: number;
}

interface RecentlyGeneratedProps {
  recentMemes: RecentMeme[];
}

export default function RecentlyGenerated({
  recentMemes,
}: RecentlyGeneratedProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (recentMemes.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Recently Generated
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recentMemes.map((meme, i) => (
          <motion.div
            key={`${meme.timestamp}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              {!imageErrors.has(i) ? (
                <Image
                  src={meme.imageUrl}
                  alt={meme.templateName}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() =>
                    setImageErrors((prev) => new Set(prev).add(i))
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Image unavailable
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {meme.templateName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                &quot;{meme.query}&quot;
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
