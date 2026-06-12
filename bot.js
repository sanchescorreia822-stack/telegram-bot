const { analyzePattern } = require("./analyzer");
const { loadHistory, addPendingSignal } = require("./history");
const { sendSignal } = require("./telegram");

let lastSignalTime = 0;

function startBot() {
  console.log("🧠 Bot automático iniciado");
setInterval(() => {
  const history = loadHistory();

  console.log("HISTORY SIZE:", history.length);
  console.log("LAST RESULT SAMPLE:", history.slice(-5));

  const analysis = analyzePattern(history);

  console.log("ANALYSIS:", analysis);

if (!history || history.length === 0) {
  addPendingSignal("blue");
  console.log("TEST SIGNAL CREATED");
  return;
}
    if (!analysis) return;

    const now = Date.now();

    // ⛔ cooldown de 15s
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