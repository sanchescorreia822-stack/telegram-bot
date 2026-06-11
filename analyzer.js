const { getRecentStats, getWeightedStats } = require("./memory");

function analyzePattern(history) {
  const last = history
    .slice(-15)
    .map(h => h.result)
    .filter(r => r === "blue" || r === "red");

  if (last.length < 7) return null;

  const stats = getRecentStats();
  const weighted = getWeightedStats();

  const blueCount = last.filter(r => r === "blue").length;
  const redCount = last.filter(r => r === "red").length;
let changes = 0;

for (let i = 1; i < last.length; i++) {
  if (last[i] !== last[i - 1]) {
    changes++;
  }
}

const stability = 1 - (changes / (last.length - 1));
  
  if (stability < 0.6) return null;

  let scoreBlue = 0;
  let scoreRed = 0;

  // padrão recente
  scoreBlue += blueCount * 12;
  scoreRed += redCount * 12;

  // aprendizagem real
  scoreBlue += stats.blueRate * 50;
  scoreRed += stats.redRate * 50;

  // peso dos resultados recentes
  scoreBlue += weighted.blue * 0.4;
  scoreRed += weighted.red * 0.4;

  // 📈 tendência recente (NOVO)
  const recentBias = last.slice(-5);

  const blueRecent = recentBias.filter(r => r === "blue").length;
  const redRecent = recentBias.filter(r => r === "red").length;

  scoreBlue += blueRecent * 8;
  scoreRed += redRecent * 8;

  // anti-loop
  if (blueCount > redCount) scoreRed += 10;
  if (redCount > blueCount) scoreBlue += 10;

  let signal = scoreBlue > scoreRed ? "blue" : "red";
  let confidence = Math.max(scoreBlue, scoreRed);

  if (confidence < 80) return null;

  const difference = Math.abs(scoreBlue - scoreRed);

  if (difference < 15) return null;

  return {
    signal,
    confidence: Math.min(92, Math.round(confidence))
  };
}

module.exports = { analyzePattern };