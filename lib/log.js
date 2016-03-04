/**
 * Created by linfeiyang on 3/4/16.
 */
'use strict';
var winston = require('winston');
var moment = require('moment');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'info',
            timestamp: function () {
                return moment().format('YYYY-MM-DD HH:mm:ss');
            }
        }),
        new (winston.transports.File)({
            filename: 'wechat.log',
            level: 'info'
        })
    ]
});
module.exports = logger;