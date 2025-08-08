import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Code, Zap } from "lucide-react";
import { Button } from "./ui/button";

const codeSnippets = [
  {
    language: "Python",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
    output: "55",
    icon: "🐍",
  },
  {
    language: "JavaScript",
    code: `function isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log(isPalindrome("A man a plan a canal Panama"));`,
    output: "true",
    icon: "⚡",
  },
  {
    language: "Java",
    code: `public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
}`,
    output: "Array sorted!",
    icon: "☕",
  },
];

export function InteractiveCodePreview() {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
      setShowOutput(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setShowOutput(true);
    }, 1500);
  };

  const snippet = codeSnippets[currentSnippet];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <span className="text-slate-300 text-sm font-medium">
              {snippet.icon} {snippet.language}
            </span>
          </div>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
          >
            {isRunning ? (
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>

        {/* Code Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSnippet}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <pre className="text-slate-200 text-sm leading-relaxed overflow-x-auto">
              <code>{snippet.code}</code>
            </pre>

            {/* Output Terminal */}
            <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <Code className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-xs font-medium">
                  Output
                </span>
              </div>
              <AnimatePresence>
                {showOutput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-green-300 font-mono text-sm">
                      {snippet.output}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showOutput && (
                <span className="text-slate-500 text-sm">
                  Click run to see output...
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Language indicators */}
        <div className="flex space-x-2 mt-4">
          {codeSnippets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSnippet(index);
                setShowOutput(false);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSnippet
                  ? "bg-primary scale-125"
                  : "bg-slate-600 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
