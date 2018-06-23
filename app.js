'use strict';
let sign = require('./sign.js');
let http = require('http');
let express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

let config = require('./config.js');
let callWeiXin = require('./callWeiXin');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
let cacheApi = require('./cacheApi');

let app = http.createServer();
let server = express(app);

server.listen(config.port, function(){
  console.log('runing on port: ', config.port);
});

mongoose.set('debug', config.enable_mongoose_debug);
mongoose.Promise = Promise;
mongoose.connect(config.mongo_url);
mongoose.connection.once('open', () => {
  console.log('MongoDB openned.');
});


server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'jsapi',
  cookie: { secure: false },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

cacheApi.setConfig(true);

server.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",'nodejs-weixin')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

server.get('/sign', function(req, res, next){
  callWeiXin.get(config.appid, config.secret, function(err, access_token, ticket){
    if(err) {
      return res.status(500).json({code: 500});
    } else {
      let url = req.protocol + '://' + req.get('host') + req.originalUrl;
      url = req.headers['referer'] || "";
      let index = url.indexOf("#");
      if(index > 0) {
        // url = url.split(0, index);
      }
      // url = encodeURIComponent(url);
      let signText = sign(ticket, url);
      signText.appId = config.appid;
      res.json(signText);
    }
  });
});

server.use(function(req, res, next){
  // res.header("Content-Type", "application/html;charset=utf-8");
  next();
});
server.use(express.static('./public'));

server.use(function(req, res, next){
  res.json({code: 404});
});