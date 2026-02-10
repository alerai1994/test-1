let chart, candleSeries, lineSeries;
let currentSymbol, currentTF;
let config;
const prices = {};

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
  initChart();
  initControls();
  loadCandles();
  setInterval(updatePrices, 1000);
}

/* ===================== NETWORK ===================== */
function initNetwork() {
  const dot = document.getElementById("net-dot");
  const text = document.getElementById("net-text");

  function update() {
    dot.style.background = navigator.onLine ? "green" : "red";
    text.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
  }

  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

/* ===================== TICKERS ===================== */
function initTickers() {
  const list = document.getElementById("ticker-list");

  config.symbols.forEach(s => {
    prices[s.pair] = 0;
    const div = document.createElement("div");
    div.className = "ticker";
    div.id = `ticker-${s.pair}`;
    div.textContent = `${s.name}: --`;
    div.onclick = () => {
      currentSymbol = s.pair;
      document.getElementById("symbol").value = s.pair;
      loadCandles();
    };
    list.appendChild(div);
  });
}

function updatePrices() {
  config.symbols.forEach(s => {
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s.pair}`)
      .then(r => r.json())
      .then(d => {
        const price = +d.price;
        const el = document.getElementById(`ticker-${s.pair}`);
        const prev = prices[s.pair];
        prices[s.pair] = price;

        el.textContent = `${s.name}: ${price.toFixed(2)}`;
        el.className = "ticker " + (price >= prev ? "green" : "red");

        if (s.pair === currentSymbol) {
          lineSeries.update({
            time: Math.floor(Date.now() / 1000),
            value: price
          });
        }
      });
  });
}

/* ===================== CONTROLS ===================== */
function initControls() {
  const sel = document.getElementById("symbol");

  config.symbols.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.pair;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });

  sel.value = currentSymbol;
  sel.onchange = () => {
    currentSymbol = sel.value;
    loadCandles();
  };

  document.querySelectorAll(".timeframes button").forEach(btn => {
    btn.onclick = () => {
      currentTF = btn.dataset.tf;
      loadCandles();
    };
  });
}

/* ===================== CHART ===================== */
function initChart() {
  chart = LightweightCharts.createChart(document.getElementById("chart"), {
    layout: { background: { color: "#0b0e11" }, textColor: "#d1d4dc" },
    grid: {
      vertLines: { color: "#161a1e" },
      horzLines: { color: "#161a1e" }
    },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    rightPriceScale: { borderColor: "#2b3139" },
    timeScale: { borderColor: "#2b3139" }
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: "#0ecb81",
    downColor: "#f6465d",
    borderUpColor: "#0ecb81",
    borderDownColor: "#f6465d",
    wickUpColor: "#0ecb81",
    wickDownColor: "#f6465d"
  });

  lineSeries = chart.addLineSeries({
    color: "#f0b90b",
    lineWidth: 2
  });
}

function loadCandles() {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${currentSymbol}&interval=${currentTF}&limit=200`)
    .then(r => r.json())
    .then(data => {
      const candles = data.map(d => ({
        time: d[0] / 1000,
        open: +d[1],
        high: +d[2],
        low: +d[3],
        close: +d[4]
      }));

      const line = candles.map(c => ({
        time: c.time,
        value: c.close
      }));

      candleSeries.setData(candles);
      lineSeries.setData(line);
    });
}
