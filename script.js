const dot = document.getElementById("dot");
const statusText = document.getElementById("statusText");
const tickerContent = document.getElementById("tickerContent");

// Simulazione Online / Offline
let online = true;

function updateStatus() {
    if (online) {
        dot.style.background = "green";
        statusText.textContent = "ONLINE";
    } else {
        dot.style.background = "red";
        statusText.textContent = "OFFLINE";
    }
}

setInterval(() => {
    online = !online;
    updateStatus();
}, 5000);

updateStatus();

// Carica dati JSON
fetch("data.json")
    .then(response => response.json())
    .then(data => {

        const changeClass = data.change24h >= 0 ? "positive" : "negative";
        const changeSymbol = data.change24h >= 0 ? "+" : "";

        tickerContent.innerHTML = `
            Market Cap: $${data.marketcap} |
            Vol 24h: $${data.volume24h} 
            <span class="${changeClass}">
                ${changeSymbol}${data.change24h}%
            </span> |
            Max Total Supply: ${data.maxSupply}
        `;
    })
    .catch(error => {
        tickerContent.innerHTML = "Errore nel caricamento dati...";
    });
