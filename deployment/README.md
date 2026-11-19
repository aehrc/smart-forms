# Deployment

CDK applications for the Smart Forms AWS infrastructure in account `209248795938`, `ap-southeast-2`.

| Stack | App directory | Serves |
| --- | --- | --- |
| `FormsServerAppStack` | `forms-server/forms-server-app` | `https://smartforms.csiro.au/api/fhir` |
| `EhrProxyAppStack` | `ehr-proxy/ehr-proxy-app` | `https://proxy.smartforms.io/fhir` |

Both run a HAPI FHIR server on Fargate backed by its own RDS PostgreSQL instance, built from the
shared `shared/hapi-endpoint` construct. See that package's README for why the database is not
optional and why its construct ids are passed in explicitly.

## Deploying

Use the **CDK Infrastructure Deployment** workflow (Actions > Run workflow). It is dispatch only:
these stacks back demo and evaluation environments, and deploying replaces the HAPI tasks, which
briefly takes the FHIR servers offline. That should always be someone's decision, not a side effect
of merging.

Inputs are the stack (`both` by default) and the action (`diff` by default). The `diff` job always
runs first and prints the pending changes to the run summary, so whoever approves the deploy can see
what they are approving.

To deploy from a workstation instead, follow the steps in `forms-server/README.md` or
`ehr-proxy/README.md`.

## Drift

Nothing deploys these stacks automatically, so `main` and the running infrastructure can diverge
without anyone noticing. They sat un-deployed from 2025-08 until 2026-07 for exactly that reason.

The **CDK Infrastructure Drift Check** workflow runs weekly, compares both stacks against `main`,
and opens (or updates) an issue labelled `cdk-drift` when they differ. It closes the issue once they
match again. Drift right after a merge that touches `deployment/` is expected, and just means the
change has not been rolled out yet.

## Required setup

Both workflows authenticate to AWS with GitHub OIDC and need one repository variable:

| Variable | Value |
| --- | --- |
| `AWS_CDK_DEPLOY_ROLE_ARN` | ARN of an IAM role that GitHub Actions assumes to run CDK |

The account already has the GitHub OIDC provider and the standard `cdk-hnb659fds-*` bootstrap roles.
What does not exist yet is a role for CDK deployment from CI. `SmartFormsReactAppDeployment` is not
it: that role is scoped to the React app's S3 deployment, and widening it would be worse than
adding a dedicated role.

The new role needs a trust policy accepting `repo:aehrc/smart-forms:*` from
`token.actions.githubusercontent.com` (mirroring `SmartFormsReactAppDeployment`), and permission to
assume the bootstrap roles:

```json
{
  "Effect": "Allow",
  "Action": "sts:AssumeRole",
  "Resource": [
    "arn:aws:iam::209248795938:role/cdk-hnb659fds-deploy-role-209248795938-ap-southeast-2",
    "arn:aws:iam::209248795938:role/cdk-hnb659fds-file-publishing-role-209248795938-ap-southeast-2",
    "arn:aws:iam::209248795938:role/cdk-hnb659fds-image-publishing-role-209248795938-ap-southeast-2",
    "arn:aws:iam::209248795938:role/cdk-hnb659fds-lookup-role-209248795938-ap-southeast-2"
  ]
}
```

Deploys additionally run in the `aws-production` GitHub environment. Configure it under
Settings > Environments with the reviewers permitted to deploy. That environment is the access
control; a check like `if: github.actor == ...` is trivially bypassable and is not a security
boundary. Until the environment exists, the `deploy` job cannot run, while `diff` still works.
