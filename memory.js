const { loadHistory } = require("./history");

function getRecentStats(limit = 80) {
  const history = loadHistory()
    .filter(h => h.result)
    .slice(-limit);

  let blueScore = 0;
  let redScore = 0;

  history.forEach((h, i) => {
    const weight = (i + 1) / history.length;
if (h.signal === "blue") {
  blueScore += (h.weight || 0) * weight;
}

if (h.signal === "red") {
  redScore += (h.weight || 0) * weight;
}
    
  return {
    blueRate: blueScore,
    redRate: redScore
  };
}

function getWeightedStats(limit = 20) {
  const history = loadHistory()
    .filter(h => h.result)
    .slice(-limit);

  let blue = 0;
  let red = 0;

  history.forEach((h, i) => {
    const weight = i + 1;

    if (h.result === "blue") blue += weight;
    if (h.result === "red") red += weight;
  });

  return { blue, red };
}

module.exports = {
  getRecentStats,
  getWeightedStats
};