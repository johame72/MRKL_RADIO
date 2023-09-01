let IcyMetadata = require('./icy-metadata'),
    express = require('express'),
    fs = require('fs'),

    app = express(),
    readStream = null,
    streamSource = ['./samples/01.mp3', './samples/02.mp3'],
    streamIndex = 0,
    icyMetadata = new IcyMetadata(30000),
    exampleDescription = 'Open "Winamp" or e.t. then play stream url "http://localhost/stream" to see stream metadata.',
    storedResponse;

app.get('/', function(request, response) {
    response.send('<html><body>' + exampleDescription + '</body></html>');
});

app.listen(80, 'localhost', function() {
    console.log(exampleDescription);
});

let playNextSource = () => {
    if (streamIndex >= streamSource.length){
        return;
    }
    streamIndex++;
    var newReadStream = fs.createReadStream(streamSource[streamIndex]);
    var newIcyMetadata = new IcyMetadata(30000, icyMetadata.bytesBeforeMeta);
    newIcyMetadata.setStreamTitle('some drum roll');
    newReadStream.pipe(newIcyMetadata).pipe(storedResponse, {end: false});
    readStream.close();
    icyMetadata.unpipe();
}

app.get('\/stream', function(request, response) {
    if (!readStream) {
        readStream = fs.createReadStream(streamSource[streamIndex]);
        readStream.on('end', playNextSource)
        let header = {
            'icy-name': 'icy-metadata usage example',
            'Content-Type': 'audio/mpeg',
            'icy-metaint': icyMetadata.metaInt,
            'Connection': 'keep-alive'
        };
        response.writeHead(200, header);
        icyMetadata.setStreamTitle('Super Mario Bros');
        readStream.pipe(icyMetadata).pipe(response, {end: false});
        storedResponse = response;
    } else {
        response.send('<html><body>Only one connection allowed for this example</body></html>');
    }
});

exports = app;