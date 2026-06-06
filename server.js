const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const app = express();
app.use(express.json());

// ---------------- CONFIG ----------------
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token);

console.log("🧠 FOOTBALL STUDIO AI ONLINE");

// ---------------- HISTORY ----------------
const FILE = "history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ---------------- SIMULAÇÃO / FUTURO API ----------------
function getGameData() {
  return {
    outcomes: [
      { name: "Casa", probability: Math.random() },
      { name: "Azul", probability: Math.random() },
      { name: "Vermelho", probability: Math.random() }
    ]
  };
}

// ---------------- IA CORE ----------------
function calculateWeights(game, history) {
  const weights = {
    Casa: 0,
    Azul: 0,
    Vermelho: 0
  };

  // base do jogo
  for (let o of game.outcomes) {
    weights[o.name] = o.probability * 100;
  }

  // aprendizagem com histórico
  const stats = { Casa: [], Azul: [], Vermelho: [] };

  for (let h of history) {
    if (h.win !== undefined) {
      stats[h.pick].push(h.win);
    }
  }

  for (let key in stats) {
    const arr = stats[key];

    if (arr.length > 5) {
      const winRate = arr.filter(v => v).length / arr.length;
      weights[key] += (winRate - 0.5) * 40;
    }
  }

  // tendência recente
  const last = history.slice(-10);

  const count = { Casa: 0, Azul: 0, Vermelho: 0 };

  for (let h of last) {
    count[h.result]++;
  }

  const total = last.length || 1;

  weights.Casa += (count.Casa / total) * 20;
  weights.Azul += (count.Azul / total) * 20;
  weights.Vermelho += (count.Vermelho / total) * 20;

  // anti repetição
  const lastPick = history[history.length - 1]?.pick;
  if (lastPick) {
    weights[lastPick] -= 8;
  }

  return weights;
}

// ---------------- DECISÃO IA ----------------
function aiPick(game, history) {
  const weights = calculateWeights(game, history);

  let best = "Casa";
  let bestScore = weights.Casa;

  for (let key in weights) {
    if (weights[key] > bestScore) {
      best = key;
      bestScore = weights[key];
    }
  }

  const confidence = Math.max(0, Math.min(1, bestScore / 100));

  return { pick: best, confidence };
}

// ---------------- REGISTO ----------------
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
}

// ---------------- LOOP PRINCIPAL ----------------
setInterval(async () => {
  try {
    const history = loadHistory();
    const game = getGameData();

    const signal = aiPick(game, history);

    if (signal.confidence >= 0.75) {
      await bot.sendMessage(chatId,
`🧠 FOOTBALL STUDIO AI

🏠 Casa vs 🔵 Azul vs 🔴 Vermelho

🎯 PICK: ${signal.pick}
📊 Confiança: ${(signal.confidence * 100).toFixed(1)}%

🔥 IA MODE ATIVO`
      );

      // simulação de resultado real
      const fakeResult = game.outcomes.sort((a, b) => b.probability - a.probability)[0].name;

      addRecord(fakeResult, signal.pick, signal.confidence);
    }

  } catch (err) {
    console.log("ERROR:", err.message);
  }
}, 60000);

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.send("FOOTBALL STUDIO AI ONLINE");
});

// ---------------- START ----------------
app.listen(process.env.PORT || 3000, () => {
  console.log("ONLINE");
});