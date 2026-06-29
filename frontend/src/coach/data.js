export const STEPS = [
  { id: 1, label: "Open Data menu", menu: "Data" },
  { id: 2, label: "Click Pivot Table", menu: "PivotTable" },
  { id: 3, label: "Select Data Range", menu: "DataRange" },
  { id: 4, label: "Choose Rows", menu: "Rows" },
  { id: 5, label: "Choose Values", menu: "Values" },
];

export const MENUS = ["File", "Edit", "View", "Insert", "Format", "Data", "Tools", "Extensions", "Help"];

export const SPREADSHEET_DATA = [
  ["Region", "Product", "Sales", "Units", "Month"],
  ["North", "Widget A", 12400, 124, "Jan"],
  ["South", "Widget B", 8900, 89, "Jan"],
  ["East", "Widget A", 15600, 156, "Feb"],
  ["West", "Widget C", 6700, 67, "Feb"],
  ["North", "Widget B", 11200, 112, "Mar"],
  ["South", "Widget A", 9800, 98, "Mar"],
  ["East", "Widget C", 13400, 134, "Apr"],
  ["West", "Widget A", 7500, 75, "Apr"],
  ["North", "Widget C", 14200, 142, "May"],
  ["South", "Widget B", 10600, 106, "May"],
];

export const SUGGESTED_QUESTIONS = [
  "What is a Pivot Table?",
  "Can I undo this?",
  "Why do I need rows?",
];

export const GOALS = [
  { id: "pivot", icon: "Table2", label: "Create Pivot Table", desc: "Summarize data in seconds", active: true },
  { id: "csv", icon: "FileSpreadsheet", label: "Import CSV", desc: "Bring in external data", active: false },
  { id: "dashboard", icon: "LayoutDashboard", label: "Build Dashboard", desc: "Visualize key metrics", active: false },
  { id: "vlookup", icon: "Search", label: "VLOOKUP", desc: "Find data across sheets", active: false },
  { id: "charts", icon: "BarChart2", label: "Charts", desc: "Turn data into visuals", active: false },
  { id: "conditional", icon: "Palette", label: "Conditional Formatting", desc: "Highlight what matters", active: false },
];

export const AI_MESSAGES = {
  welcome: "Hi! Today we're creating your first Pivot Table in Google Sheets. I'll guide you through each step. Click the **Data** menu to begin — I'll wait.",
  wrongMenu: (menu) => `No worries! That's the **${menu}** menu. Click **Data** instead — it's ${menu === "Insert" ? "to the right" : "in the menu bar"}. You're almost there!`,
  clickedData: "Perfect! Now click **Pivot Table** from the dropdown.",
  clickedPivotTable: "Great! Now I'll help you **select your data range**. Click **Select Data Range** to continue.",
  dataRange: "Excellent! Your data range is set. Now let's choose your **Row field** — click on **Region** to group your data by region.",
  rows: "Amazing! Almost done. Now choose your **Values** — click **SUM of Sales** to see totals.",
  complete: "🎉 Congratulations! You've built your first Pivot Table! You can now see your sales data summarized by region. Would you like to learn **Conditional Formatting** next?",
  whatIsPivot: "A **Pivot Table** is like a magic summary machine. You have raw data with hundreds of rows, and a Pivot Table instantly groups, sums, and organizes it so you can spot patterns — like which region sells the most, or which product is trending. No formulas needed!",
  canUndo: "Absolutely! Press **Cmd+Z** (Mac) or **Ctrl+Z** (Windows) to undo any step. Google Sheets keeps a full history so you can always go back.",
  whyRows: "**Rows** define how your data is grouped. Choosing 'Region' as your row means each row in the Pivot Table will represent one region (North, South, East, West). It's the backbone of your summary!",
};
