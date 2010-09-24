/**
 * AWS wrapper tests
 */
require.paths.unshift("../lib");

var sys = require("sys"),
    assert = require("assert"),
    vows = require("vows");

vows.describe('aws').addBatch({
    'EC2 API': {
        "GIVEN I have instances on EC2": {
            topic: function() {
                var callback = this.callback;
                var aws = require("aws");
                aws.setRegion('eu-west-1')
                aws.init(['ec2'], function(api) {
                    callback(undefined, api.ec2)
                });
            },
            "WHEN I describe instances": {
                topic: function(api) {
                    var callback = this.callback;
                    api.describe_instances(function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 instances": function(data) {
                    var instances = data.split(/\s+/).filter(function(item) {
                        return item === "INSTANCE"
                    });
                    assert.isTrue(instances.length > 0);
                }
            },
            "WHEN I describe instances and filter instances": {
                topic: function(api) {
                    var callback = this.callback;
                    api.describe_instances.instances(function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 instance ids": function(data) {
                    assert.isTrue(data.length > 0);
                    data.forEach(function(item) {
                        assert.equal(item.indexOf('i-'), 0);
                    });
                }
            },
            "WHEN I describe instances and filter images": {
                topic: function(api) {
                    var callback = this.callback;
                    api.describe_instances.images(function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain amazon images": function(data) {
                    assert.isTrue(data.length > 0);
                    data.forEach(function(item) {
                        assert.equal(item.indexOf('ami-'), 0);
                    });
                }
            },
            "WHEN I describe instances and filter public dns": {
                topic: function(api) {
                    var callback = this.callback;
                    api.describe_instances.public_dns(function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 public dns addresses": function(data) {
                    var count = 0;
                    for (var i in data) {
                        count++;
                        assert.equal(i.indexOf('i-'), 0);
                        assert.equal(data[i].indexOf('ec2-'), 0);

                        var matches = data[i].match(/\.eu\-west\-1\.compute\.amazonaws\.com$/);
                        assert.equal(matches[0], '.eu-west-1.compute.amazonaws.com');
                        assert.equal(matches.index, data[i].length - 32);
                    }
                    assert.isTrue(count > 0);
                }
            },
            "WHEN I describe instances and filter private dns": {
                topic: function(api) {
                    var callback = this.callback;
                    api.describe_instances.private_dns(function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 private dns addresses": function(data) {
                    var count = 0;
                    for (var i in data) {
                        count++;
                        assert.equal(i.indexOf('i-'), 0);
                        assert.equal(data[i].indexOf('ip-'), 0);

                        var matches = data[i].match(/\.eu\-west\-1\.compute\.internal$/);
                        assert.equal(matches[0], '.eu-west-1.compute.internal');
                        assert.equal(matches.index, data[i].length - 27);
                    }
                    assert.isTrue(count > 0);
                }
            }
        }
    },
    'Auto scaling API': {
        "GIVEN I have an auto scaler": {
            topic: function() {
                var callback = this.callback;
                var aws = require("aws");
                aws.setRegion('eu-west-1')
                aws.init(['ec2', 'aws_auto_scaling'], function(api) {
                    callback(undefined, api.aws_auto_scaling, 'ads-stage-adcloud-net')
                });
            },
            "WHEN I describe the auto scaling group": {
                topic: function(api, loadbalancer) {
                    var callback = this.callback;
                    api.describe_auto_scaling_groups(loadbalancer, function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 instances": function(data) {
                    var instances = data.split(/\s+/).filter(function(item) {
                        return item === "INSTANCE"
                    });
                    assert.isTrue(instances.length > 0);
                }
            },
            "WHEN I describe the auto scaling group and filter instances": {
                topic: function(api, loadbalancer) {
                    var callback = this.callback;
                    api.describe_auto_scaling_groups.instances(loadbalancer, function(data) {
                        callback(undefined, data)
                    });
                },
                "THEN the result should contain ec2 instances": function(data) {
                    assert.isTrue(data.length > 0);
                    data.forEach(function(item) {
                        assert.equal(item.indexOf('i-'), 0);
                    });
                }
            }
        }
    }
}).export(module);

