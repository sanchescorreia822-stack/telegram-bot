const { loadHistory, saveHistory } = require("./history");
const { CHECK_INTERVAL } = require("./config");

// 🔥 substitui isto depois por API real
function getRealResult() {
  return Math.random() > 0.5 ? "blue" : "red";
}

function startResultChecker() {
  setInterval(() => {
    const history = loadHistory();

    const index = history.findIndex(h => h.status === "PENDING");

    if (index === -1) return;

    const result = getRealResult();

    const item = history[index];

    item.result = result;
    item.status = "DONE";
    item.win = item.signal === result;

    saveHistory(history);

    console.log("📊 CLOSED:", item);

  }, CHECK_INTERVAL);
}

module.exports = { startResultChecker };