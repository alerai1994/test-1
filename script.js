// Carica il file JSON con la configurazione
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        config.symbols.forEach(symbol => {
            // Connetti a ciascun WebSocket per ogni simbolo
            const ws = new WebSocket(symbol.websocket);

            let previousPrice = null;

            ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data).data;
                let price = null;

                // Gestisci i simboli che provengono da Binance
                if (data && data.p) {
                    price = parseFloat(data.p).toFixed(6);
                }
                // Gestisci PancakeSwap per ORE
                else if (data && data.price) {
                    price = parseFloat(data.price).toFixed(6);
                }

                const priceElement = document.getElementById(symbol.pair);
                if (priceElement) {
                    if (previousPrice !== null) {
                        if (price > previousPrice) {
                            priceElement.classList.remove("red");
                            priceElement.classList.add("green");
                        } else if (price < previousPrice) {
                            priceElement.classList.remove("green");
                            priceElement.classList.add("red");
                        }
                    }

                    // Aggiorna il prezzo
                    priceElement.textContent = `$${price}`;
                    previousPrice = price;
                }
            };
        });
    })
    .catch(error => {
        console.error("Errore nel caricare il file JSON: ", error);
    });
