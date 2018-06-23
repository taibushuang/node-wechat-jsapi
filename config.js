module.exports = {
  appid: 'appId_of_your_app',
  port: 8131,
  secret: 'secret_of_your_app',
  enable_mongoose_debug: false,
  mongo_url: process.env.MONGODB || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/dbname',
};