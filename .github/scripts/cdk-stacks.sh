#!/usr/bin/env bash
# Map the CDK deployment workflow's stack input to stack names and their app directories.
#
#   cdk-stacks.sh both                  -> EhrProxyAppStack FormsServerAppStack
#   cdk-stacks.sh EhrProxyAppStack      -> EhrProxyAppStack
#   cdk-stacks.sh --dir EhrProxyAppStack -> deployment/ehr-proxy/ehr-proxy-app
set -euo pipefail

if [ "${1:-}" = "--dir" ]; then
  case "${2:-}" in
    EhrProxyAppStack) echo 'deployment/ehr-proxy/ehr-proxy-app' ;;
    FormsServerAppStack) echo 'deployment/forms-server/forms-server-app' ;;
    *) echo "unknown stack: ${2:-}" >&2; exit 1 ;;
  esac
  exit 0
fi

case "${1:-both}" in
  both) echo 'EhrProxyAppStack FormsServerAppStack' ;;
  EhrProxyAppStack | FormsServerAppStack) echo "$1" ;;
  *) echo "unknown stack: ${1:-}" >&2; exit 1 ;;
esac
