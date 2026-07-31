# shared-hapi-endpoint

The `HapiEndpoint` construct: a [HAPI FHIR server](https://github.com/hapifhir/hapi-fhir-jpaserver-starter)
running on Fargate, backed by its own RDS PostgreSQL instance. Both the `forms-server` and
`ehr-proxy` stacks use it.

## Why the database is not optional

HAPI falls back to an in-memory H2 database (`jdbc:h2:mem:test_mem`) when no datasource is
configured. On Fargate that means the server starts empty every time its task is replaced, which
ECS does routinely on failed health checks, deployments and platform patching. Both stacks ran that
way until the datasource was made explicit, and the data had to be repopulated by hand each time.

The construct therefore always creates a database and always configures the datasource. Credentials
are generated into Secrets Manager and injected as task secrets, so they never appear in the task
definition. The `hapiSettings` prop is merged *underneath* the datasource settings, so a caller can
add HAPI configuration but cannot accidentally unset the datasource.

## Construct ids and why they are passed in

`constructIdPrefix` looks redundant next to the construct's own id, and it is not. CloudFormation
logical ids are derived from the construct path, and CloudFormation responds to a renamed resource
by replacing it. For a database, replacement means losing its contents.

The prefixes below match what is already deployed and must not be changed:

| Stack | `constructIdPrefix` | Example logical id |
| --- | --- | --- |
| `EhrProxyAppStack` | `EhrProxyHapi` | `EhrProxyHapiEhrProxyHapiService4CDBACDD` |
| `FormsServerAppStack` | `FormsServerHapi` | `FormsServerHapiFormsServerHapiService48273A33` |

If you change one, run `cdk diff` and confirm no resource is being replaced before deploying.

## Versions

`HAPI_IMAGE_TAG` and `HAPI_POSTGRES_VERSION` are exported so both stacks stay on the same versions.
The image is pinned rather than tracked at `latest`, because the database now outlives the task and
an unattended version bump would run schema migrations against real data. Bump both stacks together.

## Usage

```ts
const hapi = new HapiEndpoint(this, 'EhrProxyHapi', {
  cluster,
  constructIdPrefix: 'EhrProxyHapi',
  serviceName: 'ehr-proxy-hapi',
  cpu: '1024',
  memoryMiB: '2048',
  databaseInstanceSize: InstanceSize.MICRO,
  hapiSettings: { 'hapi.fhir.server_address': 'https://proxy.smartforms.io/fhir' }
});
```

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
