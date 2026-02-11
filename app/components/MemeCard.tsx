"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Download, Share2, ExternalLink } from "lucide-react";

interface MemeCardProps {
  imageUrl: string;
  templateName: string;
  index: number;
  total: number;
}

export default function MemeCard({
  imageUrl,
  templateName,
  index,
  total,
}: MemeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brainrotter-${templateName.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${templateName} - Brainrotter`,
          text: "Check out this meme I generated with Brainrotter!",
          url: imageUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(imageUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 rounded-lg bg-[#F8E3C4] dark:bg-gray-800 shadow-sm border border-[#E8D3B4] dark:border-gray-700 group"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[60%]">
          {templateName}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Meme {index + 1}/{total}
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="aspect-square animate-pulse bg-gray-300 dark:bg-gray-600" />
            )}
            <Image
              src={imageUrl}
              alt={templateName || "Generated meme"}
              width={800}
              height={800}
              className={`rounded-lg w-full transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
          </>
        ) : (
          <div className="aspect-square flex items-center justify-center text-gray-400">
            <div className="text-center p-4">
              <p className="text-sm mb-2">Image failed to load</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#EF3604] hover:underline flex items-center gap-1 justify-center"
              >
                Open directly <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Download size={12} />
          Download
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Share2 size={12} />
          Share
        </button>
      </div>
    </motion.div>
  );
}
