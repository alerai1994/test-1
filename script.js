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
  function updateStatus(online) {
    statusDot.style.backgroundColor = online ? 'green' : 'red';
  }
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

      // Aggiorna prezzi e colori
      coinIds.forEach((id, i) => {
        const priceElem = document.querySelector(`#${id} .price`);
        const oldPrice = parseFloat(priceElem.innerText.replace(',', '')) || 0;
        const newPrice = data[coins[i]].usd;
        priceElem.innerText = newPrice.toLocaleString();
        if(newPrice > oldPrice) priceElem.style.color = 'green';
        else if(newPrice < oldPrice) priceElem.style.color = 'red';
        else priceElem.style.color = 'black';
      });

      // Aggiorna ticker con percentuali
      const marketCapTotal = Object.values(data).reduce((acc, coin) => acc + (coin.usd || 0), 0);
      const vol24hTotal = Object.values(data).reduce((acc, coin) => acc + (coin.usd_24h_change || 0), 0);
      ticker.innerText = `Market Cap: ${marketCapTotal.toFixed(2)} (${(marketCapTotal/1000000).toFixed(2)}%) | Vol 24h: ${vol24hTotal.toFixed(2)} (${(vol24hTotal/1000000).toFixed(2)}%) | Max Total Supply: -`;

    } catch(e) {
      updateStatus(false);
      console.error(e);
    }
  }

  fetchPrices();
  setInterval(fetchPrices, updateInterval);

  // Grafico multi-coin
  const ctx = document.getElementById('priceChart').getContext('2d');
  const datasets = coins.map((coin, i) => ({
    label: coin.toUpperCase(),
    data: [],
    borderColor: `hsl(${i*60}, 80%, 50%)`,
    fill: false
  }));

  const priceChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets },
    options: {
      responsive: true,
