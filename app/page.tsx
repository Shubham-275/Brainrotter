"use client";

import { FormEvent, useState, useEffect } from "react";
import MemeSkeleton from "./components/MemeSkeleton";
import MemeCard from "./components/MemeCard";
import Logo from "./components/Logo";
import MemeProgress from "./components/MemeProgress";
import MemeCounter from "./components/MemeCounter";
import RecentlyGenerated from "./components/RecentlyGenerated";
import GenerationInfo from "./components/GenerationInfo";
import StreamViewer from "./components/StreamViewer";
import StickyFooter from "./components/StickyFooter";
import { MAX_CONCURRENT_MEMES } from "./config/constants";
import { motion } from "framer-motion";
import Link from "next/link";

const EXAMPLE_PROMPTS = [
  "When the code works on first try",
  "Monday morning standup meetings",
  "Deploying to production on Friday",
  "My brain at 3am vs during meetings",
  "When someone says 'quick fix'",
  "AI replacing my job but I'm the AI",
];

const SAMPLE_MEMES = [
  { name: "Drake Hotline Bling", emoji: "🎵", color: "from-yellow-400 to-orange-500" },
  { name: "Distracted Boyfriend", emoji: "👀", color: "from-pink-400 to-red-500" },
  { name: "Two Buttons", emoji: "😰", color: "from-blue-400 to-indigo-500" },
  { name: "Change My Mind", emoji: "🤔", color: "from-green-400 to-teal-500" },
  { name: "Expanding Brain", emoji: "🧠", color: "from-purple-400 to-violet-500" },
  { name: "Always Has Been", emoji: "🔫", color: "from-cyan-400 to-blue-500" },
];

interface Meme {
  index: number;
  imageUrl: string;
  templateName: string;
}

