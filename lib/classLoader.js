var Classes = Object.create(null);

exports.loadClass = function(className) {
    var Class = Classes[className];

    if (Class !== undefined) {
      return Class;
    }

    switch (className) {
        case 'imap_extension':
            Class = require('./extension');
            break;

        case 'parse_emails':
            Class = require('./getData');
            break;    

        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }

    Classes[className] = Class;
    return Class;
};