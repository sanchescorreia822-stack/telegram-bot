const axios = require("axios");

const cache = new Map();

function antiSpam(id) {
  const now = Date.now();
  if (cache.has(id) && now - cache.get(id) < 3600000) return false;
  cache.set(id, now);
  return true;
}

function analisar(oddHome, oddAway) {
  const diff = Math.abs(oddHome - oddAway);

  if (diff < 0.20) return null;

  return oddHome < oddAway
    ? { sinal: "CASA", conf: Math.round((1 / oddHome) * 100) }
    : { sinal: "FORA", conf: Math.round((1 / oddAway) * 100) };
}

async function getSignals() {
  try {
    const res = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer/odds",
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: "eu",
          markets: "h2h"
        }
      }
    );

    const jogos = res.data;
    const output = [];

    for (const j of jogos) {
      const home = j.home_team;
      const away = j.away_team;

      const odds = j.bookmakers?.[0]?.markets?.[0]?.outcomes;
      if (!odds || odds.length < 2) continue;

      const id = `${home}-${away}`;
      if (!antiSpam(id)) continue;

      const resu = analisar(odds[0].price, odds[1].price);
      if (!resu) continue;

      output.push({
        id,
        msg:
          `⚽ FOOTBALL STUDIO APP PRO\n` +
          `📊 Sinal: ${resu.sinal}\n` +
          `🔥 Confiança: ${resu.conf}%\n` +
          `⚽ ${home} vs ${away}`
      });
    }

    return output;
  } catch (e) {
    console.log(e.message);
    return [];
  }
}

module.exports = { getSignals };