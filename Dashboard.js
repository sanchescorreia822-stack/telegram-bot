<!DOCTYPE html>
<html>
<head>
  <title>Football Studio App</title>
</head>
<body>
  <h1>⚽ Football Studio PRO</h1>

  <div id="stats"></div>

  <h2>Últimos sinais</h2>
  <ul id="list"></ul>

<script>
async function load() {
  const stats = await fetch('/api/stats').then(r => r.json());
  const hist = await fetch('/api/history').then(r => r.json());

  document.getElementById("stats").innerHTML = `
    <p>Total: ${stats.total}</p>
    <p>Wins: ${stats.wins}</p>
    <p>Losses: ${stats.losses}</p>
    <h3>Taxa: ${stats.rate}%</h3>
  `;

  document.getElementById("list").innerHTML =
    hist.map(h => `<li>${h.msg}</li>`).join("");
}

load();
setInterval(load, 5000);
</script>

</body>
</html>