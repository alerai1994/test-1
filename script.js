let chart, candleSeries, lineSeries;
let currentSymbol, currentTF;
let config;
const tickerData = {};
const tickerCharts = {};

fetch("config.json")
  .then(r => r.json())
  .then(c => {
    config = c;
    currentSymbol = c.defaultSymbol;
    currentTF = c.defaultTimeframe;
    init();
  });

function init() {
  initNetwork();
  initTickers();
  initMainChart();
  loadMainChart();
  setInterval(updateTickers, 2000);
}

/* ========= NETWORK ========= */
function initNetwork() {
  const dot = document.getElementById("net-dot");
  const text = document.getElementById("net-text");
  const update = () => {
    dot.style.background = navigator.onLine ? "green" : "red";
    text.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
  };
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

/* ========= TICKERS ========= */
function initTickers() {
  const box = document.getElementById("tickers");

  config.symbols.forEach(s => {
    tickerData[s.pair] = [];

    const div = document.createElement("div");
    div.className = "ticker";
    div.id = s.pair;
    div.innerHTML = `
      <strong>${s.name}</strong><br>
      <span class="price">--</span>
      <canvas></canvas>
    `;
    div.onclick = () => {
      currentSymbol = s.pair;
      loadMainChart();
    };
    box.appendChild(div);

    const canvas = div.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    tickerCharts[s.pair] = ctx;
  });
}

function updateTickers() {
  fetch("https://api.binance.com/api/v3/ticker/price")
    .then(r => r.json())
    .then(data => {
      config.symbols.forEach(s => {
        const t = data.find(d => d.symbol === s.pair);
        if (!t) return;

        const price = +t.price;
        const arr = tickerData[s.pair];
        arr.push(price);
        if (arr.length > 20) arr.shift();

        const el = document.getElementById(s.pair);
        el.querySelector(".price").textContent = price.toFixed(2);

        if (arr.length > 1) {
          el.classList.remove("green", "red");
          el.classList.add(price >= arr[arr.length - 2] ? "green" : "red");
        }

        drawMiniChart(tickerCharts[s.pair], arr);
      });
    });
}

function drawMiniChart(ctx, data) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);

  ctx.strokeStyle = data[data.length - 1] >= data[0] ? "#0ecb81" : "#f6465d";
  ctx.beginPath();

  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(w - 4, h - ((data[data.length - 1] - min) / (max - min || 1)) * h, 3, 0, Math.PI * 2);
  ctx.fill();
}

/* ========= MAIN CHART ========= */
function initMainChart() {
  chart = LightweightCharts.createChart(document.getElementById("chart"), {
    layout: { background: { color: "#0b0e11" }, textColor: "#d1d4dc" },
    grid: { vertLines: { color: "#161a1e" }, horzLines: { color: "#161a1e" } },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    rightPriceScale: { borderColor: "#2b3139" },
    timeScale: { borderColor: "#2b3139", timeVisible: true }
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: "#0ecb81",
    downColor: "#f6465d",
    wickUpColor: "#0ecb81",
    wickDownColor: "#f6465d"
  });

  lineSeries = chart.addLineSeries({ color: "#f0b90b", lineWidth: 2 });

  window.addEventListener("resize", () => {
    chart.applyOptions({ width: document.getElementById("chart").clientWidth });
  });
}

function loadMainChart() {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${currentSymbol}&interval=${currentTF}&limit=500`)
    .then(r => r.json())
    .then(data => {
      const candles = data.map(d => ({
        time: d[0] / 1000,
        open: +d[1],
        high: +d[2],
        low: +d[3],
        close: +d[4]
      }));
      candleSeries.setData(candles);
      lineSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
      chart.timeScale().fitContent();
    });
}

/* ========= TIMEFRAMES ========= */
document.querySelectorAll(".timeframes button").forEach(b => {
  b.onclick = () => {
    currentTF = b.dataset.tf;
    loadMainChart();
  };
});
