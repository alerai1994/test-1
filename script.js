const cards = document.querySelectorAll(".card");

async function updatePrices() {
  const ids = [
    "bitcoin",
    "ethereum",
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
