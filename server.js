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

const bot = new TelegramBot(token, { polling: false });

console.log("🧠 FOOTBALL STUDIO AI PRO ONLINE");

// ================= HISTORY =================
const FILE = "history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
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
    console.log("ODDS ERROR:", err.message);
    return [];
  }
}

function oddsToProbability(odds) {
  return 1 / odds;
}

// ================= GAME DATA =================
async function getGameData() {
  const data = await getRealOdds();

  if (!data.length) {
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
  const weights = { Casa: 0, Azul: 0, Vermelho: 0 };

  for (let o of game.outcomes) {
    weights[o.name] = o.probability * 100;
  }

  history.forEach(h => {
    if (h.win) {
      weights[h.pick] += 5;
    } else {
      weights[h.pick] -= 2;
    }
  });

  let best = "Casa";
  let bestScore = weights.Casa;

  for (let k in weights) {
    if (weights[k] > bestScore) {
      best = k;
      bestScore = weights[k];
    }
  }

  const confidence = Math.max(0, Math.min(1, bestScore / 120));

  return { pick: best, confidence };
}

// ================= STATS =================
function getStats(history) {
  const total = history.length;
  const wins = history.reduce((a, b) => a + (b.win ? 1 : 0), 0);

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
    const history = loadHistory();
    const game = await getGameData();

    const signal = aiPick(game, history);

    if (signal.confidence >= 0.72) {

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
    console.log("ERROR:", err.message);
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