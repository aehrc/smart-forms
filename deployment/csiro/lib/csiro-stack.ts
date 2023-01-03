import { Assemble } from 'assemble';
import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
  ApplicationLoadBalancer,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { FormsServer } from 'forms-server';

export class CsiroStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC and cluster that will be used to run the service.
    const vpc = new Vpc(this, 'CsiroSmartFormsVpc', { maxAzs: 2 });
    const cluster = new Cluster(this, 'CsiroSmartFormsCluster', { vpc: vpc });

    // Create a load balancer that will be used to route traffic to the services.
    const lb = new ApplicationLoadBalancer(this, 'CsiroSmartFormsLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const listener = lb.addListener('CsiroSmartFormsListener', { port: 80 });
    const assemble = new Assemble(this, 'CsiroAssemble', { cluster });
    const formsServer = new FormsServer(this, 'CsiroFormsServer', { cluster });

    // Create a target for the assemble service, routed from the "/fhir/$assemble" path.
    const assembleTarget = assemble.service.loadBalancerTarget({
      containerName: assemble.containerName,
      containerPort: assemble.containerPort
    });
    const assembleTargetGroup = new ApplicationTargetGroup(this, 'CsiroAssembleTargetGroup', {
      vpc,
      port: assemble.containerPort,
      targets: [assembleTarget],
      healthCheck: { path: '/fhir/$assemble' }
    });
    listener.addAction('CsiroAssembleAction', {
      action: ListenerAction.forward([assembleTargetGroup]),
      priority: 1,
      conditions: [ListenerCondition.pathPatterns(['/fhir/$assemble'])]
    });

    // Create a target for the forms server, to handle all other requests.
    const formsServerTarget = formsServer.service.loadBalancerTarget({
      containerName: formsServer.containerName,
      containerPort: formsServer.containerPort
    });
    const formsServerTargetGroup = new ApplicationTargetGroup(this, 'CsiroFormsServerTargetGroup', {
      vpc,
      port: formsServer.containerPort,
      targets: [formsServerTarget],
      healthCheck: { path: '/fhir/metadata' }
    });
    listener.addAction('CsiroSmartFormsDefaultAction', {
      action: ListenerAction.forward([formsServerTargetGroup])
    });
  }
}
