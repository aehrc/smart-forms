import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { oauth2 } from 'fhirclient';
import ProgressSpinner from '../QRenderer/ProgressSpinner';

function Launch() {
  const [searchParams] = useSearchParams();

  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  const clientId = 'smart-health-checks';
  const scope = 'launch/patient patient/*.read offline_access openid fhirUser';
  const redirectUri = window.location.origin + '/';

  oauth2.authorize({
    iss: iss ?? 'https://launch.smarthealthit.org/v/r4/fhir',
    client_id: clientId,
    scope: scope,
    launch: launch ?? undefined,
    redirect_uri: redirectUri
  });

  return (
    <>
      <ProgressSpinner message={'Launching the SMART Health Checks application'} />
      <div>{iss}</div>
      <div>{launch}</div>
    </>
  );
}

export default Launch;
