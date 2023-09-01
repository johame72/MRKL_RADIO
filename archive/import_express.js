import express from 'express';
import icy from 'icy';

const app = express();
const PORT = 8106;

const STATIONS = {
    "KEXP": {
        name: "KEXP Seattle",
        url: "https://kexp.streamguys1.com/kexp320.aac",
        type: "audio/aac"
    },
    // ... other stations ...
    "WOOD": {
        name: "WOOD_89.1",
        url: "https://streamdb3web.securenetsystems.net/CirrusOmni/index.cfm?stationCallSign=KCLC",
        type: "audio/mp3"
    }
};

app.get('/stream/:station', (req, res) => {
    const station = req.params.station;
    const streamUrl = STATIONS[station].url;

    icy.get(streamUrl, (response) => {
        let metadata = '';

        response.on('metadata', (meta) => {
            metadata += meta;
        });

        response.on('end', () => {
            const artist = parseMetadata(metadata, 'artist');
            const song = parseMetadata(metadata, 'title');

            res.json({ artist, song });
        });

        response.resume();
    });

    req.on('close', () => {
        // Close the icy stream connection if the client disconnects
        icy.get(streamUrl, (response) => {
            response.abort();
        });
    });
});

function parseMetadata(metadata, key) {
    const regex = new RegExp(`${key}='([^']+)';`);
    const match = metadata.match(regex);

    if (match && match[1]) {
        return match[1];
    } else {
        return '';
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});