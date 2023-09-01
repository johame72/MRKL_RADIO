const Transform = require('stream').Transform,
    META_INT = 50000;
    META_BLOCK_SIZE = 16,
    MAX_LENGTH = META_BLOCK_SIZE * 255,
    NO_METADATA = new Buffer([0]);

class IcyMetadata extends Transform {

    constructor(metaInt, bytesBeforeMeta) {
        super();
        this._metaInt = metaInt > 0 ? metaInt : META_INT;
        this._bytesBeforeMeta = parseInt(bytesBeforeMeta) >= 0 ? parseInt(bytesBeforeMeta) : this.metaInt;
    }

    get metaInt() {
        return this._metaInt;
    }

    get bytesBeforeMeta() {
        return this._bytesBeforeMeta;
    }

    _transform(chunk, encoding, callback) {

        let chunkIndex = 0,
            chunkLength = chunk.length,
            result = new Buffer([]);

        if (this._bytesBeforeMeta > 0) {

            chunkIndex = Math.min(this._bytesBeforeMeta, chunkLength);
            result = addToBuffer(result, chunk.slice(0, chunkIndex));
            this._bytesBeforeMeta -= chunkIndex;

            if (this._bytesBeforeMeta === 0) {
                result = addToBuffer(result, getBufferedMetaData(this));
                this._bytesBeforeMeta = this.metaInt;
            }
        }

        while (chunkIndex + this.metaInt < chunkLength) {

            result = addToBuffer(result, chunk.slice(chunkIndex, chunkIndex + this.metaInt));
            chunkIndex += this.metaInt;

            result = addToBuffer(result, getBufferedMetaData(this));
            this._bytesBeforeMeta = this.metaInt;
        }

        result = addToBuffer(result, chunk.slice(chunkIndex, chunkLength));
        this._bytesBeforeMeta -= (chunkLength - chunkIndex);

        if (this._bytesBeforeMeta === 0) {
            result = addToBuffer(result, getBufferedMetaData(this));
            this._bytesBeforeMeta = this.metaInt;
        }

        callback(null, result);
    }

    setRawMetaData(value) {
        this.metaData = value;
    }

    setStreamTitle(value) {
        this.metaData = "StreamTitle='" + value + "';";
    }
}

function addToBuffer(source, addingValue) {
    return Buffer.concat([source, addingValue], source.length + addingValue.length);
}

function getBufferedMetaData(context) {

    if (!context.metaData || context.metaData.length == 0) {
        return NO_METADATA;
    }
    //cut metadata string if it length more than 4080 bytes
    const len = Math.min(MAX_LENGTH, Buffer.byteLength(context.metaData) + 1)
    const metadataSize = Math.ceil(len / META_BLOCK_SIZE);
    let result = new Buffer(metadataSize * META_BLOCK_SIZE + 1);
    result[0] = metadataSize;
    const writtenBytes = result.write(context.metaData, 1) + 1;
    result.fill(0, writtenBytes, result.length)

    context.metaData = "";
    return result;
}

module.exports = IcyMetadata;
