const coins = [
    "bitcoin",
    "ethereum",
    "binancecoin",
    "solana",
    "ore-network",
    "raydium"
];

async function getPrices() {
    try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(
            ","
        )}&vs_currencies=usd`;

        const res = await fetch(url);
        const data = await res.json();

        coins.forEach(coin => {
            const priceElement = document.querySelector(
                `#${coin} .price`
            );
            priceElement.textContent = `$${data[coin].usd}`;
        });

    } catch (error) {
        console.error("Errore nel recupero prezzi", error);
    }
}

// primo caricamento
getPrices();

// aggiornamento ogni 10 secondi
setInterval(getPrices, 10000);