interface LoadingState {
  index: number;
  steps: string[];
  streamingUrl?: string;
  isComplete?: boolean;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>(
    Array(MAX_CONCURRENT_MEMES)
      .fill(null)
      .map((_, index) => ({ index, steps: [] }))
  );
  const [recentMemes, setRecentMemes] = useState<
    (Meme & { query: string; timestamp: number })[]
  >([]);
  const [successfulMemes, setSuccessfulMemes] = useState(0);
  const [streamingUrls, setStreamingUrls] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [allSessionsComplete, setAllSessionsComplete] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("recentMemes");
    if (saved) {
      try {
        setRecentMemes(JSON.parse(saved));
      } catch {
        // Ignore invalid data
      }
    }
  }, []);

  useEffect(() => {
    const urls = loadingStates
      .map((state) => state.streamingUrl)
      .filter((url): url is string => !!url);
    setStreamingUrls(urls);
  }, [loadingStates]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setMemes([]);
    setIsLoading(true);
    setSubmittedQuery(message);
    setSuccessfulMemes(0);
    setActiveSessions(MAX_CONCURRENT_MEMES);
    setAllSessionsComplete(false);
    setLoadingStates(
      Array(MAX_CONCURRENT_MEMES)
        .fill(null)
        .map((_, index) => ({ index, steps: [] }))
    );

    let firstResponseReceived = false;

    const apiCalls = Array(MAX_CONCURRENT_MEMES)
      .fill(null)
      .map((_, index) =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, sourceType: index }),
        })
          .then(async (res) => {
            const reader = res.body?.getReader();
            if (!reader) throw new Error("No reader available");

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "streamingUrl") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? { ...state, streamingUrl: data.url }
                          : state
                      )
                    );
                  } else if (data.type === "step") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? {
                              ...state,
                              steps: [...state.steps, data.message],
                            }
                          : state
                      )
                    );
                  } else if (data.type === "complete") {
                    const result: Meme = {
                      index: data.index,
                      imageUrl: data.imageUrl,
                      templateName: data.templateName,
                    };

                    setMemes((prev) => [...prev, result]);
                    setSuccessfulMemes((prev) =>
                      Math.min(prev + 1, MAX_CONCURRENT_MEMES)
                    );
                    setActiveSessions((prev) => Math.max(0, prev - 1));
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? { ...state, isComplete: true }
                          : state
                      )
                    );

                    const newMeme = {
                      ...result,
                      query: message,
                      timestamp: Date.now(),
                    };
                    const existing = JSON.parse(
                      localStorage.getItem("recentMemes") || "[]"
                    );
                    const updated = [newMeme, ...existing].slice(0, 12);
                    localStorage.setItem(
                      "recentMemes",
                      JSON.stringify(updated)
                    );
                    setRecentMemes(updated);

                    if (!firstResponseReceived) {
                      firstResponseReceived = true;
                      setIsLoading(false);
                    }
                  } else if (data.type === "error") {
                    setLoadingStates((prev) =>
                      prev.map((state) =>
                        state.index === index
                          ? {
                              ...state,
                              steps: [
                                ...state.steps,
                                `Error: ${data.message}`,
                              ],
                              isComplete: true,
                            }
                          : state
                      )
                    );
                    setActiveSessions((prev) => Math.max(0, prev - 1));
                  }
                } catch {
                  // Not valid JSON, skip
                }
              }
            }
          })
          .catch((error) => {
            console.error(`Error in session ${index}:`, error);
            setActiveSessions((prev) => Math.max(0, prev - 1));
            setLoadingStates((prev) =>
              prev.map((state) =>
                state.index === index
                  ? {
                      ...state,
                      steps: [...state.steps, "Connection error"],
                      isComplete: true,
                    }
                  : state
              )
            );
          })
      );

    try {
      await Promise.all(apiCalls);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setMessage("");
      setAllSessionsComplete(true);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden noise-overlay">
        <div className="animated-gradient absolute inset-0 opacity-[0.06]" />
        <div className="relative px-6 pt-10 pb-8 sm:px-16 sm:pt-16 sm:pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#1a1b1e] dark:text-white leading-[0.9]">
                  <span className="block text-lg sm:text-xl font-medium tracking-widest text-gray-500 dark:text-gray-400 mb-2 uppercase">
                    Welcome to
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    <Link href="https://www.tinyfish.ai" target="_blank" className="animate-float inline-block">
                      <Logo className="h-12 sm:h-16 lg:h-20 w-12 sm:w-16 lg:w-20 text-[#1a1b1e] dark:text-white" />
                    </Link>
                    <span className="bg-gradient-to-r from-[#EF3604] via-[#FF6B3D] to-[#EF3604] bg-clip-text text-transparent">
                      RAINROTTER
                    </span>
                  </span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-3"
              >
                <MemeCounter />
              </motion.div>

              {/* Floating emojis decoration */}
              <div className="absolute top-8 left-[10%] text-3xl animate-float opacity-60 hidden sm:block">
                🧠
              </div>
              <div className="absolute top-16 right-[12%] text-2xl animate-float-delayed opacity-50 hidden sm:block">
                💀
              </div>
              <div className="absolute bottom-12 left-[15%] text-2xl animate-float-delayed opacity-40 hidden lg:block">
                🔥
              </div>
              <div className="absolute bottom-8 right-[18%] text-3xl animate-float opacity-50 hidden lg:block">
                😭
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Section */}
      <div className="px-6 sm:px-16 -mt-2">
        <div className="max-w-2xl mx-auto">
          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              Have something to say? 💬
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Type anything and we&apos;ll make memes from it
            </p>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type anything..."
                className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3 text-sm sm:text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EF3604] focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                disabled={isLoading || !allSessionsComplete}
              />
              <motion.button
                type="submit"
                disabled={!message.trim() || isLoading || !allSessionsComplete}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="animated-gradient px-6 sm:px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-lg shadow-[#EF3604]/25 hover:shadow-xl hover:shadow-[#EF3604]/30 active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  GENERATE
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    >
                      ⚡
                    </motion.span>
                  )}
                </motion.span>
              </motion.button>
            </form>

            {/* Example Prompts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.slice(0, isMobile ? 3 : 6).map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => setMessage(prompt)}
                  disabled={isLoading || !allSessionsComplete}
                  className="px-3 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#EF3604]/10 hover:text-[#EF3604] dark:hover:text-[#FF6B3D] transition-colors border border-gray-200 dark:border-gray-700 hover:border-[#EF3604]/30 disabled:opacity-50"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>

            <GenerationInfo isVisible={isLoading} />

            {/* Progress bar */}
            <div className="mt-6">
              <MemeProgress
                current={successfulMemes}
                total={MAX_CONCURRENT_MEMES}
              />
            </div>

            {/* Stream viewer */}
            <StreamViewer
              streamingUrls={streamingUrls}
              activeSessions={activeSessions}
            />
          </motion.div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {loadingStates.map((state) => (
                  <MemeSkeleton
                    key={`loading-${state.index}`}
                    steps={state.steps}
                    index={state.index}
                    streamingUrl={state.streamingUrl}
                    isComplete={state.isComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && memes.length > 0 && (
            <>
              <div className="mt-8 mb-4 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#EF3604]/10 text-sm text-[#EF3604] font-medium">
                  Results for: &quot;{submittedQuery}&quot;
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {memes.map((meme, i) => (
                  <MemeCard
                    key={`${meme.index}-${i}`}
                    imageUrl={meme.imageUrl}
                    templateName={meme.templateName}
                    index={i}
                    total={MAX_CONCURRENT_MEMES}
                  />
                ))}
                {Array(MAX_CONCURRENT_MEMES)
                  .fill(null)
                  .map((_, i) => {
                    if (memes.find((m) => m.index === i)) return null;
                    return (
                      <MemeSkeleton
                        key={`remaining-${i}`}
                        steps={loadingStates[i]?.steps || []}
                        index={i}
                        streamingUrl={loadingStates[i]?.streamingUrl}
                        isComplete={loadingStates[i]?.isComplete}
                      />
                    );
                  })}
              </div>
            </>
          )}

          {/* Recent memes */}
          <RecentlyGenerated recentMemes={recentMemes} />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 sm:px-16 mt-16 mb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#1a1b1e] dark:text-white mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", icon: "✍️", title: "Type anything", desc: "Enter any thought, feeling, or random idea" },
              { step: "2", icon: "🤖", title: "AI agents deploy", desc: "TinyFish web agents browse imgflip.com" },
              { step: "3", icon: "🎯", title: "Template matched", desc: "AI picks the perfect meme for your vibe" },
              { step: "4", icon: "🎉", title: "Meme generated!", desc: "Captions filled & meme created instantly" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 text-center group hover:border-[#EF3604]/30 transition-colors"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full animated-gradient text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <div className="text-3xl mb-2 mt-1">{item.icon}</div>
                <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Templates Showcase */}
      <div className="px-6 sm:px-16 mt-8 mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#1a1b1e] dark:text-white mb-2">
            Popular Templates
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Our AI agents pick from thousands of trending meme templates
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SAMPLE_MEMES.map((meme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                className={`aspect-square rounded-2xl bg-gradient-to-br ${meme.color} flex flex-col items-center justify-center p-3 cursor-default shadow-md hover:shadow-lg transition-shadow`}
              >
                <span className="text-3xl sm:text-4xl mb-1">{meme.emoji}</span>
                <span className="text-[9px] sm:text-[10px] text-white/90 font-medium text-center leading-tight">
                  {meme.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrolling Marquee */}
      <div className="overflow-hidden py-4 bg-[#EF3604]/5 border-y border-[#EF3604]/10">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-8 items-center">
              {[
                "🧠 BRAINROT", "💀 CERTIFIED", "🔥 FIRE MEMES", "😭 NO CAP",
                "⚡ AI POWERED", "🤖 WEB AGENTS", "🎯 AUTO GENERATED", "✨ INSTANT MEMES",
              ].map((text, i) => (
                <span
                  key={i}
                  className="text-sm font-bold text-[#EF3604]/40 dark:text-[#FF6B3D]/30 uppercase tracking-wider"
                >
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <StickyFooter />
    </div>
  );
}
