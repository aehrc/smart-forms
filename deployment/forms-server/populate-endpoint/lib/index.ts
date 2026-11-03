import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
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
    // Images are pulled from a private ECR repository in this account (scan on push,
    // immutable tags). The tag is the source commit the image was built from; bump it
    // to deploy a new build. fromEcrRepository also grants the execution role pull access.
    taskDefinition.addContainer('FormsServerPopulateContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromEcrRepository(
        Repository.fromRepositoryName(this, 'PopulateRepository', 'smart-forms/populate'),
        '84fb8d6b'
      ),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'forms-server-populate',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'FormsServerPopulateService', {
      cluster,
      taskDefinition,
      // Roll back automatically if a new deployment's tasks fail to start or stay healthy.
      circuitBreaker: { enable: true, rollback: true }
    });
  }
}
