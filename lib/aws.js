/**
 * Evil wrapper for the aws command line tools
 */
var exec = require('child_process').exec
  , fs = require('fs')
  , util = require('util')
  , http = require('http')
  , events = require("events")

var tools = {}, apis = [
    'ec2',
    'ec2_amitool',
    'aws_auto_scaling',
    'aws_cloudwatch',
    'aws_elb'
];

exports.init = function(api, callback) {
    var apis_comparison = '|' + apis.join('|') + '|',
        event = new events.EventEmitter(),
        completed = {};

    if (typeof api === "string") {
        api = [api];
    }

    api.map(function(item) {
        if (apis_comparison.indexOf('|' + item + '|') !== -1) {
            fs.readdir(process.env[item.toUpperCase() + '_HOME'] + '/bin', function(err, files) {
                var count = 0;
                files.map(function(file) {
                    if (file.indexOf('-') !== -1 && file.indexOf('cmd') === -1) {
                        if (typeof tools[item] === 'undefined') {
                            tools[item] = function() {
                                var services = [];
                                for (var i in tools[item]) {
                                    services.push(i);
                                }
                                return services;
                            };
                        }
                        tools[item][file.replace(/(.*?\-)/, '').replace(/\-/g, '_')] = createService(item, file);
                    }
                    event.emit('tool', item, ++count, files.length);
                });
            });
        }
    });

    event.on('tool', function(name, count, length) {
        if (count === length) {
            completed[name] = true;

            var done = true;
            api.map(function(item) {
                if (!completed[item]) {
                    done = false;
                }
            });

            if (done) {
                callback(tools);
            }
        }
    });

    return event;
}

exports.setRegion = function(name) {
    region = name;
}

createService = function(api, name) {

    var service = function() {
        var args = get_args.apply(this, arguments);

        args.options.push('--region ' + region);

        exec(process.env[api.toUpperCase() + '_HOME'] + '/bin' + '/' + name + ' ' + args.options.join(' '), function(err, stdout, stderr) {
            if (err !== null) {
                console.log('exec error: ' + err);
            } else {
                if (typeof args.callback !== 'undefined') {
                    args.callback(stdout);
                } else {
                    util.puts(stdout);
                }
            }
        });
    }

    service.instances = function() {
        var args = get_args.apply(this, arguments);
        service(args.options, function(stdout) {
            var data = stdout.match(/\s(i\-\S*)\s/g);
            data = data.map(function(item) {
                return item.replace(/[\s\t]/g, '');
            });
            args.callback(data);
        });
    };

    service.images = function() {
        var args = get_args.apply(this, arguments);
        service(args.options, function(stdout) {
            var data = stdout.match(/\s(ami\-\S*)\s/g);
            data = data.map(function(item) {
                return item.replace(/[\s\t]/g, '');
            });

            args.callback(data);
        });
    };

    service.public_dns = function() {
        var args = get_args.apply(this, arguments);
        service(args.options, function(stdout) {
            var data = {};

            stdout = stdout.split('\n');
            stdout.map(function(item) {
                if (item.indexOf('ec2') !== -1) {
                    data[item.replace(/.*\s(i\-\S*).*/g, '$1')] = item.replace(/.*(ec2\-\S*).*/g, '$1');
                }
            });

            args.callback(data);
        });
    };

    service.private_dns = function() {
        var args = get_args.apply(this, arguments);
        service(args.options, function(stdout) {
            var data = {};
            stdout = stdout.split('\n');
            stdout.map(function(item) {
                if (item.indexOf('ip\-') !== -1) {
                    data[item.replace(/.*\s(i\-\S*).*/g, '$1')] = item.replace(/.*(ip\-\S*).*/g, '$1');
                }
            });

            args.callback(data);
        });
    };

    if (name === 'as-describe-auto-scaling-groups') {
        service.launch_config = function() {
            var args = get_args.apply(this, arguments);
            service(args.options, function(stdout) {
                var data = {};
                stdout = stdout.split('\n');
                stdout = stdout[0].split('  ');

                args.callback(stdout[2]);
            });
        }
    }

    return service;
};

exports.info = function(element, callback) {
    // if element is empty all possible infos are listed

    var ip_address = '169.254.169.254';
    var client = http.createClient(80, ip_address);
    var request = client.request('GET', '/latest/meta-data/' + element);
    request.end();

    request.on('response', function(response) {
        if (response.statusCode !== 200) {
            return callback(new Error('Couldn\'t find meta data for instance'));
        }

        response.setEncoding('utf8');

        var info = '';
        response.on('data', function(chunk) {
            info += chunk;
        });
        response.on('end', function() {
            callback(null, info);
        });
    });
}

function get_args(options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = [];
    }

    if (typeof options === 'undefined') {
        options = [];
    }

    if (typeof options === 'string') {
        if (options === 'help') {
            options = '--help';
        }
        options = [options];
    }

    return {
        options: options,
        callback: callback
    };
}

