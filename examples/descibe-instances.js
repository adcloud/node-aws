var aws = require('aws');
aws.setRegion('eu-west-1');

aws.init(['ec2', 'aws_elb', 'aws_auto_scaling'], function(apis) {
    apis.ec2.describe_instances.public_dns(function(instances) {
        sys.puts(sys.inspect(instances)); // lists all public dns of your ec2 instances
    });
});

