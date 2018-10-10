var Imap = require('imap');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var MailParser = require('./mailparser/').MailParser;
var async = require('async');
var fs = require('fs');
var base64  = require('base64-stream');
var __console = require('./debug');

function EmailsData(options) {
    if (typeof options.searchFilter === 'string') {
        this.searchFilter = [options.searchFilter];
    } else {
        this.searchFilter = options.searchFilter || ['UNSEEN'];
    }
    this.fetchUnreadOnStart = true;
    this.pullAttachment = (options.attachments !== undefined && typeof options.attachments =='boolean')? options.attachments : false;
    this.mailParserOptions = options.mailParserOptions || {};
    if (options.attachments && options.attachmentOptions && options.attachmentOptions.stream) {
        this.mailParserOptions.streamAttachments = true;
        this.attachmentDirectory = options.attachmentOptions.directory !== undefined ?options.attachmentOptions.directory : 'attachments';
        if (!fs.existsSync(this.attachmentDirectory)){
            fs.mkdirSync(this.attachmentDirectory);
        }
    }
    this.emailsFound = false;
    this.mailbox = options.mailbox !== undefined ?  options.mailbox : 'INBOX';
    this.divider = (options.dividerBeforeSignature !== undefined && options.dividerBeforeSignature !='') ? options.dividerBeforeSignature : null;
    this.debugMode = options.debug !== undefined ? options.debug : 'OFF';
    this.reCheckMode = (options.reCheckMode !== undefined && typeof options.reCheckMode == 'boolean') ? options.reCheckMode : false;

    this.imap = new Imap({
        user: options.username !== undefined ? options.username : '',
        password:options.password  !== undefined ? options.password : '',
        host: options.host !== undefined ? options.host : 'imap.gmail.com',
        port: options.port !== undefined ? options.port : 993,
        tls: options.tls !== undefined ? options.tls : true,
        connTimeout: options.connTimeout  !== undefined ? options.connTimeout : 10000, 
        authTimeout: options.authTimeout !== undefined ? options.authTimeout : 5000,
        tlsOptions: options.tlsOptions !== undefined ? options.tlsOptions : {rejectUnauthorized: false},
        fetchingPauseThreshold: options.fetchingPauseThreshold !== undefined ? options.fetchingPauseThreshold : null,
        fetchingPauseTime: options.fetchingPauseTime !== undefined ? options.fetchingPauseTime : 5000,
        debug:__console.debugMode(this.debugMode)
    });

    this.imap.on('ready', openBoxReady.bind(this));
}

