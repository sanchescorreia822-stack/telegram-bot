const { loadHistory, saveHistory } = require("./history");
const { sendSignal } = require("./telegram");

const { getResult } = require("./FootballStudioService");

console.log("SERVICE:", require("./FootballStudioService"));
let lastCheckedRound = null;

function startResultChecker() {
  setInterval(async () => {
    sendSignal({
  signal: "TESTE",
  confidence: 100
});

const state = await getResult();
 console.log("STATE DEBUG:", state);  
 
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