/**
 * Created by linfeiyang on 3/12/16.
 */
"use strict";
var config = require('../../config');
var Util = require('../Util');

module.exports = (Client) => {

    Client.loadUser = (callback) => {
        var body = {
            BaseRequest: Client.BaseRequest
        };
        var url = Client.baseUri + '/webwxgetcontact?r=' + Date.now() + '&seq=0&skey=' + Client.cookies.skey + '&pass_ticket=' + Client.cookies.pass_ticket;
        Util.formPost(url, body, (err, res) => {
            if (err) {
                callback(err);
            } else {
                Client.users = res.MemberList;
                callback();
            }
        });
    };

    Client.statusNotify = (callback) => {
        var url = Client.baseUri + '/webwxstatusnotify?lang=zh_CN&pass_ticket=' + Client.cookies.pass_ticket;
        var body = {
            BaseRequest: Client.BaseRequest,
            Code: 3,
            FromUserName: Client.User.UserName,
            ToUserName: Client.User.UserName,
            ClientMsgId: Date.now()
        };
        Util.formPost(url, body, (err, res) => {
            if (err) return callback(err);
            callback(null, res);
        });
    };

    Client.getUserName = (uid) => {
        if(Client.users && Client.users.length > 0) {
            Client.users.forEach(function(item){
                if(item.UserName == uid) {
                    return item.NickName;
                }
            });
        }
        return '未知用户名';
    };


};