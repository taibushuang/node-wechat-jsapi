//'use strict'; ES6 use strict by default
let wechatCache = require('./wechatCache');
let fSaveToMongo = true;


let setConfig = function(flag) {
  fSaveToMongo = flag;
};

function cacheObject(object, callback) {
  if(!fSaveToMongo) {
    return callback(null, object);
  }

  if(!object){
    let err = 'null object !!';
    return callback(err, null);
  }

  object.key = object.appId + '_' + object.type;
  wechatCache.findOneAndUpdate({"key":object.key},
    {$set: object},
    {upsert: true},
    function(err, res) {
      return callback(err, res);
    });
}

function loadObject(appId, type, callback) {
  let strKey = appId + '_' + type;
  loadBykey(strKey, callback);
}

function loadBykey(strKey, callback) {
  if(!fSaveToMongo) {
    let err = 'fSaveToMongo disabled !!';
    return callback(err, null);
  }

  if(!strKey){
    let err = 'null strKey !!';
    callback(err, null);
  }

  wechatCache.findOne({"key":strKey},
    function(err, object) {
      callback(err, object);
    });
}


module.exports = {
  setConfig,
  cacheObject,
  loadObject,
  loadBykey
}