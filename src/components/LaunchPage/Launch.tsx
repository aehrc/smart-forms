import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { oauth2 } from 'fhirclient';
import ProgressSpinner from '../QRenderer/ProgressSpinner';

function Launch() {
  const [searchParams] = useSearchParams();

  const iss = searchParams.get('iss');
  const launch = searchParams.get('launch');

  const clientId = process.env.REACT_APP_LAUNCH_CLIENT_ID ?? 'smart-health-checks';
  const scope =
    process.env.REACT_APP_LAUNCH_SCOPE ??
    'launch/patient patient/*.read offline_access openid fhirUser';
  const redirectUri = window.location.origin + '/';

  oauth2.authorize({
    iss: iss ?? undefined,
    client_id: clientId,
    scope: scope,
    launch: launch ?? undefined,
    redirect_uri: redirectUri
  });

  return (
    <>
      <ProgressSpinner message={'Launching the SMART Health Checks application'} />
    </>
  );
}

export default Launch;
