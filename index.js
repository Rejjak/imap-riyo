var EventEmitter = require('events').EventEmitter;
var util = require('util');

var getClasses = require('./lib/classLoader');
var ImapExtensionClass = getClasses.loadClass('imap_extension');
var loadDataClass = getClasses.loadClass('parse_emails');

function extentedConfig(config){
    var __this = this;
    var imap = new ImapExtensionClass(config);
    var data = new loadDataClass(imap);
    imap.start_connection();
    data.on('onComplete',function(finalData){
        __this.emit('success',finalData);
        imap.stop();
    });
}

util.inherits(extentedConfig,EventEmitter);

module.exports = extentedConfig;
