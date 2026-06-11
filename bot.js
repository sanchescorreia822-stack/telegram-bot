const { analyzePattern } = require("./analyzer");
const { addPendingSignal } = require("./history");
const { sendSignal } = require("./telegram");

let lastSignalTime = 0;

function startBot() {
  console.log("🧠 Bot automático iniciado");

  setInterval(() => {
const { loadHistory } = require("./history");

const history = loadHistory();
const analysis = analyzePattern(history);

    if (!analysis) return;

    const now = Date.now();
    if (now - lastSignalTime < 15000) return;

    // 📩 envia sinal
    sendSignal({
      signal: analysis.signal,
      confidence: analysis.confidence
    });

    // 💾 guarda como PENDING
    addPendingSignal(analysis.signal);

    lastSignalTime = now;

    console.log("📩 Sinal enviado e guardado como PENDING");

  }, 5000);
}

module.exports = { startBot };