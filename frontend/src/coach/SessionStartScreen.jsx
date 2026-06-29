import { motion } from "framer-motion";
import { ArrowLeft, Clock, Zap, Shield } from "lucide-react";

export default function SessionStartScreen({ onStart, onBack }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
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
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                AI
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0a0a0f]" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">Your AI Coach</div>
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Ready to guide you
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3 mb-8">
            {[
              "Great choice! I'll help you create your first Pivot Table.",
              "Estimated time: 3 minutes.",
              "You can ask me anything, anytime. I'll wait patiently while you perform each step.",
              "If you click something wrong — no worries! I'll gently redirect you.",
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="text-gray-300 text-base leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { icon: Clock, label: "~3 minutes" },
              { icon: Zap, label: "5 steps" },
              { icon: Shield, label: "Nothing is saved" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs"
              >
                <Icon size={11} className="text-violet-400" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_45px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            Start Session
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
