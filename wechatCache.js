const mongoose = require('mongoose');

//key = appId_type
const wechatCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, index: {unique: true} },
  appId: String,
  type: String,
  value: { type: String, required: true }
},{timestamps:true});


const wechatCache = mongoose.model('wechatCache', wechatCacheSchema);

module.exports = wechatCache;