function getUnreadMessage(){
    var __this = this;
    this.imap.search(__this.searchFilter,function(err,data){
        if(err){
            __console.log('Serach error:'+err);
        }else if(data.length){
            __this.imap.setFlags(data, ['\\Seen'], function (err) {
                if (err) {
                    __console.log('setFlags error:'+err);
                }
            });
            
            async.eachSeries(data, function (result, firstcall) {
                var f = __this.imap.fetch(result, {
                    bodies: '',
                    struct:true
                });
              
                f.on('message', function (msg, seqno) {
                    threadProcessing(seqno);
                    var parser = new MailParser(__this.mailParserOptions);
                    var attributes = null;
                    var emlbuffer = new Buffer('');
                    var attachmentStorage = [];   
                    parser.on('end',function(mail){
                        var mails = {};                     
                        var email_text = mail.text || undefined;
                        var email_html = mail.html || undefined;
                        var email_html_split = email_html !== undefined ? email_html.split(__this.divider) : '';
                        var email_split = email_text !== undefined ? email_text.split(__this.divider) : '';
                        var final_email_text = email_split.length ? email_split[0] : '';
                        var final_email_html_text = email_html_split.length ? email_html_split[0] : '';
                        mails.subject = mail.subject;
                        mails.text = final_email_text != '' ? final_email_text:email_text;
                        mails.html = final_email_html_text != '' ? final_email_html_text:email_html;
                        mails.date = mail.receivedDate;
                        mails.from = mail.from;
                        mails.to = mail.to;
                       
                        if (__this.pullAttachment) {
                            var attachments = findAttachmentParts(attributes.struct);
                            if(attachments.length){
                                async.eachSeries(attachments,function(attachment,attachmentCall){
                                    var f = __this.imap.fetch(attributes.uid , {
                                        bodies: [attachment.partID],
                                        struct: true
                                    });
                                    f.on('message',function(msgs,seqnom){
                                    	var extArr = attachment.params.name.split('.');
										var ext = extArr[(extArr.length-1)];
										var currenttime = Date.now();
										var rawFileName = attachment.params.name.replace('.'+ext,'')
										var filename = rawFileName+'-'+currenttime+'.'+ext;
                                        var encoding = attachment.encoding;
                                       
                                        msgs.on('body', function(streams, infos) {
                                        var writeStream = fs.createWriteStream(__this.attachmentDirectory+'/'+filename);
                                        if (toUpper(encoding) === 'BASE64') {
                                            streams.pipe(base64.decode()).pipe(writeStream);
                                        } else  {
                                            streams.pipe(writeStream);
                                        }
                                        });
                                        msgs.once('end', function() {
                                        //finish
                                        });
                                        attachmentStorage.push(filename);                                    
                                        attachmentCall();
                                    });
                                },function(err){
                                    mails.attachment = attachmentStorage;
                                    __this.emit('get_mail', mails, seqno, attributes);
                                    threadStatus();
                                    firstcall();  
                                });
                            }else{
                                mails.attachment = attachmentStorage;
                                __this.emit('get_mail', mails, seqno, attributes);
                                threadStatus();
                                firstcall();  
                            }
                        }else{
                            __this.emit('get_mail', mails, seqno, attributes);
                            threadStatus();
                            firstcall();  
                        }
                    });
                   
                    msg.on('body', function (stream, info) {
                        var buffer = '';
                        
                        stream.on('data', function(chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function() {
                            //parser.end();
                            parser.write(buffer);
                        });
                    });

                    msg.on('attributes', function (attrs) {
                        attributes = attrs;
                        parser.end();
                    });
                });

                f.once('error', function (err) {
                    __this.emit('error', err);
                });              
            },function(err) {
                __console.log('Wow !! Processing has been completed with expected data');
                __this.emailsFound = true;
                __this.emit('send',true);
            });
        }else{
            __console.log('Oops, processing completed but data not found !!');
            __this.emit('send',true);
        }
    });
}


function checkMails() {
    if (!this.emailsFound) {
        getUnreadMessage.call(this);
        this.emailsFound = true;
    }
}

function threadStatus(){
    __console.log('-------------------------------------------------------COMPLETED------------------------------------------------------\n','\x1b[32m');
  }
  
  function threadProcessing(no){
    var segNumber = no < 10 ? '0'+no : no;
    
    var str = '\n---------------------------------------------THREAD FOUND: '+segNumber+' :PROCESSING---------------------------------------------';
    if(no>99){
        str=str.substring(0, str.length - 1);
    }
  
    if(no>999){
      str=str.substring(0, str.length - 1);
    }
  
    if(no>9999){
      str=str.substring(0, str.length - 1);
    }
  
    if(no>99999){
      str=str.substring(0, str.length - 1);
    }
  
    if(no>999999){
      str=str.substring(0, str.length - 1);
    }
    
    __console.log(str,'\x1b[33m');
}

function openBoxReady() {
    var __this = this;
    var will_start = Math.floor(Math.random()*5000);
    if(__this.imap.state == 'authenticated'){
        __console.log('\nImap connection has been established');
        var listener = checkMails.bind(__this);
        __this.imap.openBox(__this.mailbox,false,function(err,mailbox) {
            if (err) {
                __console.log('Error on open box:'+err);
            } else {
                if (__this.fetchUnreadOnStart) {
                        getUnreadMessage.call(__this);
                }
                __this.imap.on('mail', listener);
                if(__this.reCheckMode){
                    __this.imap.on('update', listener);
                }
            }
        });
    }else{
        __console.log('\nInvalid username and password !!');
    }
    
}

function streamingData(filename,encoding,stream){
    var writeStream = fs.createWriteStream(filename);
    writeStream.on('finish', function() {
        console.log(prefix + 'Done writing to file %s', filename);
    });
    if (toUpper(encoding) === 'BASE64') {
        stream.pipe(base64.decode()).pipe(writeStream);
    } else  {
        stream.pipe(writeStream);
    }
}

function findAttachmentParts(struct, attachments) {
    attachments = attachments ||  [];
    for (var i = 0, len = struct.length, r; i < len; ++i) {
      if (Array.isArray(struct[i])) {
        findAttachmentParts(struct[i], attachments);
      } else {
        if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) > -1) {
          attachments.push(struct[i]);
        }
      }
    }
    return attachments;
}

function toUpper(thing) { return thing && thing.toUpperCase ? thing.toUpperCase() : thing;}

function buildAttMessageFunction(attachment,directory) {
    var filename = attachment.params.name;
    var encoding = attachment.encoding;
    return function (msg, seqno) {
      msg.on('body', function(stream, info) {
        var writeStream = fs.createWriteStream(directory+'/'+filename);
        writeStream.on('finish', function() {
          //sleep
        });
        if (toUpper(encoding) === 'BASE64') {
          stream.pipe(base64.decode()).pipe(writeStream);
        } else  {
          stream.pipe(writeStream);
        }
      });
      msg.once('end', function() {
        //sleep
      });
    };
  }

util.inherits(EmailsData, EventEmitter);

EmailsData.prototype.start_connection = function () {
    this.imap.connect();
};

EmailsData.prototype.stop = function () {
    __console.log('Imap connection has been ended\n');
    this.imap.end();
};

module.exports = EmailsData;
