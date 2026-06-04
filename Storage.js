const fs = require("fs");

const FILE = "historico.json";

function read() {
  if (!fs.existsSync(FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(FILE));
  } catch {
    return [];
  }
}

function save(data) {
  const old = read();
  old.push({
    ...data,
    time: new Date().toISOString()
  });

  fs.writeFileSync(FILE, JSON.stringify(old, null, 2));
}

function stats() {
  const data = read();

  const wins = data.filter(x => x.result === "WIN").length;
  const losses = data.filter(x => x.result === "LOSS").length;

  return {
    total: data.length,
    wins,
    losses,
    rate:
      wins + losses > 0
        ? ((wins / (wins + losses)) * 100).toFixed(2)
        : 0
  };
}

module.exports = { read, save, stats };