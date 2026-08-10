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

/**
 * The HAPI FHIR image both endpoints run.
 *
 * Pinned rather than tracked at `latest`: because the database outlives the task, an unattended
 * version bump would run schema migrations against real data. Bumping this is a deliberate act,
 * and it should be done for both endpoints together so they do not drift apart again.
 */
export const HAPI_IMAGE_TAG = 'hapiproject/hapi:v8.10.0-3';

/** The PostgreSQL major version both databases run. */
export const HAPI_POSTGRES_VERSION = PostgresEngineVersion.VER_18_3;

export interface HapiEndpointProps {
  /** The cluster to run the service in. Its VPC also hosts the database. */
  cluster: Cluster;

  /**
   * Prefix for the ids of the constructs created here, for example `EhrProxyHapi`.
   *
   * This is deliberately explicit rather than derived. CloudFormation logical ids are built from
   * the construct path, so changing this value renames every resource below it, and CloudFormation
   * responds to a renamed resource by replacing it. For the database that means losing its
   * contents. These values must keep matching what is already deployed:
   *
   * - `EhrProxyHapi`    -> EhrProxyHapiEhrProxyHapiService4CDBACDD, ...
   * - `FormsServerHapi` -> FormsServerHapiFormsServerHapiService48273A33, ...
   */
  constructIdPrefix: string;

  /** Container name, also used as the CloudWatch log stream prefix, for example `ehr-proxy-hapi`. */
  serviceName: string;

  /** Task CPU units, as accepted by {@link TaskDefinition}. */
  cpu: string;

  /** Task memory in MiB, as accepted by {@link TaskDefinition}. */
  memoryMiB: string;

  /**
   * Size of the database instance.
   *
   * Each endpoint gets roughly the memory its in-memory predecessor borrowed from the task, so
   * this tracks the task size: {@link InstanceSize.MICRO} against a 2 GiB task,
   * {@link InstanceSize.SMALL} against a 4 GiB task.
   */
  databaseInstanceSize: InstanceSize;

  /** HAPI settings applied on top of the shared defaults. */
  hapiSettings?: { [key: string]: string };
}

/**
 * A HAPI FHIR server on Fargate, backed by its own RDS PostgreSQL instance.
 *
 * HAPI defaults to an in-memory H2 database when no datasource is configured, which means the
 * server starts empty every time its task is replaced. The datasource is therefore always
 * configured, and the credentials are generated into Secrets Manager rather than written into the
 * task definition.
 */
export class HapiEndpoint extends Construct {
  containerPort = 8080;
  databaseName = 'hapi';
  containerName: string;
  service: FargateService;
  database: DatabaseInstance;

  constructor(scope: Construct, id: string, props: HapiEndpointProps) {
    super(scope, id);

    const { cluster, constructIdPrefix, serviceName, databaseInstanceSize } = props;
    this.containerName = serviceName;

    this.database = new DatabaseInstance(this, `${constructIdPrefix}Database`, {
      engine: DatabaseInstanceEngine.postgres({ version: HAPI_POSTGRES_VERSION }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE4_GRAVITON, databaseInstanceSize),
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

    const taskDefinition = new TaskDefinition(this, `${constructIdPrefix}TaskDefinition`, {
      compatibility: Compatibility.FARGATE,
      cpu: props.cpu,
      memoryMiB: props.memoryMiB
    });

    taskDefinition.addContainer(`${constructIdPrefix}Container`, {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry(HAPI_IMAGE_TAG),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: serviceName,
        logRetention: RetentionDays.ONE_MONTH
      }),
      environment: {
        use_apache_address_strategy: 'true',
        'hapi.fhir.openapi_enabled': 'false',
        ...props.hapiSettings,
        // Spread above rather than below, so that the datasource this construct owns cannot be
        // overridden by a caller. Losing it is what sends HAPI back to its in-memory default.
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

    this.service = new FargateService(this, `${constructIdPrefix}Service`, {
      cluster,
      taskDefinition,
      // Schema migration against a cold database extends first boot beyond the target group's
      // tolerance, which previously surfaced as tasks replaced for "Request timed out".
      healthCheckGracePeriod: Duration.minutes(5)
    });

    this.database.connections.allowDefaultPortFrom(
      this.service,
      'Allow the HAPI FHIR server to reach its database'
    );

    // No explicit `service.node.addDependency(database)` here. It reads like cheap insurance, but
    // `node.addDependency` applies across whole construct subtrees: it makes the service's security
    // group depend on the database's ingress rule, and that rule already references the service's
    // security group. CloudFormation rejects the resulting cycle when it builds the change set.
    //
    // The ordering it was meant to guarantee already exists. SPRING_DATASOURCE_URL resolves the
    // database endpoint through Fn::GetAtt and the credentials resolve through the generated
    // secret, so the task definition cannot be created before the database, and the service cannot
    // be created before its task definition.
  }
}
