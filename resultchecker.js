const { loadHistory, resolveSignal } = require("./history");
const { checkResultFromSource } = require("./resultSource");

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

      const actualResult = await checkResultFromSource();

      if (!actualResult) {
        isRunning = false;
        return;
      }

      for (const signal of pendingSignals) {
        resolveSignal(signal.index, actualResult);
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