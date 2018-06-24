
var sign = require('./sign.js');
var callWeiXin = require('./callWeiXin');

var APIManager  = function (config) {
  this.appId = config.appId;
  this.secret = config.secret;
  return this;
}

//签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）,
// url（当前网页的URL，不包含#及其后面部分） 。对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，
// 使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。这里需要注意的是所有参数名均为小写字符。
// 对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。

APIManager.prototype.getSignText = function(url, callback){

  callWeiXin.get(this.appId, this.secret, false, function(err, access_token, ticket){
    if(err) {
      callback(err, null);
    } else {
      var index = url.indexOf("#");
      if(index > 0) {
        url = url.split(0, index);
      }
      var signText = sign(ticket, url);
      signText.appId = this.appId;

      callback(null, signText);
    }
  });
};

APIManager.prototype.getSignTextByForce = function(url, callback){

  callWeiXin.get(this.appId, this.secret, true, function(err, access_token, ticket){
    if(err) {
      callback(err, null);
    } else {
      var index = url.indexOf("#");
      if(index > 0) {
        url = url.split(0, index);
      }
      var signText = sign(ticket, url);
      signText.appId = this.appId;

      callback(null, signText);
    }
  });
};

exports.APIManager = APIManager;