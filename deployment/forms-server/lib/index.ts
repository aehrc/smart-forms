import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface FormsServerProps {
  cluster: Cluster;
}

export class FormsServer extends Construct {
  containerName = 'forms-server';
  containerPort = 8080;
  service: FargateService;

  constructor(scope: Construct, id: string, { cluster }: FormsServerProps) {
    super(scope, id);

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'SmartFormsFormsServerTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '4096',
      memoryMiB: '8192'
    });

    // Create the cache container.
    taskDefinition.addContainer('SmartFormsFormsServerContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('hapiproject/hapi:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'smart-forms-forms-server',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'SmartFormsFormsServerService', {
      cluster,
      taskDefinition
    });
  }
}
