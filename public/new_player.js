document.addEventListener('DOMContentLoaded', () => {
    // ... [The rest of your code]

    let eventSource;
    let fetchMetadataTimeout;

    const setupEventSource = (stationKey) => {
        // ... [The rest of your existing code]

        eventSource.onmessage = event => {
            const data = JSON.parse(event.data);
            console.log("Data received from EventSource:", data);
            if (data.artist) {
                currentlyPlayingArtist.innerText = data.artist;

                // Fetch news for the artist
                fetch(`/artist-news/${encodeURIComponent(data.artist)}`)
                    .then(response => response.json())
                    .then(articles => {
                        // Display the news articles in your UI (this is a basic example)
                        const newsList = document.getElementById('newsList');
                        newsList.innerHTML = articles.map(article => `<li><a href="${article.url}" target="_blank">${article.title}</a></li>`).join('');
                    })
                    .catch(error => console.error("Failed to fetch artist news", error));

                // Fetch tour dates for the artist (placeholder for now)
                fetch(`/artist-tour/${encodeURIComponent(data.artist)}`)
                    .then(response => response.json())
                    .then(data => {
                        // Display the tour dates in your UI (this is a basic example)
                        const tourList = document.getElementById('tourList');
                        tourList.innerHTML = `<li>${data.tourDates}</li>`;
                    })
                    .catch(error => console.error("Failed to fetch artist tour dates", error));
            }
        };
    };

    // ... [The rest of your code]

    initializeStation("KEXP");
});
