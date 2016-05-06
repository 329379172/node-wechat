/**
 * Created by linfeiyang on 3/16/16.
 */
"use strict";
var request = require('request');
var async = require('async');
var config = require('../../config');
var Util = require('../Util');
var log = require('../log');
module.exports = (Client) => {

    Client.getMessage = (callback) => {
        let url = Client.baseUri + "/webwxsync?lang=zh_CN&pass_ticket=" + Client.cookies.pass_ticket
            + "&skey=" + Client.cookies.skey + "&sid=" + Client.cookies.wxsid + "&r=" + Date.now();
        //log.info(url);
        let ret = null;
        async.waterfall([
            (next) => {
                let body = {
                    BaseRequest: Client.BaseRequest,
                    SyncKey: Client.SyncKeyObj,
                    rr: Date.now()
                };
                Util.formPost(url, body, (err, res) => {
                    if (err) return next(err);
                    var SyncKey = '';
                    Client.SyncKeyObj = res.SyncKey;
                    res.SyncKey.List.forEach((item) => {
                        SyncKey += '|' + item.Key + '_' + item.Val;
                    });
                    Client.SyncKey = SyncKey;
                    next(err, res);
                });
            },
            (res, next) => {
                if (!res) return next(new Error('no result on get message'));
                ret = res.AddMsgList;
                next();
            }
        ], (err) => {
            if (err) {
                log.info(err.message);
                callback(err)
            }
            callback(null, ret);
        });
    };

    Client.sendMessage = (message, callback) => {
        let url = Client.baseUri + "/webwxsendmsg?pass_ticket=" + encodeURIComponent(Client.cookies.pass_ticket);
        log.info(url);
        let now =  Date.now();
        let rand = Math.random() * 10000;
        if(rand < 1000) rand +=1000;
        if(rand >=10000) rand = 9999;
        //let ClientMsgId = Math.round(now / 10000) + rand;
        let body = {
            BaseRequest: Client.BaseRequest,
            Msg: {
                Type: message.type || 1,
                Content: message.Content || "hi",
                FromUserName: Client.User.UserName,
                ToUserName: message.ToUserName,
                LocalID: now,
                ClientMsgId: now
            }
        };
        console.log(body);
        Util.formPost(url, body, (err, res) => {
            if(err){
                log.info(err.message);
            } else {
                log.info('发送消息成功');
            }
            callback(err, res);
        })
    };

};