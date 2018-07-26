
var config = {
    username: 'rejjakali94@gmail.com',
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
    dividerBeforeSignature: '=====================' // this is the divider, means that discard everything below after this symbol.
};
