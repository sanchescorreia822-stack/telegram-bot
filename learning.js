const { loadHistory } = require("./history");

function getStats() {
  const history = loadHistory().filter(h => h.result);

  const blueSignals = history.filter(h => h.signal === "blue");
  const redSignals = history.filter(h => h.signal === "red");

  const blueWins = blueSignals.filter(h => h.win).length;
  const redWins = redSignals.filter(h => h.win).length;

  const blueRate = blueSignals.length ? blueWins / blueSignals.length : 0.5;
  const redRate = redSignals.length ? redWins / redSignals.length : 0.5;

  return {
    blueRate,
    redRate
  };
}

module.exports = { getStats };