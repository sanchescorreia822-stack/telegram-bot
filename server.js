const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const app = express();
app.use(express.json());

// ---------------- CONFIG ----------------
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

console.log("🧠 FOOTBALL STUDIO AI PRO ONLINE");

// ---------------- HISTORY ----------------
const FILE = "history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ---------------- GAME SIM (substituir depois por API real) ----------------
function getGameData() {
  return {
    outcomes: [
      { name: "Casa", probability: Math.random() },
      { name: "Azul", probability: Math.random() },
      { name: "Vermelho", probability: Math.random() }
    ]
  };
}

// ---------------- IA PRO ----------------
function aiPick(game, history) {
  const weights = { Casa: 0, Azul: 0, Vermelho: 0 };

  for (let o of game.outcomes) {
    weights[o.name] = o.probability * 100;
  }

  const stats = {
    Casa: { wins: 0, total: 0 },
    Azul: { wins: 0, total: 0 },
    Vermelho: { wins: 0, total: 0 }
  };

  history.forEach(h => {
    if (stats[h.pick]) {
      stats[h.pick].total++;
      if (h.win) stats[h.pick].wins++;
    }
  });

  for (let key in stats) {
    const s = stats[key];
    if (s.total >= 5) {
      const winRate = s.wins / s.total;
      weights[key] += (winRate - 0.5) * 60;
    }
  }

  const last = history.slice(-10);
  const count = { Casa: 0, Azul: 0, Vermelho: 0 };

  last.forEach(h => {
    if (count[h.result] !== undefined) {
      count[h.result]++;
    }
  });

  const total = last.length || 1;

  weights.Casa += (count.Casa / total) * 25;
  weights.Azul += (count.Azul / total) * 25;
  weights.Vermelho += (count.Vermelho / total) * 25;

  const lastPick = history[history.length - 1]?.pick;
  if (lastPick) weights[lastPick] -= 10;

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

// ---------------- STATS ----------------
function getStats(history) {
  let wins = 0;

  for (let h of history) {
    if (h.win) wins++;
  }

  const winRate = history.length ? (wins / history.length) * 100 : 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].win) streak++;
    else break;
  }

  return { winRate, streak };
}

// ---------------- SAVE RESULT ----------------
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

  if (history.length > 200) history.shift();

  saveHistory(history);

  return win;
}

// ---------------- LOOP PRINCIPAL ----------------
setInterval(async () => {
  try {
    const history = loadHistory();
    const game = getGameData();

    const signal = aiPick(game, history);

    if (signal.confidence >= 0.72) {

      const statsBefore = getStats(history);

      await bot.sendMessage(chatId,
`🧠 FOOTBALL STUDIO AI PRO

🎯 PICK: ${signal.pick}
📊 Confiança: ${(signal.confidence * 100).toFixed(1)}%

📈 Win Rate: ${statsBefore.winRate.toFixed(1)}%
🔥 Streak: ${statsBefore.streak}

⏳ A aguardar resultado...`
      );

      const fakeResult = game.outcomes
        .sort((a, b) => b.probability - a.probability)[0].name;

      const win = addRecord(fakeResult, signal.pick, signal.confidence);

      const statsAfter = getStats(loadHistory());

      await bot.sendMessage(chatId,
`📊 RESULTADO FINAL

🏁 Resultado: ${fakeResult}
🎯 Pick: ${signal.pick}

${win ? "🟢 WIN" : "🔴 RED"}

📈 Win Rate: ${statsAfter.winRate.toFixed(1)}%
🔥 Streak: ${statsAfter.streak}`
      );
    }

  } catch (err) {
    console.log("ERROR:", err.message);
  }
}, 60000);

// ---------------- SERVER ----------------
app.get("/", (req, res) => {
  res.send("FOOTBALL STUDIO AI PRO ONLINE");
});
// 🔥 STATS API
app.get("/stats", (req, res) => {
  const history = loadHistory();

  const total = history.length;

  const wins = history.reduce((acc, h) => acc + (h.win ? 1 : 0), 0);

  const winRate = total > 0 ? (wins / total) * 100 : 0;

  let streak = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].win === true) {
      streak++;
    } else {
      break;
    }
  }

  res.json({
    winRate: Number(winRate.toFixed(1)),
    streak,
    total
  });
});
app.listen(process.env.PORT || 3000, () => {
  console.log("SERVER ONLINE");
});