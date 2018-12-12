var getopt = require('posix-getopt');
var webServer = require('./server.js');


///--- Globals

var NAME = 'common_mime_api';

// In true UNIX fashion, debug messages go to stderr, and audit records go

function parseOptions() {
    var option;
    var opts = {}
    var parser = new getopt.BasicParser(':h:p:(port)', process.argv);

    while ((option = parser.getopt()) !== undefined) {
        switch (option.option) {
            case 'p':
                opts.port = parseInt(option.optarg, 10);
                break;
            case 'h':
                usage();
                break;

            default:
                usage('invalid option: ' + option.option);
                break;
        }
    }

    return (opts);
}


function usage(msg) {
    if (msg)
        console.error(msg);

    var str = 'usage: ' +
        NAME +
        '[-p port] [-h]';
    console.error(str);
    process.exit(msg ? 1 : 0);
}


(function main() {
    var opt=parseOptions();
    var server = webServer.createServer();


    server.listen((opt.port?opt.port:8093), function onListening() {
        console.log('Common mime type service start ' + server.url);
    });

})();
