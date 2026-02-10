let chart, candleSeries, lineSeries;
let currentSymbol, currentTF;
let config;
const lastPrices = {};

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
  initControls();
  initChart();
  loadCandles();
  updateTickers();
  setInterval(updateTickers, 2000);
}

/* ================= NETWORK ================= */
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

/* ================= TICKERS ================= */
function initTickers() {
  const box = document.getElementById("tickers");

  config.symbols.forEach(s => {
    lastPrices[s.pair] = 0;
    const div = document.createElement("div");
    div.className = "ticker";
    div.id = `ticker-${s.pair}`;
    div.innerHTML = `<strong>${s.name}</strong><br><span>--</span>`;
    div.onclick = () => {
      currentSymbol = s.pair;
      document.getElementById("symbol").value = s.pair;
      loadCandles();
    };
    box.appendChild(div);
  });
}

function updateTickers() {
  fetch("https://api.binance.com/api/v3/ticker/price")
    .then(r => r.json())
    .then(data => {
      config.symbols.forEach(s => {
        const ticker = data.find(d => d.symbol === s.pair);
        if (!ticker) return;

        const price = parseFloat(ticker.price);
        const prev = lastPrices[s.pair];
        lastPrices[s.pair] = price;

        const el = document.getElementById(`ticker-${s.pair}`);
        el.querySelector("span").textContent = price.toFixed(2);

        el.classList.remove("green", "red");
        if (prev !== 0) {
          el.classList.add(price >= prev ? "green" : "red");
        }

        if (s.pair === currentSymbol && lineSeries) {
          lineSeries.update({
            time: Math.floor(Date.now() / 1000),
            value: price
          });
        }
      });
    });
}

/* ================= CONTROLS ================= */
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

  document.querySelectorAll(".timeframes button").forEach(b => {
    b.onclick = () => {
      currentTF = b.dataset.tf;
      loadCandles();
    };
  });
}

/* ================= CHART ================= */
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

  window.addEventListener("resize", () => {
    chart.applyOptions({
      width: document.getElementById("chart").clientWidth
    });
  });
}

function loadCandles() {
  fetch(`https://api.binance.com/api/v3/klines?symbol=${currentSymbol}&interval=${currentTF}&limit=300`)
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
    });
}
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
