const list = document.getElementById("crypto-list");
const netDot = document.getElementById("net-dot");
let config;
const priceHistory = {};

fetch("config.json")
  .then(r => r.json())
  .then(c => {
    config = c;
    init();
    setInterval(updatePrices, config.updateInterval);
  });

function init() {
  config.symbols.forEach(s => {
    priceHistory[s.pair] = [];
    const div = document.createElement("div");
    div.className = "crypto";
    div.id = s.pair;
    div.innerHTML = `
      <h2>${s.name}</h2>
      <div class="price" id="price-${s.pair}">--</div>
      <canvas id="chart-${s.pair}"></canvas>
    `;
    list.appendChild(div);
  });
  updatePrices();
}

function updatePrices() {
  config.symbols.forEach(s => {
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s.pair}`)
      .then(r => r.json())
      .then(d => {
        const price = parseFloat(d.price);
        const history = priceHistory[s.pair];
        history.push(price);
        if (history.length > 20) history.shift();

        const last = history[history.length - 2];
        const box = document.getElementById(s.pair);
        const priceEl = document.getElementById(`price-${s.pair}`);

        const up = last ? price > last : true;
        box.className = "crypto " + (up ? "green" : "red");
        priceEl.style.color = up ? "#0ecb81" : "#f6465d";
        priceEl.textContent = price.toFixed(2) + " $";

        drawChart(s.pair, history, up);
      });
  });
}

function drawChart(pair, data, up) {
  const canvas = document.getElementById(`chart-${pair}`);
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = up ? "#0ecb81" : "#f6465d";
  ctx.beginPath();

  data.forEach((p, i) => {
    const x = (i / (data.length - 1)) * canvas.width;
    const y = canvas.height - ((p - Math.min(...data)) /
      (Math.max(...data) - Math.min(...data))) * canvas.height;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();

  const lastY = canvas.height - ((data[data.length - 1] - Math.min(...data)) /
    (Math.max(...data) - Math.min(...data))) * canvas.height;

  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(canvas.width - 5, lastY, 4, 0, Math.PI * 2);
  ctx.fill();
}

/* Stato connessione */
function updateNetwork() {
  netDot.style.background = navigator.onLine ? "green" : "red";
}
window.addEventListener("online", updateNetwork);
window.addEventListener("offline", updateNetwork);
updateNetwork();
