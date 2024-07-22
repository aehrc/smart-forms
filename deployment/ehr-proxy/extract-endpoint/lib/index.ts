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

export interface ExtractEndpointProps {
  cluster: Cluster;
}

export class ExtractEndpoint extends Construct {
  containerName = 'ehr-proxy-extract';
  containerPort = 3003;
  service: FargateService;

  constructor(scope: Construct, id: string, props: ExtractEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'EhrProxyExtractTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // Create the cache container.
    taskDefinition.addContainer('EhrProxyExtractContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('aehrc/smart-forms-extract:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'ehr-proxy-extract',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'EhrProxyExtractService', {
      cluster,
      taskDefinition
    });
  }
}
