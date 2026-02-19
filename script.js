const pricesDiv = document.getElementById("prices");
const statusText = document.getElementById("statusText");
const dot = document.getElementById("dot");

let charts = {};
let priceHistory = {};

fetch("data.json")
  .then(res => res.json())
  .then(config => {

    // Crea card per ogni coin
    config.coins.forEach(coin => {
      priceHistory[coin.symbol] = [];

      const card = document.createElement("div");
      card.className = "coin-card";
      card.id = coin.symbol;

      card.innerHTML = `
        <strong>${coin.symbol}</strong>
        <div class="price" id="price-${coin.symbol}">$0</div>
        <canvas id="chart-${coin.symbol}"></canvas>
      `;

      pricesDiv.appendChild(card);

      const ctx = document.getElementById(`chart-${coin.symbol}`).getContext("2d");

      charts[coin.symbol] = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [{
            data: [],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    });

    // WebSocket Binance
    const streams = config.coins.map(c => `${c.stream}@trade`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onopen = () => {
      dot.style.background = "green";
      statusText.textContent = "ONLINE";
    };

    ws.onclose = () => {
      dot.style.background = "red";
      statusText.textContent = "OFFLINE";
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const stream = message.stream;
      const price = parseFloat(message.data.p);

      const symbol = stream.split("@")[0].replace("usdt","").toUpperCase();

      const priceDiv = document.getElementById(`price-${symbol}`);
      if (!priceDiv) return;

      const prev = priceHistory[symbol].slice(-1)[0] || price;
      const change = price - prev;

      priceDiv.innerHTML = `
        $${price.toLocaleString()}
        <span class="${change >= 0 ? "positive" : "negative"}">
          ${change >= 0 ? "▲" : "▼"}
        </span>
      `;

      // aggiorna storico
      priceHistory[symbol].push(price);
      if (priceHistory[symbol].length > 30) {
        priceHistory[symbol].shift();
      }

      charts[symbol].data.labels = priceHistory[symbol].map((_, i) => i);
      charts[symbol].data.datasets[0].data = priceHistory[symbol];
      charts[symbol].data.datasets[0].borderColor =
        change >= 0 ? "#00ff88" : "#ff3b3b";

      charts[symbol].update();
    };
  });
