const coins = ["bitcoin","ethereum","solana","binancecoin","ore-network","raydium"];
const cardElements = document.querySelectorAll(".card");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");
const modalSymbol = document.getElementById("modal-symbol");
const marketCapEl = document.getElementById("market-cap");
const volumeEl = document.getElementById("volume");
const changeEl = document.getElementById("change");
const minMaxEl = document.getElementById("min-max");
const ctx = document.getElementById("priceChart").getContext('2d');
let chart;

// Funzione per aggiornare prezzi principali ogni 2 secondi
async function updatePrices() {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
    const data = await res.json();

    cardElements.forEach(card => {
      const id = card.dataset.id;
      if(data[id]) {
        card.querySelector(".price").textContent = "$ " + data[id].usd.toLocaleString();
      }
    });
  } catch(e) {
    console.error("Errore fetch prezzi", e);
  }
}

// Apri modale con info dettagliate
async function openModal(id) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const data = await res.json();

    modalSymbol.textContent = data.symbol.toUpperCase();
    marketCapEl.textContent = "Market Cap: $" + data.market_data.market_cap.usd.toLocaleString();
    volumeEl.textContent = "Volume 24h: $" + data.market_data.total_volume.usd.toLocaleString();

    const change = data.market_data.price_change_percentage_24h;
    changeEl.textContent = "24h %: " + change.toFixed(2) + "%";
    changeEl.className = change >=0 ? "positive" : "negative";

    const min = data.market_data.low_24h.usd;
    const max = data.market_data.high_24h.usd;
    minMaxEl.textContent = `Min / Max 24h: $${min.toLocaleString()} / $${max.toLocaleString()}`;

    // Grafico andamento
    const prices = data.market_data.sparkline_7d.price; // array di prezzi sparkline 7 giorni
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: prices.map((_,i)=>i),
        datasets: [{
          label: data.symbol.toUpperCase(),
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3
        }]
      },
      options: {
        responsive:true,
        scales: {
          x: { display:false },
          y: { beginAtZero:false }
        }
      }
    });

    modal.classList.remove("hidden");
  } catch(e) {
    console.error("Errore fetch dettagli", e);
  }
}

// Event listener click card
cardElements.forEach(card => {
  card.addEventListener("click", () => {
    openModal(card.dataset.id);
  });
});

// Chiudi modale
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Aggiorna ogni 2 secondi
updatePrices();
setInterval(updatePrices, 2000);
const prices = {
  BTC: document.querySelector("#BTC .price"),
  ETH: document.querySelector("#ETH .price"),
  XRP: document.querySelector("#XRP .price"),
  SOL: document.querySelector("#SOL .price"),
  RAY: document.querySelector("#RAY .price")
};

// WebSocket Binance → REAL TIME
const socket = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=" +
  "btcusdt@trade/ethusdt@trade/xrpusdt@trade/solusdt@trade/rayusdt@trade"
);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data).data;
  const symbol = data.s.replace("USDT", "");
  const price = parseFloat(data.p);

  if (prices[symbol]) {
    prices[symbol].textContent = "$ " + price.toFixed(4);
  }
};

socket.onerror = () => {
  console.error("Errore WebSocket");
};
const cards = document.querySelectorAll(".card");

async function updatePrices() {
  const ids = [
    "bitcoin",
    "ethereum",const coins = ["bitcoin","ethereum","solana","binancecoin","ore-network","raydium"];
const cardElements = document.querySelectorAll(".card");

const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");
const modalSymbol = document.getElementById("modal-symbol");
const marketCapEl = document.getElementById("market-cap");
const volumeEl = document.getElementById("volume");
const changeEl = document.getElementById("change");
const minMaxEl = document.getElementById("min-max");
const ctx = document.getElementById("priceChart").getContext('2d');
let chart;

// Aggiorna prezzi principali ogni 2 secondi
async function updatePrices() {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd`);
    const data = await res.json();

    cardElements.forEach(card => {
      const id = card.dataset.id;
      if(data[id]) {
        card.querySelector(".price").textContent = "$ " + data[id].usd.toLocaleString();
      }
    });
  } catch(e) {
    console.error("Errore fetch prezzi", e);
  }
}

// Mostra modale con info dettagliate
async function openModal(id) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&market_data=true&sparkline=true`);
    const data = await res.json();

    modalSymbol.textContent = data.symbol.toUpperCase();
    marketCapEl.textContent = "Market Cap: $" + data.market_data.market_cap.usd.toLocaleString();
    volumeEl.textContent = "Volume 24h: $" + data.market_data.total_volume.usd.toLocaleString();

    const change = data.market_data.price_change_percentage_24h;
    changeEl.textContent = "24h %: " + change.toFixed(2) + "%";
    changeEl.className = change >=0 ? "positive" : "negative";

    const min = data.market_data.low_24h.usd;
    const max = data.market_data.high_24h.usd;
    minMaxEl.textContent = `Min / Max 24h: $${min.toLocaleString()} / $${max.toLocaleString()}`;

    // Grafico sparkline 7 giorni
    const prices = data.market_data.sparkline_7d.price;
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: prices.map((_,i)=>i),
        datasets: [{
          label: data.symbol.toUpperCase(),
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3
        }]
      },
      options: {
        responsive:true,
        scales: {
          x: { display:false },
          y: { beginAtZero:false }
        }
      }
    });

    modal.classList.remove("hidden");
  } catch(e) {
    console.error("Errore fetch dettagli", e);
  }
}

// Event listener click card
cardElements.forEach(card => {
  card.addEventListener("click", () => openModal(card.dataset.id));
});

// Chiudi modale
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

// Aggiorna prezzi ogni 2 secondi
updatePrices();
setInterval(updatePrices, 2000);

    "ripple",
    "solana",
    "ore-network",
    "raydium"
  ].join(",");

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  const res = await fetch(url);
  const data = await res.json();

  cards.forEach(card => {
    const id = card.dataset.id;
    const priceEl = card.querySelector(".price");

    if (data[id]) {
      priceEl.textContent = `$ ${data[id].usd.toLocaleString()}`;
    }
  });
}

// primo caricamento
updatePrices();

// aggiorna ogni 10 secondi
setInterval(updatePrices, 10000);
