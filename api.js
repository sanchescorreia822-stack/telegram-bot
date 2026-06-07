const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "history.json";

function loadHistory() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveHistory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// IA
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

  const confidence = Math.min(1, Math.max(0, bestScore / 120));

  return { pick: best, confidence };
}

// endpoint IA
app.post("/predict", (req, res) => {
  const history = loadHistory();
  const game = req.body;

  const result = aiPick(game, history);

  res.json(result);
});

// salvar resultado
app.post("/result", (req, res) => {
  const history = loadHistory();

  const { result, pick, confidence } = req.body;

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

  res.json({ win });
});

app.listen(4000, () => {
  console.log("AI API RUNNING ON PORT 4000");
});