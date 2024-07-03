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

export interface PopulateEndpointProps {
  cluster: Cluster;
}

export class PopulateEndpoint extends Construct {
  containerName = 'forms-server-populate';
  containerPort = 3001;
  service: FargateService;

  constructor(scope: Construct, id: string, props: PopulateEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'FormsServerPopulateTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // Create the cache container.
    taskDefinition.addContainer('FormsServerPopulateContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('aehrc/smart-forms-populate:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'forms-server-populate',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'FormsServerPopulateService', {
      cluster,
      taskDefinition
    });
  }
}
