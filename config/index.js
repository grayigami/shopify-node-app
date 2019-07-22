const env = process.env.NODE_ENV;
const production = require('./production');
const development = require('./development');

// You should put any global variables in here.
const config = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || '',
  SHOPIFY_SHARED_SECRET: process.env.SHOPIFY_SHARED_SECRET || '',
  APP_NAME: 'Penguin Web Kit',
  APP_STORE_NAME: 'penguin-web-kit',
  APP_SCOPE: 'read_orders,write_orders,read_products,write_products,read_customers,write_customers,read_content,write_content',
  DATABASE_NAME: 'shops',
};

if (env !== 'PRODUCTION') {
  module.exports = Object.assign({}, config, development);
} else {
  module.exports = Object.assign({}, config, production);
}
