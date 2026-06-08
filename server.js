const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(express.json());

// ================= CONFIG =================
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const ODDS_KEY = process.env.ODDS_API_KEY;

console.log("ODDS KEY:", ODDS_KEY ? "OK" : "MISSING");

const bot = new TelegramBot(token, { polling: false });
let lastSignalTime = 0;

console.log("🧠 FOOTBALL STUDIO AI PRO ONLINE");

// ================= HISTORY =================
const LEAGUE_FILE = "league_stats.json";

function loadLeagueStats() {
  if (!fs.existsSync(LEAGUE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(LEAGUE_FILE));
  } catch {
    return {};
  }
}

function saveLeagueStats(data) {
  fs.writeFileSync(LEAGUE_FILE, JSON.stringify(data, null, 2));
}

function updateLeagueStats(league, win) {
  const stats = loadLeagueStats();

  if (!stats[league]) {
    stats[league] = { wins: 0, losses: 0 };
  }

  win ? stats[league].wins++ : stats[league].losses++;

  saveLeagueStats(stats);
}

function leagueQuality(league) {
  const stats = loadLeagueStats()[league];
  if (!stats) return 1; // neutro

  const total = stats.wins + stats.losses;
  if (total < 8) return 1;

  return stats.wins / total;
}

function isBadLeague(league) {
  return leagueQuality(league) < 0.45;
}
// ================= ODDS API =================
async function getRealOdds() {
  try {
    const res = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer/odds",
      {
        params: {
          apiKey: ODDS_KEY,
          regions: "eu",
          markets: "h2h",
          oddsFormat: "decimal"
        }
      }
    );

    return res.data;

  } catch (err) {
    console.log("ODDS ERROR:", err.response?.data || err.message);
    return [];
  }
}

// ================= UTILS =================
function oddsToProbability(odds) {
  if (!odds) return 0;
  return 1 / odds;
}

// ================= GAME DATA =================
async function getGameData() {
  const data = await getRealOdds();

  if (!data || !data.length) {
    return {
      outcomes: [
        { name: "Casa", probability: Math.random() },
        { name: "Azul", probability: Math.random() },
        { name: "Vermelho", probability: Math.random() }
      ]
    };
  }

  const match = data[0];
  const odds = match.bookmakers?.[0]?.markets?.[0]?.outcomes || [];

  return {
    outcomes: odds.map(o => ({
      name:
        o.name === "Home" ? "Casa"
        : o.name === "Away" ? "Vermelho"
        : "Azul",
      probability: oddsToProbability(o.price)
    }))
  };
}

// ================= IA =================
function aiPick(game, history) {
  const outcomes = game.outcomes;

  // normalização de probabilidade
  const total = outcomes.reduce((a, b) => a + b.probability, 0);

  const normalized = outcomes.map(o => ({
    ...o,
    prob: o.probability / total,
    implied: o.probability
  }));

  let best = null;
  let bestEdge = 0;

  for (let o of normalized) {
    const edge = o.prob - o.implied;

    if (edge > bestEdge) {
      bestEdge = edge;
      best = o;
    }
  }

  const confidence =
    Math.max(0, Math.min(1, bestEdge * 10));

  return {
    pick: best?.name || "Casa",
    confidence,
    edge: bestEdge
  };
}
// ================= STATS =================
function getStats(history) {
  const total = history.length;
  const wins = history.filter(h => h.win).length;

  const winRate = total ? (wins / total) * 100 : 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].win) streak++;
    else break;
  }

  return {
    winRate: Number(winRate.toFixed(1)),
    streak,
    total
  };
}

// ================= SAVE RESULT =================
function addRecord(result, pick, confidence) {
  const history = loadHistory();

  const win = result === pick;

  history.push({
    result,
    pick,
    confidence,
    win,
    time: Date.now()
  });

  if (history.length > 300) history.shift();

  saveHistory(history);

  return win;
}

// ================= MAIN LOOP =================
setInterval(async () => {
  try {
  const now = Date.now();
if (now - lastSignalTime < 10 * 60 * 1000) return;
lastSignalTime = now;
    const history = loadHistory();

    const game = await getGameData();

    const signal = aiPick(game, history);
if (
  signal.confidence >= 0.80 &&
  signal.edge >= 0.07 &&
  !isBadLeague(league)
) {
    
      const stats = getStats(history);

      await bot.sendMessage(chatId,
`🧠 FOOTBALL STUDIO AI PRO

🎯 PICK: ${signal.pick}
📊 Confiança: ${(signal.confidence * 100).toFixed(1)}%

📈 Win Rate: ${stats.winRate}%
🔥 Streak: ${stats.streak}

⏳ A aguardar resultado...`
      );

      const result = game.outcomes
  .sort((a, b) => b.probability - a.probability)[0].name;

const win = addRecord(result, signal.pick, signal.confidence);

// 🔥 AQUI é o lugar certo
updateLeagueStats(league, win);

const updatedStats = getStats(loadHistory());
      await bot.sendMessage(chatId,
`📊 RESULTADO FINAL

🏁 Resultado: ${result}
🎯 Pick: ${signal.pick}

${win ? "🟢 WIN" : "🔴 RED"}

📈 Win Rate: ${updatedStats.winRate}%
🔥 Streak: ${updatedStats.streak}`
      );
    }

  } catch (err) {
    console.log("MAIN LOOP ERROR:", err.message);
  }
}, 60000);

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("FOOTBALL STUDIO AI PRO ONLINE");
});

app.get("/stats", (req, res) => {
  const history = loadHistory();
  res.json(getStats(history));
});

// ================= START =================
app.listen(process.env.PORT || 3000, () => {
  console.log("SERVER ONLINE");
});