# amazon aws wrapper

Just wraps commandline calls to aws with some predefined filters for amis, instances, public and private dns data.

## Install
You have to install all the amazon tools you'd like to use (eg. ec2, elb, autoscaling tools).

The environment variables for the tools have to be configured. Something like:

<pre>
EC2_HOME=/opt/ec2-api-tools
EC2_AMITOOL_HOME=/opt/ec2-ami-tools
AWS_AUTO_SCALING_HOME=/opt/AutoScaling
AWS_CLOUDWATCH_HOME=/opt/CloudWatch
AWS_ELB_HOME=/opt/ElasticLoadBalancing

EC2_PRIVATE_KEY="your-aws-private-key"
EC2_CERT="your-aws-certificate"
EC2_ACCESS_KEY="your-aws-access-key"
EC2_SECRET_KEY="your-aws-secret"
AWS_CREDENTIAL_FILE=your-credential-file

EC2_REGION=eu-west-1
EC2_KEYPAIR_EU_WEST_1=your-aws-key-pair
</pre>

Then just install the module with npm.

<pre>
npm install aws
</pre>

## Example

<pre>
var aws = require('aws');
aws.setRegion('eu-west-1');

aws.init(['ec2', 'aws_elb', 'aws_auto_scaling'], function(apis) {
    apis.ec2.describe_instances.public_dns(function(instances) {
        sys.puts(sys.inspect(instances)); // lists all public dns of your ec2 instances
    });
});

