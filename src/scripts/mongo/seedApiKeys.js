// DEBUG=app:* node scripts/mongo/seedApiKeys.js
//DEBUG=app:* node src/scripts/mongo/seedApiKeys.js

const chalk = require('chalk');
const debug = require('debug')('app:scripts:api-keys');
const crypto = require('crypto');
const MongoConnect = require('../../lib/mongo');

const adminScopes = [
  'signin:auth',
  'signup:auth',
  'read:products',
  'create:products',
  'update:products',
  'delete:products',
  'read:user-products_cart',
  'create:user-products_cart',
  'delete:user-products_cart'
];  

const publicScopes = [
  'signin:auth',
  'signup:auth',
  'read:products',
  'read:user-products_cart',
  'create:user-products_cart',
  'delete:user-products_cart'
];

const apiKeys = [
  {
    token: generateRandomToken(),
    scopes: adminScopes
  },
  {
    token: generateRandomToken(),
    scopes: publicScopes
  }
];

function generateRandomToken() {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('hex');
}

async function seedApiKeys() {
  try {
    const mongoDB = new MongoConnect();

    const promises = apiKeys.map(async apiKey => {
      await mongoDB.create('api-keys', apiKey)
    });

    await Promise.all(promises);
    debug(chalk.green(`${promises.length} api-keys have been generated succesfully`));
    return process.exit(0);
  } catch (err) {
    debug(chalk.red(err));
    process.exit(1);
  }
}

seedApiKeys();