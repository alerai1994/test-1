let config = {};

fetch('config.json')
  .then(res => res.json())
  .then(data => {
    config = data;
    initDashboard();
  })
  .catch(err => console.error('Errore caricamento config:', err));

function initDashboard() {
  const { coins, coinIds, updateInterval } = config;

  // Genera elementi crypto dinamicamente
  const container = document.getElementById('crypto-container');
  coinIds.forEach(id => {
    const div = document.createElement('div');
    div.classList.add('crypto');
    div.id = id;
    div.innerHTML = `<div>${id.toUpperCase()}</div><div class="price">0</div>`;
    container.appendChild(div);
  });

  // Connessione
  const statusDot = document.getElementById('status-dot');
  function updateStatus(online) {
    statusDot.style.backgroundColor = online ? 'green' : 'red';
  }
  updateStatus(navigator.onLine);
  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));

  // Funzione per ottenere dati real-time
  async function fetchPrices() {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true`);
      const data = await res.json();
      coinIds.forEach((id, i) => {
        const priceElem = document.querySelector(`#${id} .price`);
        const oldPrice = parseFloat(priceElem.innerText.replace(',', '')) || 0;
        const newPrice = data[coins[i]].usd;
        priceElem.innerText = newPrice.toLocaleString();
        if(newPrice > oldPrice) priceElem.style.color = 'green';
        else if(newPrice < oldPrice) priceElem.style.color = 'red';
        else priceElem.style.color = 'black';
      });

      // Aggiorna ticker
      const marketCap = Object.values(data).reduce((a,b) => a + b.usd, 0);
      const vol24h = Object.values(data).reduce((a,b) => a + b.usd_24h_change || 0, 0);
      const ticker = document.getElementById('ticker');
      ticker.style.animationDuration = `${config.tickerSpeed}s`;
      ticker.innerText = `Market Cap: ${marketCap.toFixed(2)} | Vol 24h: ${vol24h.toFixed(2)} | Max Total Supply: -`;
    } catch(e) {
      updateStatus(false);
      console.error(e);
    }
  }

  fetchPrices();
  setInterval(fetchPrices, updateInterval);

  // Grafico BTC
  const ctx = document.getElementById('priceChart').getContext('2d');
  const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'BTC',
        data: [],
        borderColor: 'blue',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { enabled: true } },
      scales: {
        x: { title: { display: true, text: 'Tempo' } },
        y: { title: { display: true, text: 'Prezzo (USD)' } }
      }
    }
  });

  async function updateChart() {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly`);
      const data = await res.json();
      priceChart.data.labels = data.prices.map(p => new Date(p[0]).toLocaleTimeString());
      priceChart.data.datasets[0].data = data.prices.map(p => p[1]);
      priceChart.update();

      document.getElementById('start-date').innerText = 'Start: ' + new Date(data.prices[0][0]).toLocaleDateString();
      document.getElementById('end-date').innerText = 'Oggi: ' + new Date().toLocaleDateString();
      document.getElementById('current-price').innerText = 'Prezzo: ' + data.prices.slice(-1)[0][1].toFixed(2);
    } catch(e) {
      console.error(e);
    }
  }

  updateChart();
  setInterval(updateChart, updateInterval);
}
