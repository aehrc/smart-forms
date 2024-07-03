import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AssembleEndpoint } from 'forms-server-assemble-endpoint';
import { HapiEndpoint } from 'forms-server-hapi-endpoint';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { PopulateEndpoint } from 'forms-server-populate-endpoint';

export class FormsServerAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC and cluster that will be used to run the service.
    const vpc = new Vpc(this, 'FormsServerVpc', { maxAzs: 2 });
    const cluster = new Cluster(this, 'FormsServerCluster', { vpc: vpc });

    // Create a load balancer that will be used to route traffic to the services.
    const lb = new ApplicationLoadBalancer(this, 'FormsServerLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      'arn:aws:acm:ap-southeast-2:209248795938:certificate/96ac2763-6b95-49cc-805c-f6e415d2ce4c'
    );

    const listener = lb.addListener('FormsServerListener', {
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [certificate]
    });
    const populate = new PopulateEndpoint(this, 'FormsServerPopulate', { cluster });
    const assemble = new AssembleEndpoint(this, 'FormsServerAssemble', { cluster });
    const hapi = new HapiEndpoint(this, 'FormsServerHapi', { cluster });

    // Create a target for the populate service, routed from the "api/fhir/$populate" path.
    const populateTarget = populate.service.loadBalancerTarget({
      containerName: populate.containerName,
      containerPort: populate.containerPort
    });

    const populateTargetGroup = new ApplicationTargetGroup(this, 'FormsServerPopulateTargetGroup', {
      vpc,
      port: populate.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [populateTarget],
      healthCheck: { path: '/fhir/Questionnaire/$populate' }
    });
    listener.addAction('FormsServerPopulateAction', {
      action: ListenerAction.forward([populateTargetGroup]),
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/fhir/Questionnaire/$populate'])]
    });

    // Create a target for the assemble service, routed from the "api/fhir/$assemble" path.
    const assembleTarget = assemble.service.loadBalancerTarget({
      containerName: assemble.containerName,
      containerPort: assemble.containerPort
    });

    const assembleTargetGroup = new ApplicationTargetGroup(this, 'FormsServerAssembleTargetGroup', {
      vpc,
      port: assemble.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [assembleTarget],
      healthCheck: { path: '/fhir/Questionnaire/$assemble' }
    });
    listener.addAction('FormsServerAssembleAction', {
      action: ListenerAction.forward([assembleTargetGroup]),
      priority: 2,
      conditions: [ListenerCondition.pathPatterns(['/fhir/Questionnaire/$assemble'])]
    });

    // Create a target for the forms server HAPI service, to handle all other requests.
    const hapiTarget = hapi.service.loadBalancerTarget({
      containerName: hapi.containerName,
      containerPort: hapi.containerPort
    });
    const hapiTargetGroup = new ApplicationTargetGroup(this, 'FormsServerHapiTargetGroup', {
      vpc,
      port: hapi.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [hapiTarget],
      healthCheck: { path: '/fhir/metadata', interval: cdk.Duration.seconds(180) }
    });
    listener.addAction('FormsServerDefaultAction', {
      action: ListenerAction.forward([hapiTargetGroup])
    });
  }
}
