import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    color: ["#8b5cf6", "#6366f1", "#a78bfa", "#c4b5fd", "#e879f9", "#f0abfc"][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function SuccessScreen({ onRestart }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {showConfetti && <Confetti />}

      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-violet-600/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] bg-indigo-600/12 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(139,92,246,0.6)]"
        >
          <Trophy size={44} className="text-white" />
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-1 mb-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
            >
              <Sparkles size={20} className="text-yellow-400" />
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          Congratulations!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-gray-400 text-lg mb-3 leading-relaxed"
        >
          You've built your first Pivot Table in Google Sheets.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-500 text-sm mb-10"
        >
          You completed 5 steps in under 3 minutes — just like a pro!
        </motion.p>

        {/* AI suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="w-full bg-violet-500/10 border border-violet-500/25 rounded-2xl p-5 mb-8 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
              AI
            </div>
            <div>
              <div className="text-white text-sm font-medium mb-1">Your AI Coach says:</div>
              <div className="text-gray-400 text-sm leading-relaxed">
                Amazing work! 🎉 Your Pivot Table is ready. Would you like to learn{" "}
                <span className="text-violet-300 font-medium">Conditional Formatting</span> next? It'll help you
                highlight patterns in your Pivot Table automatically.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-6 mb-10"
        >
          {[
            { label: "Steps Completed", value: "5/5" },
            { label: "Mistakes Made", value: "1" },
            { label: "Time Taken", value: "~2 min" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
              <div className="text-[11px] text-gray-600">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex gap-3"
        >
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/8 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/12 transition-colors"
          >
            <RotateCcw size={15} /> Try Again
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all">
            Next: Conditional Formatting <ArrowRight size={15} />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
