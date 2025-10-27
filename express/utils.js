const fs = require('node:fs/promises');
const path = require('node:path');

function usePromise (promise) {
    return promise.then(data => [undefined, data]).catch(e => [e]);
}

async function readData () {
    const [err, data] = await usePromise(fs.readFile('./data.json', { encoding: 'utf8' }));
    if (err) return [err];

    return [null, JSON.parse(data)];
}

function writeData (data) {
    return usePromise(fs.writeFile(path.resolve(__dirname, 'data.json'), JSON.stringify(data)));
}

module.exports = {
    usePromise,
    readData,
    writeData
};