import { Cluster, Compatibility, ContainerImage, FargateService, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface SmartProxyProps {
  cluster: Cluster;
}

export class SmartProxy extends Construct {
  containerName = 'ehr-proxy-smart-proxy';
  containerPort = 80;
  service: FargateService;

  constructor(scope: Construct, id: string, props: SmartProxyProps) {
    super(scope, id);

    const { cluster } = props;

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'EhrProxySmartProxyTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // This must match `Certificate.domainName` in ../ehr-proxy-app/lib/ehr-proxy-app-stack.ts - 'proxy.smartforms.io'
    // This must match `fhirServerBaseUrl` in: ../hapi-endpoint/lib/index.ts - 'https://proxy.smartforms.io/fhir'
    const fhirServerBaseUrl = 'https://proxy.smartforms.io/fhir';

    // Create the cache container.
    // Images are pulled from a private ECR repository in this account (scan on push,
    // immutable tags). The tag is the source commit the image was built from; bump it
    // to deploy a new build. fromEcrRepository also grants the execution role pull access.
    taskDefinition.addContainer('EhrProxySmartProxyContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromEcrRepository(
        Repository.fromRepositoryName(this, 'SmartProxyRepository', 'smart-forms/smart-launcher-v2'),
        '3540df24'
      ),
      portMappings: [{ containerPort: this.containerPort }],
      environment: {
        FHIR_SERVER_R4: fhirServerBaseUrl
      }
    });

    this.service = new FargateService(this, 'EhrProxySmartProxyService', {
      cluster,
      taskDefinition,
      // Roll back automatically if a new deployment's tasks fail to start or stay healthy.
      circuitBreaker: { enable: true, rollback: true }
    });
  }
}
