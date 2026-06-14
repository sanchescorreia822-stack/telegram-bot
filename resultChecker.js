const { getGameState } = require("./footballStudioService");
const { loadHistory, saveHistory } = require("./history");
const { sendSignal } = require("./telegram");

let lastCheckedRound = null;

function startResultChecker() {
  setInterval(async () => {
    const state = await getGameState();
    if (!state || !state.round || !state.result) return;

    if (state.round === lastCheckedRound) return;
    lastCheckedRound = state.round;

    const history = loadHistory();
    const pending = history.find(h => h.status === "PENDING");

    if (!pending) return;

    pending.result = state.result;
    pending.status = "DONE";
    pending.win = pending.signal === state.result;

    saveHistory(history);

    sendSignal({
      signal: `Resultado: ${state.result} | ${pending.win ? "WIN ✅" : "LOSS ❌"}`,
      confidence: pending.confidence || 0
    });

    console.log("📊 CLOSED REAL:", pending);

  }, 5000);
}

module.exports = { startResultChecker };