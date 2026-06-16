const { getResult } = require("./FootballStudioService");
const { addPendingSignal } = require("./history");

let lastRound = null;

async function generateSignal() {
  const state = await getResult();

  if (!state) return;

  // evita duplicação por round
  if (state.round === lastRound) return;

  lastRound = state.round;

  const result = state.result || state.prediction || state.signal;

  if (!result) return;

  console.log("📡 REAL SIGNAL:", result);

  addPendingSignal(result);
}

function startSignalGenerator() {
  setInterval(generateSignal, 5000);
}

module.exports = { startSignalGenerator };