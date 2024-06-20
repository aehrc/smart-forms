import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export interface TransformEndpointProps {
  cluster: Cluster;
}

export class TransformEndpoint extends Construct {
  containerName = 'ehr-proxy-transform';
  containerPort = 80;
  service: FargateService;

  constructor(scope: Construct, id: string, props: TransformEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'EhrProxyTransformTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // Create the cache container.
    taskDefinition.addContainer('EhrProxyTransformContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('yeexianfong/demo-map-server:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'ehr-proxy-transform',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'EhrProxyTransformService', {
      cluster,
      taskDefinition
    });
  }
}
