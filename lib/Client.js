/**
 * Created by linfeiyang on 3/2/16.
 */
var Client = {errorCount: 0};
require('./client/login')(Client);
require('./client/qrcode')(Client);
require('./client/cookie')(Client);
require('./client/user')(Client);
require('./client/sync')(Client);
require('./client/message')(Client);
module.exports = Client;