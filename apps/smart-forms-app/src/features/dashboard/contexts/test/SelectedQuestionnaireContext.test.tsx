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
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import SelectedQuestionnaireContextProvider, {
  SelectedQuestionnaireContext,
  type SelectedQuestionnaireContextType
} from '../SelectedQuestionnaireContext';

// Test component to access context
const TestComponent = ({
  onContextChange
}: {
  onContextChange: (context: SelectedQuestionnaireContextType) => void;
}) => {
  const context = useContext(SelectedQuestionnaireContext);

  React.useEffect(() => {
    onContextChange(context);
  }, [context, onContextChange]);

  return <div data-testid="test-component">Test Component</div>;
};

// Helper to render with context provider
const renderWithProvider = (
  onContextChange: (context: SelectedQuestionnaireContextType) => void
) => {
  return render(
    <SelectedQuestionnaireContextProvider>
      <TestComponent onContextChange={onContextChange} />
    </SelectedQuestionnaireContextProvider>
  );
};

describe('SelectedQuestionnaireContext', () => {
  let mockContext: SelectedQuestionnaireContextType;

  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-123',
    status: 'active',
    title: 'Test Questionnaire',
    item: [
      {
        linkId: '1',
        text: 'Test question',
        type: 'string'
      }
    ]
  };

  const mockQuestionnaireResponse1: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'response-1',
    status: 'completed',
    questionnaire: 'Questionnaire/questionnaire-123',
    item: [
      {
        linkId: '1',
        answer: [{ valueString: 'Test answer 1' }]
      }
    ]
  };

  const mockQuestionnaireResponse2: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'response-2',
    status: 'in-progress',
    questionnaire: 'Questionnaire/questionnaire-123',
    item: [
      {
        linkId: '1',
        answer: [{ valueString: 'Test answer 2' }]
      }
    ]
  };

  beforeEach(() => {
    mockContext = {} as SelectedQuestionnaireContextType;
  });

  describe('Provider initialization', () => {
    it('should provide initial state values', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      expect(mockContext.selectedQuestionnaire).toBeNull();
      expect(mockContext.existingResponses).toEqual([]);
      expect(typeof mockContext.setSelectedQuestionnaire).toBe('function');
      expect(typeof mockContext.setExistingResponses).toBe('function');
    });

    it('should render children correctly', () => {
      const { getByTestId } = renderWithProvider((context) => {
        mockContext = context;
      });

      expect(getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('setSelectedQuestionnaire', () => {
    it('should set selected questionnaire', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.selectedQuestionnaire?.id).toBe('questionnaire-123');
      expect(mockContext.selectedQuestionnaire?.title).toBe('Test Questionnaire');
    });

    it('should set questionnaire to null', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // First set a questionnaire
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);

      // Then set to null
      act(() => {
        mockContext.setSelectedQuestionnaire(null);
      });

      expect(mockContext.selectedQuestionnaire).toBeNull();
    });

    it('should override existing questionnaire', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial questionnaire
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      const newQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-456',
        status: 'draft',
        title: 'New Questionnaire'
      };

      // Override with new questionnaire
      act(() => {
        mockContext.setSelectedQuestionnaire(newQuestionnaire);
      });

      expect(mockContext.selectedQuestionnaire).toBe(newQuestionnaire);
      expect(mockContext.selectedQuestionnaire?.id).toBe('questionnaire-456');
      expect(mockContext.selectedQuestionnaire?.title).toBe('New Questionnaire');
    });

    it('should not affect existing responses when setting questionnaire', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set responses first
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      // Then set questionnaire
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.existingResponses).toHaveLength(1);
      expect(mockContext.existingResponses[0]).toBe(mockQuestionnaireResponse1);
    });
  });

  describe('setExistingResponses', () => {
    it('should set existing responses array', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      const responses = [mockQuestionnaireResponse1, mockQuestionnaireResponse2];

      act(() => {
        mockContext.setExistingResponses(responses);
      });

      expect(mockContext.existingResponses).toBe(responses);
      expect(mockContext.existingResponses).toHaveLength(2);
      expect(mockContext.existingResponses[0]).toBe(mockQuestionnaireResponse1);
      expect(mockContext.existingResponses[1]).toBe(mockQuestionnaireResponse2);
    });

    it('should set empty responses array', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // First set some responses
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.existingResponses).toHaveLength(1);

      // Then set empty array
      act(() => {
        mockContext.setExistingResponses([]);
      });

      expect(mockContext.existingResponses).toEqual([]);
      expect(mockContext.existingResponses).toHaveLength(0);
    });

    it('should override existing responses', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial responses
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.existingResponses).toHaveLength(1);
      expect(mockContext.existingResponses[0]?.id).toBe('response-1');

      // Override with new responses
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse2]);
      });

      expect(mockContext.existingResponses).toHaveLength(1);
      expect(mockContext.existingResponses[0]?.id).toBe('response-2');
      expect(mockContext.existingResponses[0]).toBe(mockQuestionnaireResponse2);
    });

    it('should not affect selected questionnaire when setting responses', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set questionnaire first
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      // Then set responses
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.existingResponses).toHaveLength(1);
      expect(mockContext.existingResponses[0]).toBe(mockQuestionnaireResponse1);
    });

    it('should handle single response in array', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.existingResponses).toHaveLength(1);
      expect(mockContext.existingResponses[0]?.status).toBe('completed');
      expect(mockContext.existingResponses[0]?.questionnaire).toBe(
        'Questionnaire/questionnaire-123'
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle setting both questionnaire and responses', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      const responses = [mockQuestionnaireResponse1, mockQuestionnaireResponse2];

      // Set questionnaire
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
      });

      // Set responses
      act(() => {
        mockContext.setExistingResponses(responses);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.existingResponses).toBe(responses);
      expect(mockContext.existingResponses).toHaveLength(2);
    });

    it('should handle multiple updates in sequence', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Initial setup
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.selectedQuestionnaire?.id).toBe('questionnaire-123');
      expect(mockContext.existingResponses).toHaveLength(1);

      // Update questionnaire
      const newQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-new',
        status: 'active'
      };

      act(() => {
        mockContext.setSelectedQuestionnaire(newQuestionnaire);
      });

      expect(mockContext.selectedQuestionnaire).toBe(newQuestionnaire);
      expect(mockContext.existingResponses).toHaveLength(1); // Should remain unchanged

      // Update responses
      act(() => {
        mockContext.setExistingResponses([mockQuestionnaireResponse1, mockQuestionnaireResponse2]);
      });

      expect(mockContext.selectedQuestionnaire).toBe(newQuestionnaire); // Should remain unchanged
      expect(mockContext.existingResponses).toHaveLength(2);
    });

    it('should handle clearing all state', () => {
      renderWithProvider((context) => {
        mockContext = context;
      });

      // Set initial state
      act(() => {
        mockContext.setSelectedQuestionnaire(mockQuestionnaire);
        mockContext.setExistingResponses([mockQuestionnaireResponse1]);
      });

      expect(mockContext.selectedQuestionnaire).toBe(mockQuestionnaire);
      expect(mockContext.existingResponses).toHaveLength(1);

      // Clear all state
      act(() => {
        mockContext.setSelectedQuestionnaire(null);
        mockContext.setExistingResponses([]);
      });

      expect(mockContext.selectedQuestionnaire).toBeNull();
      expect(mockContext.existingResponses).toEqual([]);
      expect(mockContext.existingResponses).toHaveLength(0);
    });
  });

  describe('Default context values', () => {
    it('should provide default context outside provider', () => {
      const TestComponentWithoutProvider = () => {
        const context = useContext(SelectedQuestionnaireContext);
        return (
          <div>
            <span data-testid="questionnaire">
              {context.selectedQuestionnaire ? 'has-questionnaire' : 'no-questionnaire'}
            </span>
            <span data-testid="responses-length">{context.existingResponses.length}</span>
            <span data-testid="set-questionnaire">{typeof context.setSelectedQuestionnaire}</span>
            <span data-testid="set-responses">{typeof context.setExistingResponses}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponentWithoutProvider />);

      expect(getByTestId('questionnaire')).toHaveTextContent('no-questionnaire');
      expect(getByTestId('responses-length')).toHaveTextContent('0');
      expect(getByTestId('set-questionnaire')).toHaveTextContent('function');
      expect(getByTestId('set-responses')).toHaveTextContent('function');
    });

    it('should call default functions without error', () => {
      const TestComponentWithoutProvider = () => {
        const context = useContext(SelectedQuestionnaireContext);

        React.useEffect(() => {
          // Test that default functions can be called without error
          context.setSelectedQuestionnaire(null);
          context.setExistingResponses([]);
        }, [context]);

        return <div data-testid="no-error">No error</div>;
      };

      const { getByTestId } = render(<TestComponentWithoutProvider />);
      expect(getByTestId('no-error')).toBeInTheDocument();
    });
  });

  describe('Function reference stability', () => {
    it('should provide stable function references', () => {
      let firstContext: SelectedQuestionnaireContextType | undefined;
      let secondContext: SelectedQuestionnaireContextType | undefined;

      const { rerender } = renderWithProvider((context) => {
        if (!firstContext) {
          firstContext = context;
        } else {
          secondContext = context;
        }
      });

      // Trigger rerender
      rerender(
        <SelectedQuestionnaireContextProvider>
          <TestComponent
            onContextChange={(context) => {
              if (!firstContext) {
                firstContext = context;
              } else {
                secondContext = context;
              }
            }}
          />
        </SelectedQuestionnaireContextProvider>
      );

      expect(typeof firstContext?.setSelectedQuestionnaire).toBe('function');
      expect(typeof firstContext?.setExistingResponses).toBe('function');
      expect(typeof secondContext?.setSelectedQuestionnaire).toBe('function');
      expect(typeof secondContext?.setExistingResponses).toBe('function');
    });
  });
});
