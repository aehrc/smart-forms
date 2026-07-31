// import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InstanceClass, InstanceSize, InstanceType, SubnetType } from 'aws-cdk-lib/aws-ec2';
import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  Secret as EcsSecret,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType
} from 'aws-cdk-lib/aws-rds';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface HapiEndpointProps {
  cluster: Cluster;
}

export class HapiEndpoint extends Construct {
  containerName = 'forms-server-hapi';
  containerPort = 8080;
  databaseName = 'hapi';
  service: FargateService;
  database: DatabaseInstance;

  constructor(scope: Construct, id: string, props: HapiEndpointProps) {
    super(scope, id);

    const { cluster } = props;

    // Persistent storage for the HAPI FHIR server. Without it HAPI falls back to its default
    // in-memory H2 database (jdbc:h2:mem:test_mem), so every task replacement silently discards
    // the published Questionnaires and has to be repopulated by hand.
    //
    // db.t4g.small gives the database the 2 GiB it previously had to borrow from the 4 GiB task,
    // keeping it in the same proportion to its task as the ehr-proxy database is to that one. This
    // server holds the larger dataset of the two, and it backs the main smartforms.csiro.au app.
    this.database = new DatabaseInstance(this, 'FormsServerHapiDatabase', {
      engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_18_3 }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE4_GRAVITON, InstanceSize.SMALL),
      autoMinorVersionUpgrade: true,
      vpc: cluster.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      databaseName: this.databaseName,
      credentials: Credentials.fromGeneratedSecret('hapi'),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageType: StorageType.GP3,
      storageEncrypted: true,
      multiAz: false,
      backupRetention: Duration.days(7),
      deleteAutomatedBackups: false,
      deletionProtection: true,
      removalPolicy: RemovalPolicy.SNAPSHOT
    });

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'FormsServerHapiTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '2048',
      memoryMiB: '4096'
    });

    // Create the cache container.
    taskDefinition.addContainer('FormsServerHapiContainer', {
      containerName: this.containerName,
      // Pinned rather than tracked at `latest`: now that the database outlives the task, an
      // unattended version bump would run schema migrations against real data.
      image: ContainerImage.fromRegistry('hapiproject/hapi:v8.10.0-3'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'forms-server-hapi',
        logRetention: RetentionDays.ONE_MONTH
      }),
      environment: {
        use_apache_address_strategy: 'true',
        'hapi.fhir.openapi_enabled': 'false',
        // 'hapi.fhir.cr.enabled': 'true' // If you want to use the Clinical Reasoning module
        SPRING_DATASOURCE_URL: `jdbc:postgresql://${this.database.dbInstanceEndpointAddress}:${this.database.dbInstanceEndpointPort}/${this.databaseName}`,
        SPRING_DATASOURCE_DRIVERCLASSNAME: 'org.postgresql.Driver',
        SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT:
          'ca.uhn.fhir.jpa.model.dialect.HapiFhirPostgresDialect'
      },
      secrets: {
        SPRING_DATASOURCE_USERNAME: EcsSecret.fromSecretsManager(this.database.secret!, 'username'),
        SPRING_DATASOURCE_PASSWORD: EcsSecret.fromSecretsManager(this.database.secret!, 'password')
      }
    });

    this.service = new FargateService(this, 'FormsServerHapiService', {
      cluster,
      taskDefinition,
      // Schema migration against a cold database pushes first boot past the target group's
      // tolerance, which previously surfaced as tasks replaced for "Request timed out".
      healthCheckGracePeriod: Duration.minutes(5)
    });

    this.database.connections.allowDefaultPortFrom(
      this.service,
      'Allow the HAPI FHIR server to reach its database'
    );
    this.service.node.addDependency(this.database);
  }
}
