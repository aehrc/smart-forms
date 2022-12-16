// import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AssembleProps {
  // Define construct properties here
}

export class Assemble extends Construct {
  constructor(scope: Construct, id: string, props: AssembleProps = {}) {
    super(scope, id);

    // Create a new VPC and cluster that will be used to run the service.
    const vpc = new Vpc(this, 'SmartFormsVpc', { maxAzs: 2 });
    const cluster = new Cluster(this, 'SmartFormsCluster', { vpc: vpc });

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'SmartFormsAssembleTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '0.25',
      memoryMiB: '0.5GB'
    });

    // Create the cache container.
    taskDefinition.addContainer('SmartFormsAssembleContainer', {
      containerName: 'assemble',
      image: ContainerImage.fromRegistry('aehrc/smart-forms-assemble:latest'),
      portMappings: [{ containerPort: 3002 }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'smart-forms-assemble',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    // Create a service to wrap the application task.
    new ApplicationLoadBalancedFargateService(this, 'SmartFormsAssembleService', {
      cluster,
      taskDefinition: taskDefinition,
      protocol: ApplicationProtocol.HTTP
    });
  }
}
