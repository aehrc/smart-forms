/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference types="jest" />
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { oauth2 } from 'fhirclient';
import Launch from '../features/smartAppLaunch/components/Launch';
import type { ConfigContextType } from '../features/configChecker/contexts/ConfigContext';
import { ConfigContext } from '../features/configChecker/contexts/ConfigContext';
import { FALLBACK_CONFIG } from '../features/configChecker/utils/config';

jest.mock('fhirclient', () => ({
  oauth2: { authorize: jest.fn(() => Promise.resolve()) }
}));

jest.mock('../features/smartAppLaunch/components/LaunchView', () => ({
  __esModule: true,
  default: () => null
}));

const mockConfigContext: ConfigContextType = {
  config: FALLBACK_CONFIG,
  configLoading: false,
  configValid: true,
  configError: null,
  configErrorType: null,
  currentClientId: 'test-client-id',
  onSetCurrentClientId: jest.fn()
};

describe('Launch', () => {
  it('sends the redirect URI with a trailing slash, as registered in the integration spec', () => {
    render(
      <ConfigContext.Provider value={mockConfigContext}>
        <MemoryRouter initialEntries={['/launch?iss=https://ehr.example.com/fhir&launch=abc']}>
          <Launch />
        </MemoryRouter>
      </ConfigContext.Provider>
    );

    expect(oauth2.authorize).toHaveBeenCalledWith(
      expect.objectContaining({
        iss: 'https://ehr.example.com/fhir',
        clientId: 'test-client-id',
        redirectUri: `${window.location.origin}/`
      })
    );
    expect(window.location.origin.endsWith('/')).toBe(false);
  });
});
