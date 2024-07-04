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
    taskDefinition.addContainer('FormsServerAssembleContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('aehrc/smart-forms-assemble:latest'),
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
      taskDefinition
    });
  }
}
