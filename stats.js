const { loadHistory } = require("./history");

function getStats() {
  const history = loadHistory().filter(h => h.status === "DONE");

  const total = history.length;
  const wins = history.filter(h => h.win).length;

  const winRate = total === 0 ? 0 : (wins / total) * 100;

  return {
    total,
    wins,
    losses: total - wins,
    winRate: winRate.toFixed(2)
  };
}

module.exports = { getStats };