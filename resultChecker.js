const { loadHistory, resolveSignal } = require("./history");
const { sendSignal } = require("./telegram");

let isRunning = false;

function startResultChecker() {
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const history = loadHistory();

      const pendingSignals = history
        .map((h, index) => ({ ...h, index }))
        .filter(h => h.status === "PENDING");

      if (pendingSignals.length === 0) {
        isRunning = false;
        return;
      }

      // 🔥 RESULTADO SIMULADO (temporário)
      const actualResult = Math.random() > 0.5 ? "blue" : "red";

  for (const signal of pendingSignals) {
  resolveSignal(signal.index, actualResult);

  sendSignal({
    signal: actualResult,
    confidence: 85
  });

  console.log("📊 Resultado atualizado:", actualResult);
}
    } catch (err) {
      console.log("RESULT CHECK ERROR:", err);
    } finally {
      isRunning = false;
    }
  }, 10000);
}

module.exports = { startResultChecker };