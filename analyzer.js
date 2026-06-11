const { getRecentStats } = require("./memory");

function analyzePattern(history) {
  const last = history
    .slice(-15)
    .map(h => h.result)
    .filter(r => r === "blue" || r === "red");

  if (last.length < 7) return null;

  const stats = getRecentStats();

  const blueCount = last.filter(r => r === "blue").length;
  const redCount = last.filter(r => r === "red").length;

  const stability = 1 - (last.filter((r, i) => r !== last[i - 1]).length / last.length);

  if (stability < 0.6) return null;

  let scoreBlue = 0;
  let scoreRed = 0;

  // 📊 padrão recente
  scoreBlue += blueCount * 12;
  scoreRed += redCount * 12;

  // 🧠 aprendizagem real
  scoreBlue += stats.blueRate * 50;
  scoreRed += stats.redRate * 50;

  // 🔁 anti-loop
  if (blueCount > redCount) scoreRed += 10;
  if (redCount > blueCount) scoreBlue += 10;

  let signal = scoreBlue > scoreRed ? "blue" : "red";
  let confidence = Math.max(scoreBlue, scoreRed);

  if (confidence < 70) return null;

  return {
    signal,
    confidence: Math.min(92, Math.round(confidence))
  };
}

module.exports = { analyzePattern };