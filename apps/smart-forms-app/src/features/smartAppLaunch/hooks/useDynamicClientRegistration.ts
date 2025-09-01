/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { useState, useCallback } from 'react';
import { 
  findIssuerConfig, 
  supportsDynamicRegistration, 
  getRegistrationEndpoint,
  shouldUseFixedClientId,
  getFixedClientId,
  getCustomRedirectUri
} from '../../../config/issuerConfig';
import {
  registerClient,
  getCurrentRedirectUris,
  checkDynamicRegistrationSupport,
  getRegistrationEndpointFromMetadata,
  type ClientRegistrationResponse
} from '../utils/dynamicClientRegistration';

export interface DynamicClientRegistrationState {
  /** Whether dynamic registration is supported by the issuer */
  isSupported: boolean;
  /** Whether dynamic registration is in progress */
  isRegistering: boolean;
  /** The dynamically registered client ID (if successful) */
  dynamicClientId: string | null;
  /** Any error that occurred during registration */
  error: string | null;
  /** Whether to use a fixed client ID for this issuer */
  useFixedClientId: boolean;
  /** The fixed client ID to use (if applicable) */
  fixedClientId: string | null;
}

export interface DynamicClientRegistrationActions {
  /** Check if dynamic registration is supported for an issuer */
  checkSupport: (issuerUrl: string) => Promise<boolean>;
  /** Perform dynamic client registration */
  performRegistration: (issuerUrl: string) => Promise<string | null>;
  /** Get the appropriate client ID for an issuer */
  getClientId: (issuerUrl: string) => Promise<string | null>;
  /** Reset the registration state */
  reset: () => void;
}

/**
 * Hook for managing dynamic client registration
 * Provides state and actions for handling OAuth2 Dynamic Client Registration Protocol
 */
export function useDynamicClientRegistration(): DynamicClientRegistrationState & DynamicClientRegistrationActions {
  const [state, setState] = useState<DynamicClientRegistrationState>({
    isSupported: false,
    isRegistering: false,
    dynamicClientId: null,
    error: null,
    useFixedClientId: false,
    fixedClientId: null
  });

  const checkSupport = useCallback(async (issuerUrl: string): Promise<boolean> => {
    try {
      // First check our local configuration
      const localConfig = findIssuerConfig(issuerUrl);
      let isSupported = localConfig?.supportsDynamicRegistration ?? false;
      let useFixedClientId = localConfig?.useFixedClientId ?? false;
      let fixedClientId = localConfig?.fixedClientId ?? null;

      // If we don't have local config, try to discover dynamically
      if (!localConfig) {
        console.log(`No local configuration found for issuer: ${issuerUrl}, attempting discovery`);
        isSupported = await checkDynamicRegistrationSupport(issuerUrl);
        useFixedClientId = false;
        fixedClientId = null;
      }

      setState(prev => ({
        ...prev,
        isSupported,
        useFixedClientId,
        fixedClientId
      }));

      return isSupported;
    } catch (error) {
      console.error('Error checking dynamic registration support:', error);
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  }, []);

  const performRegistration = useCallback(async (issuerUrl: string): Promise<string | null> => {
    try {
      setState(prev => ({
        ...prev,
        isRegistering: true,
        error: null
      }));

      // Get registration endpoint
      let registrationEndpoint = getRegistrationEndpoint(issuerUrl);
      
      // If not in local config, try to discover from metadata
      if (!registrationEndpoint) {
        registrationEndpoint = await getRegistrationEndpointFromMetadata(issuerUrl);
      }

      if (!registrationEndpoint) {
        throw new Error('No registration endpoint found for issuer');
      }

      // Get redirect URIs
      const redirectUris = getCurrentRedirectUris();

      // Perform registration
      const response: ClientRegistrationResponse = await registerClient(
        registrationEndpoint,
        redirectUris
      );

      const clientId = response.client_id;

      setState(prev => ({
        ...prev,
        isRegistering: false,
        dynamicClientId: clientId,
        error: null
      }));

      console.log(`Successfully registered client with ID: ${clientId}`);
      return clientId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Dynamic client registration failed:', error);
      
      setState(prev => ({
        ...prev,
        isRegistering: false,
        error: errorMessage
      }));

      return null;
    }
  }, []);

  const getClientId = useCallback(async (issuerUrl: string): Promise<string | null> => {
    try {
      // Check if we should use a fixed client ID
      if (shouldUseFixedClientId(issuerUrl)) {
        const fixedClientId = getFixedClientId(issuerUrl);
        if (fixedClientId) {
          console.log(`Using fixed client ID for issuer: ${issuerUrl}`);
          return fixedClientId;
        }
      }

      // Check if dynamic registration is supported
      const isSupported = await checkSupport(issuerUrl);
      
      if (!isSupported) {
        console.log(`Dynamic registration not supported for issuer: ${issuerUrl}, using fallback`);
        return null;
      }

      // Perform dynamic registration
      const clientId = await performRegistration(issuerUrl);
      return clientId;
    } catch (error) {
      console.error('Error getting client ID:', error);
      return null;
    }
  }, [checkSupport, performRegistration]);

  const reset = useCallback(() => {
    setState({
      isSupported: false,
      isRegistering: false,
      dynamicClientId: null,
      error: null,
      useFixedClientId: false,
      fixedClientId: null
    });
  }, []);

  return {
    ...state,
    checkSupport,
    performRegistration,
    getClientId,
    reset
  };
}

