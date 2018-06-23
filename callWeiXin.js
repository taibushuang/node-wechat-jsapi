let request = require('request');
let ACCESS_TOKEN_API = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID_VALUE&secret=SECRET_VALUE';
let TICKET_API = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN_VALUE&type=jsapi';
let cacheApi = require('./cacheApi');

let loadTokenFrom = 0; //0 for unknown, 1 for memory, 2 for local cache, 3 for wechat server;
let type_access_token = 'type_access_token';
let type_ticket = 'type_ticket';

let access_token = '';
let expire = 7200000;
let accessTokenGetTime = new Date();
let ticket = '';

let get = function(appid, secret, cb){
  //get token with appid and secret
  getAccessToken(function(err){
    if(err) {
      return cb(err);
    }
    getTicket(function(err){
      if(err) {
        return cb(err);
      }

      cb(null, access_token, ticket);
    });
  });

  function getAccessToken(atcb){
    loadTokenFrom = 0;
    //check is this access_token expire
    if(access_token && new Date().getTime() - accessTokenGetTime.getTime() < expire) {
      console.log('get access_token from local cache');
      loadTokenFrom = 1;
      return atcb(null);
    }

    console.log('will get access_token from local storage... appid=' + appid);
    let fuseStorage = false;
    cacheApi.loadObject(appid, type_access_token, function (err, tokenObject) {
      if(tokenObject) {
        access_token = tokenObject.value;
        accessTokenGetTime = tokenObject.updatedAt;
        console.log('accessTokenGetTime =' + accessTokenGetTime);

        if(access_token && new Date().getTime() - accessTokenGetTime.getTime() < expire) {
          fuseStorage = true;
          loadTokenFrom = 2;
          console.log('get access_token from local cache');
          return atcb(null);
        }
      }

      if(!fuseStorage) {
        console.log('will get access_token from wechat server... appid=' + appid);

        //get from weixin
        request.get(ACCESS_TOKEN_API.replace('APPID_VALUE', appid).replace('SECRET_VALUE', secret), function(err, response, body){
          if(err) {
            return atcb(err);
          }

          try{
            body = JSON.parse(body);
          } catch(e) {
            return atcb(new Error('json from weixin con NOT parse, body: ' + body));
          }

          if(!body.access_token) {
            return atcb(new Error('can NOT get access_token from weixin server.'));
          } else {
            access_token = body.access_token;
            accessTokenGetTime = new Date();

            let cacheObject = {
              key: appid + '_' + type_access_token,
              appId: appid,
              type: type_access_token,
              value: access_token
            };

            console.log('will save cacheObject = ' + JSON.stringify(cacheObject, null, 2));
            
            cacheApi.cacheObject(cacheObject, function (err, cachedObject) {
              if(err) {
                console.error(err);
              }
            });
          }
          if(body.expire) expire = Number(body.expire)*1000;
          console.log('get access_token from weixin server');
          atcb(null);
        });
      }
    });
  }

  function getTicketLocal(callback) {
    if((1 === loadTokenFrom)&&(ticket)&&(ticket.length > 0)) {
      return callback(null, ticket);
    } else if(2 === loadTokenFrom) {
      cacheApi.loadObject(appid, type_ticket, function (err, ticketObject) {
        if(ticketObject) {
          ticket = ticketObject.value;

          console.log('get ticket from local cache');
          return callback(null, ticket);
        }
        return callback(err);
      });
    } else {
      let err = 'need call wechat server !';
      return callback(err);
    }
  }

  function getTicket(tcb){
    getTicketLocal(function (err, ticketObject) {
      if(ticketObject) {
        return tcb(null, ticketObject);
      }

      request.get(TICKET_API.replace('ACCESS_TOKEN_VALUE', access_token), function(err, response, body) {
        if(err) {
          return tcb(err);
        }

        try{
          body = JSON.parse(body);
        } catch(e) {
          return tcb(new Error('json from weixin con NOT parse, body: ' + body));
        }

        if('ok' === body.errmsg && body.ticket) {
          ticket = body.ticket;

          let cacheObject = {
            key: appid + '_' + type_ticket,
            appId: appid,
            type: type_ticket,
            value: ticket
          };
          cacheApi.cacheObject(cacheObject, function (err, cachedObject) {
            if(err) {
              console.error(err);
            }
          });
          return tcb(null);
        } else {
          return tcb(new Error('get ticket failed'));
        }
      });
    });
  }
};


exports.get = get;