// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface HapiEndpointProps {
  cluster: Cluster;
}

export class HapiEndpoint extends Construct {
  containerName = 'ehr-proxy-hapi';
  containerPort = 8080;
  service: FargateService;

  constructor(scope: Construct, id: string, props: HapiEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'EhrProxyHapiTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '1024',
      memoryMiB: '2048'
    });

    // Create the cache container.
    taskDefinition.addContainer('EhrProxyHapiContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('hapiproject/hapi:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'ehr-proxy-hapi',
        logRetention: RetentionDays.ONE_MONTH
      }),
      environment: {
        use_apache_address_strategy: 'true',
        'hapi.fhir.openapi_enabled': 'false'
      }
    });

    this.service = new FargateService(this, 'EhrProxyHapiService', {
      cluster,
      taskDefinition
    });
  }
}
