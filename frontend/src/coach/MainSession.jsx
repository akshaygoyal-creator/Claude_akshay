import { useState } from "react";
import { motion } from "framer-motion";
import MockSheets from "./MockSheets";
import AICoachPanel from "./AICoachPanel";
import SuccessScreen from "./SuccessScreen";

// step: 1=waiting for Data, 2=waiting for PivotTable, 3=DataRange, 4=Rows, 5=Values, 6=done
export default function MainSession({ onRestart }) {
  const [step, setStep] = useState(1);
  const [lastWrongAction, setLastWrongAction] = useState(null);
  const [complete, setComplete] = useState(false);

  const handleMenuClick = (action) => {
    if (step === 1) {
      if (action === "Data") {
        setLastWrongAction(null);
        setStep(2);
      } else {
        setLastWrongAction(action);
        // keep step 1 but re-trigger coach
        setStep((s) => (s === 1 ? 1.1 : 1));
        setTimeout(() => setStep(1), 50);
      }
    } else if (step === 2 && action === "PivotTable") {
      setStep(3);
    } else if (step === 3 && action === "DataRange") {
      setStep(4);
    } else if (step === 4 && action === "Rows") {
      setStep(5);
    } else if (step === 5 && action === "Values") {
      setStep(6);
      setTimeout(() => setComplete(true), 1800);
    }
  };

  if (complete) return <SuccessScreen onRestart={onRestart} />;

  // Which menu to glow
  const highlightMenu = step === 1 ? "Data" : null;

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#0a0a14]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shadow-[0_0_12px_rgba(139,92,246,0.4)]">
            AI
          </div>
          <span className="text-white font-semibold text-sm">AI Product Coach</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Session Active</span>
        </div>
        <button
          onClick={onRestart}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Exit Session
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Left: Mock Sheets 70% */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-[7] relative"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <MockSheets
            step={step}
            onMenuClick={handleMenuClick}
            highlightMenu={highlightMenu}
          />
        </motion.div>

        {/* Right: AI Coach Panel 30% */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-[3]"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <AICoachPanel
            step={step}
            lastAction={lastWrongAction}
          />
        </motion.div>
      </div>
    </div>
  );
}
