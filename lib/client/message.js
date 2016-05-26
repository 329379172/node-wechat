/**
 * Created by linfeiyang on 3/16/16.
 */
"use strict";
var request = require('request');
var async = require('async');
var config = require('../../config');
var Util = require('../Util');
var log = require('../log');
var fs = require('fs');
var path = require('path');
const wechat4u = require('wechat4u');
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
        let now = Util.getMsgIdFromTimeStamp();
        //let ClientMsgId = Math.round(now / 10000) + rand;
        if(message.type == 1) {
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
            Util.formPost(url, body, (err, res) => {
                if(err){
                    log.info(err.message);
                } else {
                    log.info('发送消息成功');
                }
                callback(err, res);
            })
        } else {
        }
    };

    Client.webWxUploadAndSendMedia = (fromUser, toUser, filePath, callback)  => {
        log.info('webWxUploadAndSendMedia');
        let url = config.baseUploadUrl + config.webWxUploadMedia + "?f=json";
        let newLine = '\r\n';
        let new2Lines = '\r\n\r\n';
        let boundaryInContentType = '----WebKitFormBoundaryoIZX50qII6ZUUQAX';// + Math.random().toString(16)
        let boundary = '--' + boundaryInContentType;
        let boundaryKey = boundary + newLine;
        let endBoundary = '\r\n\r\n--' + boundaryInContentType + '--\r\n';

        let UPLOAD_MEDIA_TYPE_ATTACHMENT = 4;
        //let file = fs.openSync(filePath, 'r');
        let stats = fs.statSync(filePath);
        let fileName = path.basename(filePath);
        let ext = path.extname(filePath).split('.')[1];


        Util.httpUploadFile2(url, filePath, 'png', stats.size);
        return;

        let wuFileType = {
            jpg: 'WU_FILE_0',
            jpeg: 'WU_FILE_0',
            png: 'WU_FILE_0',
            gif: 'WU_FILE_3'
        };

        let mediaType = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif'
        };

        let mediaT = {
            jpg: 'pic',
            jpeg: 'pic',
            png: 'pic',
            gif: 'doc'
        };
        log.info('stats:' + JSON.stringify(stats));

        log.info(ext);

        let content = boundaryKey;
        content += 'Content-Disposition: form-data; name="id"' + new2Lines;
        content +=  wuFileType[ext] + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="name"' + new2Lines;
        content += fileName + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="type"' + new2Lines;
        content += mediaType[ext] + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="lastModifiedDate"' + new2Lines;
        content += stats.mtime + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="size"' + new2Lines;
        content += stats.size + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="mediatype"' + new2Lines;
        content += mediaT[ext] + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="uploadmediarequest"' + new2Lines;
        let uploadMediaRequest = {
            BaseRequest: Client.BaseRequest,
            ClientMediaId: +new Date,
            TotalLen: stats.size,
            StartPos: 0,
            DataLen: stats.size,
            MediaType: UPLOAD_MEDIA_TYPE_ATTACHMENT
        };
        content += JSON.stringify(uploadMediaRequest) + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="webwx_data_ticket"' + new2Lines;
        content += Client.cookies.webwx_data_ticket + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="pass_ticket"' + new2Lines;
        content += 'jfL17ewPjc7ArkA84QGNyxpnL7bq7ZEaUJ8x4r/MzsliajJ8F1KT4RIQB73Zn9IW' + newLine;

        content += boundaryKey;
        content += 'Content-Disposition: form-data; name="filename"; filename="' + fileName + '"' + newLine;
        content += 'Content-Type: ' + mediaType[ext] + new2Lines;

        log.info('stats size:' + stats.size);

        let contentLength = content.length + endBoundary.length + stats.size;

        let header = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4",
            "Content-Length": contentLength,
            "Connection": "keep-alive",
            'Content-Type': 'multipart/form-data; boundary=' + boundaryInContentType
            // "Host": "file2.wx.qq.com"
            // "Origin": "https://wx2.qq.com"
            // "Referer": "https://wx2.qq.com/"
        };

        let options = {
            "url": url,
            "headers": header
        };

        let params = {
            "boundary": boundary,
            "endBoundary": endBoundary,
            "filePath": filePath
        };

        log.info('httpUploadFile');
        log.info(content);
        Util.httpUploadFile(options, params, content, (err, body) => {
            log.info('upload over');
            log.info(err);
            log.info(body);
            if(err) {
                log.error(err);
                return
            }
            let jsonBody = JSON.parse(body);
            if(jsonBody.BaseResponse.Ret == 0) {
                let mediaId = jsonBody.MediaId;
                if(ext != 'gif'){
                    Client.sendImage(fromUser, toUser, mediaId, callback);
                } else {
                    log.info('gif no send');
                }
            }
        });
    };

    Client.sendImage = (fromUser, toUser, mediaId, callback) => {
        log.debug('mediaId:' + mediaId);
        let url = Client.baseUri + config.webwxsendmsgimg + "?fun=async&f=json";
        let msgId = Util.getMsgIdFromTimeStamp();
        let m = {
            Type: 3,
            MediaId: mediaId,
            FromUserName: fromUser,
            ToUserName: toUser,
            LocalID: msgId,
            ClientMsgId: msgId
        };
        let params = {
            "BaseRequest": Client.BaseRequest,
            "Msg": m
        };
        Util.formPost(url, params, callback);
    };

};