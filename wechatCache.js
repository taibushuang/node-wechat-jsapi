// const mongoose = require('mongoose');

let mongoose;
try {
  mongoose = require('mongoose');
} catch (_) {
  // workaround when `npm link`'ed for development
  let prequire = require('parent-require')
    , mongoose = prequire('mongoose');
}


//key = appId_type
const wechatCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, index: {unique: true} },
  appId: String,
  type: String,
  value: { type: String, required: true }
},{timestamps:true});


const wechatCache = mongoose.model('wechatCache', wechatCacheSchema);

module.exports = wechatCache;
