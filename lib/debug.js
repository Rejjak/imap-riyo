var log_msg = Object.create(null);

log_msg.log = function(data,color){
    if(color !== undefined && color != ''){
        console.log(color+'%s',data); // Set color
    }else{
        console.log('\x1b[0m%s',data); // Reset color
    }
};

log_msg.debugMode = function(data){
    var str = data !== undefined ? data : 'off';
    var option = str.toUpperCase();
    return (option == 'ON' ? console.log : log_msg.log('Debug mode is disabled'));
};

module.exports = log_msg;