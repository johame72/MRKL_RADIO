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
    "ClassicFM": {
        name: "ClassicFM",
        url: "http://media-ice.musicradio.com/ClassicFMMP3",
        type: "audio/mp3"
    },
    "KDHX": {
        name: "KDHX",
        url: "http://kdhx-ice.streamguys1.com/live",
        type: "audio/mp3"
    },
    "Chill": {
        name: "Senza Chill",
        url: "http://151.80.43.143:8044/.mp3",
        type: "audio/aac"
    },
    "MotherEarth2": {
        name: "Mother Earth Radio",
        url: "http://server9.streamserver24.com:18900/motherearth.aac",
        type: "audio/aac"
    },
    "GRUNGE": {
        name: "GRUNGE",
        url: "https://streaming.live365.com/a48797",
        type: "audio/aac"
    },
    "GRUNGE2": {
        name: "GRUNGE2",
        url: "https://streams.radiobob.de/bob-grunge/mp3-192/streams",
        type: "audio/mp3"      
    },
    "JAZZ": {
        name: "JAZZ Spokane",
        url: "http://kewuradio.ewu.edu/KEWU_Jazz_89.5",
        type: "audio/aac"
    },
    "JRock": {
        name: "Radio Paradise - Jay Rock",
        url: "http://stream.radioparadise.com/rock-320",
        type: "audio/aac"
    },
    "MainMix": {
        name: "Radio Paradise Main Mix",
        url: "http://stream.radioparadise.com/aac-320",
        type: "audio/aac" // Assuming the stream type is flac; adjust if different
    },
    "Riverside": {
        name: "Riverside Radio",
        url: "https://stream.and-stuff.nl:8443/riversideMp3",
        type: "audio/mp3"
    },
    "KAMU": {
        name: "KAMU-FM Live Radio",
        url: "https://kamu.streamguys1.com/hd1-192",
        type: "audio/mp3"
    },
    "Classical": {
        name: "KAMU-Classical Live Radio",
        url: "https://kamu.streamguys1.com/hd2-192",
        type: "audio/mp3"
    },
    "WDET": {
        name: "WDET Detroit Public Radio",
        url: "https://wdet.streamguys1.com/live-aac256",
        type: "audio/aac"
    },
    "UKBlues": {
        name: "UK Blues",
        url: "https://bluesserver.rock-radio.uk/stream1",
        type: "audio/aac" // Assuming the stream type is flac; adjust if different
    },
    "BluesGold": {
        name: "Bluesmen Channel Gold",
        url: "http://vmi218518.contaboserver.net:8114/;",
        type: "audio/aac"
    },
    "INTENSE": {
        name: "Intense Radio",
        url: "https://intenseradio.live-streams.nl:18000/live",
        type: "audio/aac"
    },
    "WOOD": {
        name: "WOOD_89.1",
        url: "https://streamdb3web.securenetsystems.net/CirrusOmni/index.cfm?stationCallSign=KCLC",
        type: "audio/mp3"
    }
};

const clients = {};

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/metadata/:station', (req, res) => {
    const stationKey = req.params.station;
    const station = STATIONS[stationKey];
    if (!station) {
        return res.status(404).send("Station not found");
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // This is important to keep the connection alive

    let streamConnection;  // Define a variable to hold the icy stream connection.

    icy.get(station.url, (streamRes) => {
        streamConnection = streamRes;  // Store the icy connection

        streamRes.on('metadata', (metadata) => {
            const parsed = icy.parse(metadata);
            if (parsed && parsed.StreamTitle) {
                res.write(`data: ${JSON.stringify({ artist: parsed.StreamTitle })}\n\n`);
            }
        });
    });

    // Listen for the 'close' event on the request. This event is triggered when the client disconnects.
    req.on('close', () => {
        if (streamConnection) {
            streamConnection.destroy();  // Close the icy stream connection
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



