## Install
```js
$ npm install imap-riyo
```
## Introduction
This library is providing a easiest functionality for parsing emails with simple ineterface using imap module. If the authentication will success, you will get the results on 'success' API call beased on your configuration.


Please go through the below example:

```js
  var imap = require('imap-riyo');
  var config = {
      username: 'test@gmail.com',
      password: '********',
      host: 'imap.gmail.com',
      debug: 'off',
      mailbox: 'INBOX', 
      searchFilter: ['UNSEEN'],
      mailParserOptions: {streamAttachments: true},
      attachments: true,
      attachmentOptions: { directory: 'attachments',stream:true },
      reCheckMode : false,
      dividerBeforeSignature: '<==================>'
  };

  new imap(config).on('success',function(data){
    console.log(data)
  });
```


## Others configuration

```js
  var config = {
    username: 'test@gmail.com',
    password: '***********',
    host: 'imap.gmail.com',
    port: 993, // imap port
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: 'off', // debuging
    tlsOptions: { rejectUnauthorized: false },
    mailbox: 'INBOX', // mailbox to monitor
    searchFilter: ['UNSEEN'], // the search filter
    mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
    attachments: true, // searching attachments
    attachmentOptions: { directory: 'attachments',stream:true }, // specify a download directory for attachments, otherwise it will create a directory with the name of 'attachments' in the project directory, if 'attachments:true'
    // to pause for 'fetchingPauseTime' fetching of the email, because it 'hangs' your app
    fetchingPauseThreshold: null, // amount bytes
    fetchingPauseTime: 5000, // ms to pause fetching and process other requests,
    reCheckMode : false, // update mail once again after results found
    dividerBeforeSignature: '<=====================>' // this is the divider, means that discard everything below after this symbol.
  };
```

## Others search criteria

Get unread emails since Jul 21, 2018:

```js
  // using the functions and variables already defined in the first example ..

  searchFilter:[ 'UNSEEN', ['SINCE', 'Jul 21, 2018'] ]

```
You can set your won custom search criteria in the search filter. Please go through the below reference

```js
  var delay = 24 * 3600 * 1000;
  var previousDay = new Date();
  previousDay.setTime(Date.now() - delay);
  previousDay = previousDay.toISOString(); // 2018-07-20T22:18:40.013Z

  searchFilter:[ 'UNSEEN', ['SINCE', previousDay]]
```

## Attachments

Setting 'attachments: true' means, it will check attachments and will download to the project directory, while parsing emails details, otherwise it will ignore all the attachments. You can also specify for the download directory using the setting of 'attachmentOptions: { directory: 'attachments'}'. 

