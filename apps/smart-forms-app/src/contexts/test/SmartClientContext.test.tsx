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

import { render, act } from '@testing-library/react';
import React, { useContext } from 'react';
import type { Patient, Practitioner, Encounter, Questionnaire } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import SmartClientContextProvider, {
  SmartClientContext,
  type SmartClientContextType
} from '../SmartClientContext';
import type { FhirContext } from '../../features/smartAppLaunch/utils/launch';

// Test component to access context
const TestComponent = ({
  onContextChange
}: {
  onContextChange: (context: SmartClientContextType) => void;
}) => {
  const context = useContext(SmartClientContext);

  React.useEffect(() => {
    onContextChange(context);
  }, [context, onContextChange]);

  return <div data-testid="test-component">Test Component</div>;
};

// Helper to render with context provider
const renderWithProvider = (onContextChange: (context: SmartClientContextType) => void) => {
  return render(
    <SmartClientContextProvider>
      <TestComponent onContextChange={onContextChange} />
    </SmartClientContextProvider>
  );
};

describe('SmartClientContext', () => {
  let mockContext: SmartClientContextType;

  const mockClient = { id: 'test-client' } as unknown as Client;
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-123',
    name: [{ family: 'Doe', given: ['John'] }]
  };
  const mockUser: Practitioner = {
    resourceType: 'Practitioner',
    id: 'practitioner-456',
    name: [{ family: 'Smith', given: ['Dr. Jane'] }]
  };
  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'encounter-789',
    status: 'in-progress',
    class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
  };
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-abc',
    status: 'active'
  };
  const mockFhirContext: FhirContext[] = [
    { name: 'patient', reference: 'Patient/123' },
    { name: 'encounter', reference: 'Encounter/789' }
  ];

  beforeEach(() => {
    mockContext = {} as SmartClientContextType;
  });

  describe('Provider initialization', () => {
    it('should provide initial state values', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      expect(mockContext.state.smartClient).toBeNull();
      expect(mockContext.state.patient).toBeNull();
      expect(mockContext.state.user).toBeNull();
      expect(mockContext.state.encounter).toBeNull();
      expect(mockContext.state.launchQuestionnaire).toBeNull();
      expect(mockContext.state.fhirContext).toBeNull();
      expect(mockContext.state.tokenReceivedTimestamp).toBeNull();
      expect(typeof mockContext.dispatch).toBe('function');
    });

    it('should render children correctly', () => {
      const { getByTestId } = renderWithProvider((context) => {
        mockContext = context;
      });

      expect(getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('SET_CLIENT action', () => {
    it('should set client and timestamp when dispatching SET_CLIENT', () => {
      const timestampBefore = Date.now();

      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_CLIENT',
          payload: mockClient
        });
      });

      const timestampAfter = Date.now();

      expect(mockContext.state.smartClient).toBe(mockClient);
      expect(mockContext.state.tokenReceivedTimestamp).toBeGreaterThanOrEqual(timestampBefore);
      expect(mockContext.state.tokenReceivedTimestamp).toBeLessThanOrEqual(timestampAfter);

      // Other state should remain unchanged
      expect(mockContext.state.patient).toBeNull();
      expect(mockContext.state.user).toBeNull();
      expect(mockContext.state.encounter).toBeNull();
    });

    it('should preserve other state properties when setting client', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set some initial context first
      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: mockPatient, user: mockUser, encounter: mockEncounter }
        });
      });

      // Then set client
      act(() => {
        mockContext.dispatch({
          type: 'SET_CLIENT',
          payload: mockClient
        });
      });

      expect(mockContext.state.smartClient).toBe(mockClient);
      expect(mockContext.state.patient).toBe(mockPatient);
      expect(mockContext.state.user).toBe(mockUser);
      expect(mockContext.state.encounter).toBe(mockEncounter);
    });
  });

  describe('SET_COMMON_CONTEXTS action', () => {
    it('should set all common contexts when all are provided', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: mockPatient, user: mockUser, encounter: mockEncounter }
        });
      });

      expect(mockContext.state.patient).toBe(mockPatient);
      expect(mockContext.state.user).toBe(mockUser);
      expect(mockContext.state.encounter).toBe(mockEncounter);

      // Other state should remain unchanged
      expect(mockContext.state.smartClient).toBeNull();
      expect(mockContext.state.launchQuestionnaire).toBeNull();
    });

    it('should handle null values in common contexts', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: mockPatient, user: null, encounter: null }
        });
      });

      expect(mockContext.state.patient).toBe(mockPatient);
      expect(mockContext.state.user).toBeNull();
      expect(mockContext.state.encounter).toBeNull();
    });

    it('should override existing contexts with new values', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial contexts
      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: mockPatient, user: mockUser, encounter: mockEncounter }
        });
      });

      const newPatient: Patient = { resourceType: 'Patient', id: 'patient-new' };

      // Override with new values
      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: newPatient, user: null, encounter: null }
        });
      });

      expect(mockContext.state.patient).toBe(newPatient);
      expect(mockContext.state.user).toBeNull();
      expect(mockContext.state.encounter).toBeNull();
    });
  });

  describe('SET_QUESTIONNAIRE_CONTEXT action', () => {
    it('should set questionnaire context', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_QUESTIONNAIRE_CONTEXT',
          payload: mockQuestionnaire
        });
      });

      expect(mockContext.state.launchQuestionnaire).toBe(mockQuestionnaire);

      // Other state should remain unchanged
      expect(mockContext.state.smartClient).toBeNull();
      expect(mockContext.state.patient).toBeNull();
    });

    it('should override existing questionnaire context', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial questionnaire
      act(() => {
        mockContext.dispatch({
          type: 'SET_QUESTIONNAIRE_CONTEXT',
          payload: mockQuestionnaire
        });
      });

      const newQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-new',
        status: 'draft'
      };

      // Override with new questionnaire
      act(() => {
        mockContext.dispatch({
          type: 'SET_QUESTIONNAIRE_CONTEXT',
          payload: newQuestionnaire
        });
      });

      expect(mockContext.state.launchQuestionnaire).toBe(newQuestionnaire);
    });
  });

  describe('SET_FHIR_CONTEXT action', () => {
    it('should set FHIR context array', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_FHIR_CONTEXT',
          payload: mockFhirContext
        });
      });

      expect(mockContext.state.fhirContext).toBe(mockFhirContext);
      expect(mockContext.state.fhirContext).toHaveLength(2);

      // Other state should remain unchanged
      expect(mockContext.state.smartClient).toBeNull();
      expect(mockContext.state.patient).toBeNull();
    });

    it('should handle empty FHIR context array', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.dispatch({
          type: 'SET_FHIR_CONTEXT',
          payload: []
        });
      });

      expect(mockContext.state.fhirContext).toEqual([]);
      expect(mockContext.state.fhirContext).toHaveLength(0);
    });

    it('should override existing FHIR context', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial FHIR context
      act(() => {
        mockContext.dispatch({
          type: 'SET_FHIR_CONTEXT',
          payload: mockFhirContext
        });
      });

      const newFhirContext: FhirContext[] = [
        { name: 'practitioner', reference: 'Practitioner/456' }
      ];

      // Override with new FHIR context
      act(() => {
        mockContext.dispatch({
          type: 'SET_FHIR_CONTEXT',
          payload: newFhirContext
        });
      });

      expect(mockContext.state.fhirContext).toBe(newFhirContext);
      expect(mockContext.state.fhirContext).toHaveLength(1);
    });
  });

  describe('Reducer edge cases', () => {
    it('should return current state for unknown action type', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      const initialState = mockContext.state;

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockContext.dispatch as any)({
          type: 'UNKNOWN_ACTION',
          payload: 'test'
        });
      });

      expect(mockContext.state).toEqual(initialState);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple actions in sequence', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set client first
      act(() => {
        mockContext.dispatch({
          type: 'SET_CLIENT',
          payload: mockClient
        });
      });

      // Set common contexts
      act(() => {
        mockContext.dispatch({
          type: 'SET_COMMON_CONTEXTS',
          payload: { patient: mockPatient, user: mockUser, encounter: mockEncounter }
        });
      });

      // Set questionnaire context
      act(() => {
        mockContext.dispatch({
          type: 'SET_QUESTIONNAIRE_CONTEXT',
          payload: mockQuestionnaire
        });
      });

      // Set FHIR context
      act(() => {
        mockContext.dispatch({
          type: 'SET_FHIR_CONTEXT',
          payload: mockFhirContext
        });
      });

      // Verify all state is set correctly
      expect(mockContext.state.smartClient).toBe(mockClient);
      expect(mockContext.state.patient).toBe(mockPatient);
      expect(mockContext.state.user).toBe(mockUser);
      expect(mockContext.state.encounter).toBe(mockEncounter);
      expect(mockContext.state.launchQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.state.fhirContext).toBe(mockFhirContext);
      expect(mockContext.state.tokenReceivedTimestamp).toBeGreaterThan(0);
    });

    it('should maintain state immutability', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      const initialState = mockContext.state;

      act(() => {
        mockContext.dispatch({
          type: 'SET_CLIENT',
          payload: mockClient
        });
      });

      // State object should be different (immutable update)
      expect(mockContext.state).not.toBe(initialState);

      // But unchanged properties should maintain reference equality
      expect(mockContext.state.patient).toBe(initialState.patient);
      expect(mockContext.state.user).toBe(initialState.user);
      expect(mockContext.state.encounter).toBe(initialState.encounter);
    });
  });

  describe('Default context values', () => {
    it('should provide default context outside provider', () => {
      const TestComponentWithoutProvider = () => {
        const context = useContext(SmartClientContext);
        return (
          <div>
            <span data-testid="client">
              {context.state.smartClient ? 'has-client' : 'no-client'}
            </span>
            <span data-testid="dispatch">{typeof context.dispatch}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponentWithoutProvider />);

      expect(getByTestId('client')).toHaveTextContent('no-client');
      expect(getByTestId('dispatch')).toHaveTextContent('function');
    });
  });
});
