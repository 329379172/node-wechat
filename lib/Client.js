/**
 * Created by linfeiyang on 3/2/16.
 */
var Client = {};
require('./client/login')(Client);
require('./client/qrcode')(Client);
require('./client/cookie')(Client);
module.exports = Client;