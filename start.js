// start.js
const mongoose = require('mongoose');
const throng = require('throng');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:Mood2207@cluster0-shard-00-00-2o5wv.gcp.mongodb.net:27017,cluster0-shard-00-01-2o5wv.gcp.mongodb.net:27017,cluster0-shard-00-02-2o5wv.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true');
mongoose.Promise = require('bluebird');

mongoose.connection.on('error', (err) => {
  console.error(`🚫 Database Error 🚫  → ${err}`);
});

function start() {
  /* You should require your models here so you don't have to initialise them all the time in
  different controlers*/
  require('./models/Shop');

  const app = require('./app');
  app.set('port', process.env.PORT || 3000);
  const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });
}


throng({
  workers: process.env.WEB_CONCURRENCY || 1,
}, start);
