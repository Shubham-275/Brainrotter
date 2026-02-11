import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Brainrotter",
  description: "Frequently asked questions about Brainrotter.",
};

const faqs = [
  {
    question: "What is Brainrotter?",
    answer:
      "Brainrotter is an AI-powered meme generator. You type any message and our AI web agents will automatically find the perfect meme template, fill in captions, and generate a meme for you.",
  },
  {
    question: "How does the meme generation work?",
    answer:
      "We use TinyFish web agents to automate browser navigation on imgflip.com. The AI agent browses meme templates, selects the most fitting one for your message, fills in the caption text boxes, and generates the final meme image.",
  },
  {
    question: "What is TinyFish?",
    answer:
      "TinyFish is a web agents API that lets you treat real websites like programmable surfaces. Instead of dealing with headless browsers and selectors, you call a single API with a goal and some URLs and get back structured results. Learn more at tinyfish.ai.",
  },
  {
    question: "Is it free to use?",
    answer:
      "The application itself is open source. However, you need a TinyFish API key to power the meme generation. Check tinyfish.ai for their pricing and free tier information.",
  },
  {
    question: "Can I watch the AI agent create my meme?",
    answer:
      "Yes! TinyFish provides a streaming URL that shows a live view of the browser session. When the agent is working, you can click 'show live view' to watch it navigate, select templates, and fill in captions in real-time.",
  },
  {
    question: "How many memes are generated per request?",
    answer:
      "By default, Brainrotter generates 2 memes concurrently using different template source pages. This gives you variety in the results. You can adjust the MAX_CONCURRENT_MEMES constant in the configuration.",
  },
  {
    question: "Where are the meme images hosted?",
    answer:
      "The generated memes are hosted on imgflip.com's servers. We extract the direct image URL after generation, so the images are served from imgflip's CDN.",
  },
  {
    question: "Can I self-host this?",
    answer:
      "Yes. Clone the repository, set up your environment variables (mainly your TINYFISH_API_KEY), and deploy to any platform that supports Next.js (Vercel, Railway, etc.). See the Docs page for detailed setup instructions.",
  },
  {
    question: "What happens to my recently generated memes?",
    answer:
      "Recent memes are stored in your browser's localStorage. They persist across page refreshes but are local to your browser. We don't store your memes on any server.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen p-8 sm:p-16">
      <main className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#EF3604] hover:underline mb-8 inline-block"
        >
          &larr; Back to Generator
        </Link>

        <h1 className="text-4xl font-bold text-[#1a1b1e] dark:text-white mb-8">
          Frequently Asked Questions
        </h1>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5"
            >
              <h2 className="text-lg font-semibold text-[#1a1b1e] dark:text-white mb-2">
                {faq.question}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
