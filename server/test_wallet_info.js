require('dotenv').config();
const { DfnsApiClient } = require('@dfns/sdk');
const { AsymmetricKeySigner } = require('@dfns/sdk-keysigner');

const authUrl = process.env.DFNS_BASE_URL || 'https://api.dfns.ninja';
let privateKey = process.env.DFNS_PRIVATE_KEY || '';
if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

const signer = new AsymmetricKeySigner({
    privateKey: privateKey,
    credId: process.env.DFNS_CRED_ID || '',
});

const initConfig = {
    authToken: process.env.DFNS_API_KEY || 'dummy',
    baseUrl: authUrl,
    signer,
};

if (process.env.DFNS_APP_ID) {
    initConfig.appId = process.env.DFNS_APP_ID;
}

const dfns = new DfnsApiClient(initConfig);

async function test() {
    try {
        const wallets = await dfns.wallets.listWallets();
        console.log("WALLETS:", JSON.stringify(wallets.items.slice(0, 1), null, 2));
    } catch (e) {
        console.error('DFNS API ERROR:', e.message);
    }
}

test();
