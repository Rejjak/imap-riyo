## Install
```js
$ npm install imap-riyo
```
## Introduction
This library provides easy functionality for parsing emails with a simple interface using the IMAP module. Upon successful authentication, results will be returned through the 'success' API call based on your configuration.


## Example:

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

  new imap(config).on('success',function(result){
    console.log(result)
  });
```

## Example Output
```js
{
    "data": [
        {
            "subject": "Hello World",
            "text": " This is a test messages",
            "date": "2018-07-24T06:31:45.000Z",
            "from": [
                {
                    "address": "test4@gmail.com",
                    "name": "Test developer"
                }
            ],
            "to": [
                {
                    "address": "test14@gmail.com",
                    "name": ""
                }
            ],
            "attachment": [
                "Screenshot from 2018-06-06 17-28-05.png",
                "Screenshot from 2018-06-25 18-06-30.png",
                "Screenshot from 2018-06-25 18-33-16.png"
            ]
        }
    ],
    "status": true
}
```

## Additional Configuration

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

## Other Search Criteria

Retrieve unread emails since July 21, 2018:

```js
  // using the functions and variables already defined in the first example ..

  searchFilter:[ 'UNSEEN', ['SINCE', 'Jul 21, 2018'] ]

```
You can also set custom search criteria. For example:

```js
  var delay = 24 * 3600 * 1000;
  var previousDay = new Date();
  previousDay.setTime(Date.now() - delay);
  previousDay = previousDay.toISOString(); // 2018-07-20T22:18:40.013Z

  searchFilter:[ 'UNSEEN', ['SINCE', previousDay]]
```

## Attachments

Setting ```attachments: true``` enables downloading of attachments to the project directory while parsing email details. To specify a custom download directory, configure:

```js
  attachmentOptions: { directory: 'attachments' }
```
If ```attachments``` is set to ```false```, attachments will be ignored.
