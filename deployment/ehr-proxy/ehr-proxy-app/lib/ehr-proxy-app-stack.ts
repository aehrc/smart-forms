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
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { HapiEndpoint } from 'ehr-proxy-hapi-endpoint';
import { SmartProxy } from 'ehr-proxy-smart-proxy';
import { TransformEndpoint } from 'ehr-proxy-transform-endpoint';
import { ExtractEndpoint } from 'ehr-proxy-extract-endpoint';

export class EhrProxyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC and cluster that will be used to run the service.
    const vpc = new Vpc(this, 'EhrProxyVpc', { maxAzs: 2 });
    const cluster = new Cluster(this, 'EhrProxyCluster', { vpc: vpc });

    // Create a load balancer that will be used to route traffic to the services.
    const lb = new ApplicationLoadBalancer(this, 'EhrProxyLoadBalancer', {
      vpc,
      internetFacing: true
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'EhrProxyHostedZone', {
      hostedZoneId: 'Z0507963281Q0BWHKV1OD',
      zoneName: 'smartforms.io'
    });

    const certificate = new Certificate(this, 'EhrProxyCertificate', {
      domainName: 'proxy.smartforms.io',
      validation: CertificateValidation.fromDns(hostedZone)
    });

    new ARecord(this, 'EhrProxyAliasRecord', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(lb)),
      recordName: 'proxy.smartforms.io'
    });

    const listener = lb.addListener('EhrProxyListener', {
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [certificate]
    });

    const hapi = new HapiEndpoint(this, 'EhrProxyHapi', { cluster });
    const smartProxy = new SmartProxy(this, 'EhrProxySmartProxy', { cluster });
    const transform = new TransformEndpoint(this, 'EhrProxyTransform', { cluster });
    const extract = new ExtractEndpoint(this, 'EhrProxyExtract', { cluster });

    // Create a target for the extract service
    const extractTarget = extract.service.loadBalancerTarget({
      containerName: extract.containerName,
      containerPort: extract.containerPort
    });
    const extractTargetGroup = new ApplicationTargetGroup(this, 'EhrProxyExtractTargetGroup', {
      vpc,
      port: extract.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [extractTarget],
      healthCheck: { path: '/fhir/QuestionnaireResponse/$extract' }
    });
    listener.addAction('EhrProxyExtractAction', {
      action: ListenerAction.forward([extractTargetGroup]),
      priority: 1,
      conditions: [
        ListenerCondition.pathPatterns([
          '/fhir/QuestionnaireResponse/$extract',
          '/fhir/StructureMap/$convert'
        ])
      ]
    });

    // Create a target for the transform service
    const transformTarget = transform.service.loadBalancerTarget({
      containerName: transform.containerName,
      containerPort: transform.containerPort
    });
    const transformTargetGroup = new ApplicationTargetGroup(this, 'EhrProxyTransformTargetGroup', {
      vpc,
      port: transform.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [transformTarget],
      healthCheck: { path: '/StructureMap' }
    });
    listener.addAction('EhrProxyTransformAction', {
      action: ListenerAction.forward([transformTargetGroup]),
      priority: 2,
      conditions: [ListenerCondition.pathPatterns(['/fhir/StructureMap/$transform'])]
    });

    // Create a target for the HAPI FHIR API service
    const hapiTarget = hapi.service.loadBalancerTarget({
      containerName: hapi.containerName,
      containerPort: hapi.containerPort
    });
    const hapiTargetGroup = new ApplicationTargetGroup(this, 'EhrProxyHapiTargetGroup', {
      vpc,
      port: smartProxy.containerPort,
      protocol: ApplicationProtocol.HTTP,
      targets: [hapiTarget],
      healthCheck: { path: '/fhir/metadata', interval: cdk.Duration.seconds(180) }
    });
    listener.addAction('EhrProxyHapiAction', {
      action: ListenerAction.forward([hapiTargetGroup]),
      priority: 3,
      conditions: [ListenerCondition.pathPatterns(['/fhir*'])]
    });

    // Create a target for the smart proxy service
    const smartProxyTarget = smartProxy.service.loadBalancerTarget({
      containerName: smartProxy.containerName,
      containerPort: smartProxy.containerPort
    });
    const smartProxyTargetGroup = new ApplicationTargetGroup(
      this,
      'EhrProxySmartProxyTargetGroup',
      {
        vpc,
        port: smartProxy.containerPort,
        protocol: ApplicationProtocol.HTTP,
        targets: [smartProxyTarget],
        healthCheck: { path: '/v/r4/fhir/metadata' }
      }
    );
    listener.addAction('EhrProxyDefaultAction', {
      action: ListenerAction.forward([smartProxyTargetGroup])
    });
  }
}
