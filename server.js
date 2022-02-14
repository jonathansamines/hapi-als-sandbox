'use strict';

const { AsyncLocalStorage } = require('async_hooks');
const Hapi = require('@hapi/hapi');

async function run() {
    const storage = new AsyncLocalStorage();
    const server = Hapi.server({ host: 'localhost', port: 4040 });

    process.storage = storage;

    function thing() {
        console.log(storage.getStore()?.get('key') ?? 'unknown');
    }
    
    server.ext('onRequest', async function onRequest(request, h) {
        const store = new Map();

        storage.enterWith(store);
        store.set('key', 'value');

            thing();
            return h.continue;
    });

    server.route({
        method: 'GET',
        path: '/',
        handler(request, h) {
            const value = storage.getStore()?.get('key') ?? 'unknown';

            return {
                value,
            };
        }
    });

    await server.start();
}

run()
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });