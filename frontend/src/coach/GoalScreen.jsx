import { motion } from "framer-motion";
import { Table2, FileSpreadsheet, LayoutDashboard, Search, BarChart2, Palette, ArrowLeft, Zap } from "lucide-react";
import { GOALS } from "./data";

const ICONS = { Table2, FileSpreadsheet, LayoutDashboard, Search, BarChart2, Palette };

export default function GoalScreen({ onSelect, onBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden px-6 py-16">
      <div className="absolute top-[-20%] right-[5%] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-10 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap size={16} className="text-violet-400" />
            <span className="text-violet-400 text-sm font-medium uppercase tracking-widest">Step 1 of 3</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            What do you want to learn?
          </h2>
          <p className="text-gray-500 text-lg">Choose a goal and your AI Coach will guide you through it.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GOALS.map((goal, i) => {
            const Icon = ICONS[goal.icon];
            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goal.active && onSelect(goal.id)}
                className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-200 ${
                  goal.active
                    ? "border-violet-500/40 bg-violet-500/10 hover:border-violet-400/60 hover:bg-violet-500/15 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                    : "border-white/5 bg-white/3 cursor-not-allowed opacity-40"
                }`}
              >
                {goal.active && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                )}
                <div className={`p-2.5 rounded-xl ${goal.active ? "bg-violet-500/20" : "bg-white/5"}`}>
                  <Icon size={20} className={goal.active ? "text-violet-400" : "text-gray-600"} />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm mb-0.5">{goal.label}</div>
                  <div className="text-gray-500 text-xs">{goal.desc}</div>
                </div>
                {!goal.active && (
                  <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mt-1">Soon</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
