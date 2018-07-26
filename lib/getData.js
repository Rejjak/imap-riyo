
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function manageData(imap){
    var email_result = [];
    __this = this;
    imap.on("get_mail", function(mails,seqn,attr){
        email_result.push(mails);
    });

    var getStatus = new Promise(function(resolve,reject){
        imap.on("send",function(data){
            resolve(data);
        });
    });
    
    getStatus.then(function(data){
        var newData = Object.create(null);
        newData.data = email_result;
        if(email_result.length > 0){
            newData.status = true;
        }else{
            newData.status = false;
        }
        __this.emit('onComplete',newData);
    });
}

util.inherits(manageData, EventEmitter);

module.exports = manageData;

