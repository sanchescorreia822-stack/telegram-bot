const fs = require("fs");

const FILE = "./history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];

  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🔥 evitar sinais duplicados seguidos
function isDuplicate(signal, history) {
  const last = history[history.length - 1];
  return last && last.signal === signal && last.status === "PENDING";
}

function addPendingSignal(signal) {
  const history = loadHistory();

  if (isDuplicate(signal, history)) {
    console.log("⚠️ DUPLICATE SIGNAL BLOCKED:", signal);
    return;
  }

  history.push({
    signal,
    result: null,
    status: "PENDING",
    win: null,
    time: Date.now(),
    league: "unknown"
  });

  saveHistory(history);
}

module.exports = {
  loadHistory,
  saveHistory,
  addPendingSignal
};