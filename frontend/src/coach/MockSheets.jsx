import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Grid3X3, Bold, Italic, AlignLeft, AlignCenter, DollarSign, Percent, Plus, Minus, Type } from "lucide-react";
import { MENUS, SPREADSHEET_DATA } from "./data";

const PIVOT_DATA = [
  ["Region", "Sum of Sales", "Sum of Units"],
  ["East", 29000, 290],
  ["North", 37800, 378],
  ["South", 29300, 293],
  ["West", 14200, 142],
  ["Grand Total", 110300, 1103],
];

export default function MockSheets({ step, onMenuClick, highlightMenu }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showPivotDialog, setShowPivotDialog] = useState(false);
  const [showRangeDialog, setShowRangeDialog] = useState(false);
  const [showRowsDialog, setShowRowsDialog] = useState(false);
  const [showPivotTable, setShowPivotTable] = useState(false);
  const [selectedCell, setSelectedCell] = useState("A1");

  useEffect(() => {
    if (step === 2) { setShowPivotDialog(true); setOpenMenu(null); }
    if (step === 3) { setShowPivotDialog(false); setShowRangeDialog(true); }
    if (step === 4) { setShowRangeDialog(false); setShowRowsDialog(true); }
    if (step === 5) { setShowRowsDialog(false); }
    if (step >= 6) { setShowPivotTable(true); }
  }, [step]);

  const handleMenuClick = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
    if (menu !== "Data") {
      onMenuClick(menu);
    }
  };

  const handleDataMenuOption = (option) => {
    setOpenMenu(null);
    onMenuClick(option);
  };

  return (
    <div className="flex flex-col h-full bg-[#1c1c28] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#16161f] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Grid3X3 size={14} className="text-green-400" />
          <span className="text-sm text-gray-300 font-medium">Sales Data Q1 2024.xlsx — Google Sheets</span>
        </div>
      </div>

      {/* Menu bar */}
      <div className="flex items-center gap-0 px-2 py-1 bg-[#1a1a25] border-b border-white/5 relative z-30">
        {MENUS.map((menu) => {
          const isHighlighted = highlightMenu === menu;
          return (
            <div key={menu} className="relative">
              <motion.button
                onClick={() => handleMenuClick(menu)}
                animate={isHighlighted ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: isHighlighted ? Infinity : 0, duration: 1.5 }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all relative ${
                  openMenu === menu
                    ? "bg-white/15 text-white"
                    : isHighlighted
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                {isHighlighted && (
                  <motion.div
                    className="absolute inset-0 rounded-md"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ background: "rgba(139,92,246,0.25)", boxShadow: "0 0 12px rgba(139,92,246,0.6)" }}
                  />
                )}
                <span className="relative z-10">{menu}</span>
              </motion.button>

              {/* Data dropdown */}
              <AnimatePresence>
                {openMenu === "Data" && menu === "Data" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-52 bg-[#1e1e2e] border border-white/15 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {["Sort range", "Filter views", ""].map((item, i) =>
                      item ? (
                        <button key={i} className="w-full px-4 py-2 text-xs text-gray-400 hover:bg-white/5 text-left transition-colors">
                          {item}
                        </button>
                      ) : (
                        <div key={i} className="border-t border-white/5" />
                      )
                    )}
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(139,92,246,0.2)" }}
                      onClick={() => handleDataMenuOption("PivotTable")}
                      className="w-full px-4 py-2.5 text-xs text-violet-300 font-semibold text-left flex items-center gap-2 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      Pivot Table
                    </motion.button>
                    {["Named ranges", "Protected sheets"].map((item) => (
                      <button key={item} className="w-full px-4 py-2 text-xs text-gray-400 hover:bg-white/5 text-left transition-colors">
                        {item}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other menus dropdown (generic) */}
              <AnimatePresence>
                {openMenu === menu && menu !== "Data" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full left-0 mt-1 w-44 bg-[#1e1e2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {["Option 1", "Option 2", "Option 3"].map((opt) => (
                      <button
                        key={opt}
                        className="w-full px-4 py-2 text-xs text-gray-400 hover:bg-white/5 text-left transition-colors"
                        onClick={() => setOpenMenu(null)}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a25] border-b border-white/5">
        <div className="flex items-center gap-0.5 bg-white/5 rounded px-2 py-1 mr-2">
          <span className="text-xs text-gray-400 font-mono">{selectedCell}</span>
        </div>
        <div className="w-px h-5 bg-white/10 mx-1" />
        {[Bold, Italic, AlignLeft, AlignCenter, DollarSign, Percent].map((Icon, i) => (
          <button key={i} className="p-1.5 rounded hover:bg-white/8 text-gray-500 hover:text-gray-300 transition-colors">
            <Icon size={13} />
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <div className="flex items-center gap-0.5">
          <button className="p-1 rounded hover:bg-white/8 text-gray-500"><Minus size={12} /></button>
          <span className="text-xs text-gray-400 px-1">100%</span>
          <button className="p-1 rounded hover:bg-white/8 text-gray-500"><Plus size={12} /></button>
        </div>
        <button className="ml-auto p-1.5 rounded hover:bg-white/8 text-gray-500 flex items-center gap-1 text-xs">
          <Type size={12} /> <ChevronDown size={10} />
        </button>
      </div>

      {/* Spreadsheet area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto relative">
          {!showPivotTable ? (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="w-8 bg-[#16161f] border-r border-b border-white/5 sticky top-0 left-0 z-10" />
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map((col) => (
                    <th key={col} className="min-w-[100px] bg-[#16161f] border-r border-b border-white/5 py-1.5 text-gray-500 font-medium sticky top-0 text-center">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPREADSHEET_DATA.map((row, ri) => (
                  <tr key={ri} className="hover:bg-white/[0.02]">
                    <td className="bg-[#16161f] border-r border-b border-white/5 text-center text-gray-600 py-1.5 sticky left-0 text-[11px]">
                      {ri + 1}
                    </td>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        onClick={() => setSelectedCell(`${String.fromCharCode(65 + ci)}${ri + 1}`)}
                        className={`border-r border-b border-white/5 px-2 py-1.5 cursor-cell transition-colors ${
                          ri === 0 ? "text-gray-200 font-semibold bg-violet-500/5" : "text-gray-400"
                        } ${selectedCell === `${String.fromCharCode(65 + ci)}${ri + 1}` ? "bg-violet-500/15 text-white" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6"
            >
              <div className="mb-4 text-sm font-semibold text-gray-300">Pivot Table 1</div>
              <table className="border-collapse text-xs">
                {PIVOT_DATA.map((row, ri) => (
                  <tr key={ri} className={ri === 0 || ri === PIVOT_DATA.length - 1 ? "bg-violet-500/10" : "hover:bg-white/[0.02]"}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border border-white/10 px-4 py-2 ${
                          ri === 0 || ci === 0 ? "font-semibold text-gray-200" : "text-gray-400"
                        } ${ri === PIVOT_DATA.length - 1 ? "font-bold text-white" : ""}`}
                      >
                        {typeof cell === "number" ? cell.toLocaleString() : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </table>
            </motion.div>
          )}
        </div>
      </div>

      {/* Pivot Table Dialog */}
      <AnimatePresence>
        {showPivotDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              className="bg-[#1e1e2e] border border-white/15 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <h3 className="text-white font-semibold text-base mb-2">Create Pivot Table</h3>
              <p className="text-gray-400 text-sm mb-5">Select where to place your pivot table</p>
              <div className="space-y-2 mb-5">
                {["New sheet", "Existing sheet"].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-violet-400" : "border-white/20"}`}>
                      {i === 0 && <div className="w-2 h-2 rounded-full bg-violet-400" />}
                    </div>
                    <span className="text-gray-300 text-sm">{opt}</span>
                  </label>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDataMenuOption("DataRange")}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
              >
                Create
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Range Dialog */}
      <AnimatePresence>
        {showRangeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              className="bg-[#1e1e2e] border border-white/15 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <h3 className="text-white font-semibold text-base mb-4">Select Data Range</h3>
              <div className="bg-white/5 border border-violet-400/40 rounded-xl px-4 py-3 text-violet-300 text-sm font-mono mb-5 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                Sheet1!A1:E11
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDataMenuOption("Rows")}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
              >
                Confirm Range
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rows/Values side panel */}
      <AnimatePresence>
        {showRowsDialog && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-56 bg-[#1a1a27] border-l border-white/10 p-4 z-30 flex flex-col"
          >
            <h3 className="text-white font-semibold text-sm mb-4">Pivot Table Editor</h3>
            <div className="space-y-3 flex-1">
              {[
                { label: "Rows", hint: step === 4 ? "Click Region ↓" : "Region", active: step === 4 },
                { label: "Columns", hint: "—", active: false },
                { label: "Values", hint: step === 5 ? "Click SUM ↓" : "SUM of Sales", active: step === 5 },
                { label: "Filters", hint: "—", active: false },
              ].map(({ label, hint, active }) => (
                <div key={label} className={`rounded-xl border p-3 transition-all ${active ? "border-violet-400/50 bg-violet-500/10" : "border-white/8 bg-white/3"}`}>
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  {active ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDataMenuOption(label)}
                      className="w-full text-xs text-violet-300 font-medium py-1 px-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
                    >
                      {hint}
                    </motion.button>
                  ) : (
                    <div className="text-xs text-gray-400">{hint}</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#16161f] border-t border-white/5">
        <button className="px-3 py-1 rounded text-xs bg-[#1e1e2e] text-gray-300 border border-white/10">Sheet1</button>
        {showPivotTable && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-1 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30"
          >
            Pivot Table 1
          </motion.button>
        )}
        <button className="ml-1 text-gray-600 hover:text-gray-400 text-lg leading-none">+</button>
      </div>
    </div>
  );
}
