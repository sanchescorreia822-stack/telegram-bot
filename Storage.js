const fs = require("fs");

const FILE = "historico.json";

function read() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  const old = read();
  old.push(data);
  fs.writeFileSync(FILE, JSON.stringify(old, null, 2));
}

function stats() {
  const data = read();
  return {
    total: data.length
  };
}

module.exports = { save, read, stats };