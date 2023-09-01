let IcyMetadata = require('icy-metadata'),
    express = require('express'),
    fs = require('fs'),

    app = express(),
    readStream = null,
    streamSource = './samples/01.mp3',
    icyMetadata = new IcyMetadata(10000),
    exampleDescription = 'Open "Winamp" or e.t. then play stream url "http://localhost/stream" to see stream metadata.';

app.get('/', function(request, response) {
    response.send('<html><body>' + exampleDescription + '</body></html>');
});

app.listen(80, 'localhost', function() {
    console.log(exampleDescription);
});

app.get('\/stream', function(request, response) {
    if (!readStream) {
        readStream = fs.createReadStream(streamSource);
        let header = {
            'icy-name': 'icy-metadata usage example',
            'Content-Type': 'audio/mpeg',
            'icy-metaint': icyMetadata.metaInt,
            'Connection': 'keep-alive'
        };
        response.writeHead(200, header);
        icyMetadata.setStreamTitle('Super Mario Bros. (NES): Level 1-2');
        readStream.pipe(icyMetadata).pipe(response, {end: false});
    } else {
        response.send('<html><body>Only one connection allowed for this example</body></html>');
    }
});

exports = app;