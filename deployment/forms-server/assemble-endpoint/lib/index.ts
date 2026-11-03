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

export interface AssembleEndpointProps {
  cluster: Cluster;
}

export class AssembleEndpoint extends Construct {
  containerName = 'forms-server-assemble';
  containerPort = 3002;
  service: FargateService;

  constructor(scope: Construct, id: string, props: AssembleEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'FormsServerAssembleTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // Create the cache container.
    // Images are pulled from a private ECR repository in this account (scan on push,
    // immutable tags). The tag is the source commit the image was built from; bump it
    // to deploy a new build. fromEcrRepository also grants the execution role pull access.
    taskDefinition.addContainer('FormsServerAssembleContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromEcrRepository(
        Repository.fromRepositoryName(this, 'AssembleRepository', 'smart-forms/assemble'),
        '84fb8d6b'
      ),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'forms-server-assemble',
        logRetention: RetentionDays.ONE_MONTH
      }),
      environment: {
        FORMS_SERVER_URL: 'https://smartforms.csiro.au/api/fhir'
      }
    });

    this.service = new FargateService(this, 'FormsServerAssembleService', {
      cluster,
      taskDefinition,
      // Roll back automatically if a new deployment's tasks fail to start or stay healthy.
      circuitBreaker: { enable: true, rollback: true }
    });
  }
}
