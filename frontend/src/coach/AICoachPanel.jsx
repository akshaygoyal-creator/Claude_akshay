import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, ChevronRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { STEPS, SUGGESTED_QUESTIONS, AI_MESSAGES } from "./data";

const STATUS_LABELS = [
  "● Observing your screen",
  "● Understanding your action",
  "● Waiting for your click",
  "● Nice!",
  "● Great progress",
  "● Analyzing…",
];

function TypingMessage({ text, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const i = useRef(0);

  useEffect(() => {
    i.current = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i.current + 1));
      i.current++;
      if (i.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  const renderText = (t) => {
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") ? (
        <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      ) : p
    );
  };

  return <span>{renderText(displayed)}{!done && <span className="inline-block w-1 h-4 bg-violet-400 ml-0.5 animate-pulse rounded-sm" />}</span>;
}

export default function AICoachPanel({ step, lastAction, onQuestionAsked }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const messagesEndRef = useRef(null);
  const lastStepRef = useRef(-1);

  const addMessage = (text, from = "ai") => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { text, from, id: Date.now() }]);
      setIsTyping(false);
    }, from === "ai" ? 400 : 0);
  };

  useEffect(() => {
    if (step === lastStepRef.current) return;
    lastStepRef.current = step;

    setStatus(Math.floor(Math.random() * STATUS_LABELS.length));

    if (step === 1 && messages.length === 0) {
      addMessage(AI_MESSAGES.welcome);
    } else if (step === 1 && lastAction) {
      addMessage(AI_MESSAGES.wrongMenu(lastAction));
    } else if (step === 2) {
      addMessage(AI_MESSAGES.clickedData);
    } else if (step === 3) {
      addMessage(AI_MESSAGES.clickedPivotTable);
    } else if (step === 4) {
      addMessage(AI_MESSAGES.dataRange);
    } else if (step === 5) {
      addMessage(AI_MESSAGES.rows);
    } else if (step >= 6) {
      addMessage(AI_MESSAGES.complete);
    }
  }, [step, lastAction]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    addMessage(q, "user");
    onQuestionAsked?.(q);

    const lower = q.toLowerCase();
    let answer = "Great question! Let me think about that...";
    if (lower.includes("pivot") || lower.includes("what is")) answer = AI_MESSAGES.whatIsPivot;
    else if (lower.includes("undo")) answer = AI_MESSAGES.canUndo;
    else if (lower.includes("row")) answer = AI_MESSAGES.whyRows;

    setTimeout(() => addMessage(answer), 800);
  };

  const completedSteps = step - 1;

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 bg-[#0d0d17]">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              AI
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-[#0d0d17]" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">AI Coach</div>
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-violet-400 font-medium"
            >
              {STATUS_LABELS[status]}
            </motion.div>
          </div>
        </div>

        {/* Goal */}
        <div className="bg-white/5 rounded-xl px-3 py-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current Goal</div>
          <div className="text-sm text-white font-medium">Create Pivot Table</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3 border-b border-white/8 bg-[#0d0d17]/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Progress</span>
          <span className="text-[10px] text-violet-400 font-medium">{Math.min(completedSteps, STEPS.length)} / {STEPS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: i < completedSteps ? "100%" : i === completedSteps - 1 ? "100%" : "0%" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            </div>
          ))}
        </div>
        {/* Steps list */}
        <div className="space-y-1">
          {STEPS.map((s, i) => {
            const done = i < completedSteps;
            const active = i === completedSteps && step <= STEPS.length;
            return (
              <motion.div
                key={s.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                  active ? "bg-violet-500/10" : ""
                }`}
              >
                {done ? (
                  <CheckCircle2 size={12} className="text-violet-400 shrink-0" />
                ) : active ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ChevronRight size={12} className="text-violet-400 shrink-0" />
                  </motion.div>
                ) : (
                  <Circle size={12} className="text-gray-700 shrink-0" />
                )}
                <span className={`text-[11px] ${done ? "text-gray-500 line-through" : active ? "text-white font-medium" : "text-gray-600"}`}>
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.from === "ai" && (
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5 mr-2">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.from === "user"
                    ? "bg-violet-600 text-white rounded-br-md"
                    : "bg-white/8 text-gray-300 rounded-bl-md border border-white/8"
                }`}
              >
                {msg.from === "ai" ? (
                  <TypingMessage text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
              AI
            </div>
            <div className="flex gap-1 px-3 py-2 rounded-2xl bg-white/8 border border-white/8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {step <= 3 && (
        <div className="px-4 py-2 border-t border-white/5">
          <div className="text-[10px] text-gray-600 mb-1.5">Ask me anything</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[10px] text-gray-400 border border-white/10 rounded-full px-2.5 py-1 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/8 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/8 bg-[#0d0d17]">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setVoiceActive(!voiceActive)}
            className={`p-2.5 rounded-xl transition-all ${
              voiceActive
                ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                : "bg-white/8 text-gray-400 hover:bg-white/12 hover:text-gray-200"
            }`}
          >
            {voiceActive ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                <Mic size={14} />
              </motion.div>
            ) : (
              <Mic size={14} />
            )}
          </motion.button>
          <div className="flex-1 flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your coach…"
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-violet-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
          >
            <Send size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
