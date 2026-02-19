let config = {};

fetch('config.json')
  .then(res => res.json())
  .then(data => {
    config = data;
    initDashboard();
  })
  .catch(err => console.error('Errore caricamento config:', err));

function initDashboard() {
  const { coins, coinIds, updateInterval, tickerSpeed } = config;

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
  function updateStatus(online) { statusDot.style.backgroundColor = online ? 'green' : 'red'; }
  updateStatus(navigator.onLine);
  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));

  // Ticker
  const ticker = document.getElementById('ticker');
  ticker.style.animationDuration = `${tickerSpeed}s`;

  async function fetchPrices() {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true`);
      const data = await res.json();

      let marketCapTotal = 0;
      let vol24hTotal = 0;

      coinIds.forEach((id, i) => {
        const priceElem = document.querySelector(`#${id} .price`);
        const oldPrice = parseFloat(priceElem.innerText.replace(',', '')) || 0;
        const newPrice = data[coins[i]].usd;
        priceElem.innerText = newPrice.toLocaleString();
        if(newPrice > oldPrice) priceElem.style.color = 'green';
        else if(newPrice < oldPrice) priceElem.style.color = 'red';
        else priceElem.style.color = 'black';

        // Aggiorna totali per ticker
        marketCapTotal += newPrice;
        vol24hTotal += data[coins[i]].usd_24h_change || 0;
      });

      ticker.innerText = `Market Cap: ${marketCapTotal.toFixed(2)} | Vol 24h: ${vol24hTotal.toFixed(2)}`;

    } catch(e) { console.error(e); updateStatus(false); }
  }

  fetchPrices();
  setInterval(fetchPrices, updateInterval);

  // Grafico multi-coin
  const ctx = document.getElementById('priceChart').getContext('2d');
  const colors = ['blue','orange','green','purple','pink','brown'];
  const datasets = coins.map((coin, i) => ({
    label: coin.toUpperCase(),
    data: [],
    borderColor: colors[i],
    fill: false
  }));

  const priceChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets },
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

  // Pallini per ogni token
  const pallini = {};
  coinIds.forEach(id => {
    const p = document.createElement('span');
    p.classList.add('pallino');
    document.getElementById('chart-legend').appendChild(p);
    pallini[id] = p;
  });

  async function updateChart() {
    try {
      const promises = coins.map(c => fetch(`https://api.coingecko.com/api/v3/coins/${c}/market_chart?vs_currency=usd&days=1&interval=hourly`).then(r=>r.json()));
      const results = await Promise.all(promises);

      priceChart.data.labels = results[0].prices.map(p => new Date(p[0]).toLocaleTimeString());

      results.forEach((res,i) => {
        const oldPrice = priceChart.data.datasets[i].data.slice(-1)[0] || res.prices[0][1];
        const newPrice = res.prices.slice(-1)[0][1];

        priceChart.data.datasets[i].data = res.prices.map(p=>p[1]);

        // Aggiorna pallino colore
        const p = pallini[coinIds[i]];
        if(newPrice > oldPrice) p.style.backgroundColor='green';
        else if(newPrice < oldPrice) p.style.backgroundColor='red';
        else p.style.backgroundColor='gray';
      });

      priceChart.update();

      const lastPrice = results[0].prices.slice(-1)[0][1];
      const oldPrice = priceChart.data.datasets[0].data.slice(-2)[0] || lastPrice;
      document.getElementById('current-price').innerText = 'Prezzo: ' + lastPrice.toFixed(2);
      document.getElementById('price-change').innerText = 'Cambio: ' + (lastPrice - oldPrice).toFixed(2);
      document.getElementById('start-date').innerText = 'Start: ' + new Date(results[0].prices[0][0]).toLocaleDateString();
      document.getElementById('end-date').innerText = 'Oggi: ' + new Date().toLocaleDateString();

    } catch(e) { console.error(e); }
  }

  updateChart();
  setInterval(updateChart, updateInterval);
}
