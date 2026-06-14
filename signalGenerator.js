const { getGameState } = require("./footballStudioService");
const { addPendingSignal } = require("./history");

let lastRound = null;

async function generateSignal() {
  const data = await getGameState();

  if (!data) return;

  // 🔥 evita duplicação por round
  if (data.round === lastRound) return;

  lastRound = data.round;

  const result = data.prediction || data.signal;

  if (!result) return;

  console.log("📡 REAL SIGNAL:", result);

  addPendingSignal(result);
}

function startSignalGenerator() {
  setInterval(generateSignal, 5000); // rápido porque jogo é live
}

module.exports = { startSignalGenerator };