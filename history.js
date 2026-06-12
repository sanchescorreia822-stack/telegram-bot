const fs = require("fs");

const FILE = "./fs_history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];

  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (err) {
    console.log("HISTORY LOAD ERROR:", err);
    return [];
  }
}
function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🔥 guardar sinal pendente
function addPendingSignal(signal) {
  console.log("SAVING SIGNAL:", signal);

  const history = loadHistory();

  history.push({
    signal,
    status: "PENDING",
    time: Date.now()
  });

  saveHistory(history);

  console.log("NEW HISTORY SIZE:", history.length);
}

// 🔥 atualizar resultado
function resolveSignal(index, result) {
  const history = loadHistory();

  const signal = history[index].signal;
  const win =
    String(signal).toLowerCase() ===
    String(result).toLowerCase();

  history[index].result = result;
  history[index].status = win ? "GREEN" : "RED";
  history[index].win = win;
  history[index].weight = win ? 1 : -1;

  saveHistory(history);
}



module.exports = {
  loadHistory,
  saveHistory,
  addPendingSignal,
  resolveSignal
};