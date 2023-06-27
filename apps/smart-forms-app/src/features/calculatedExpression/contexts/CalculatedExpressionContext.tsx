/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { QuestionnaireProviderContext } from '../../../App.tsx';
import type { CalculatedExpressionContextType } from '../types/calculatedExpressionContext.type.ts';
import type { CalculatedExpression } from '../types/calculatedExpression.interface.ts';
import { createFhirPathContext } from '../../../utils/fhirpath.ts';

export const CalculatedExpressionContext = createContext<CalculatedExpressionContextType>({
  calculatedExpressions: {},
  updateCalculatedExpressions: () => void 0
});

function CalculatedExpressionContextProvider(props: { children: ReactNode }) {
  const { children } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);

  const calculatedExpressionContext: CalculatedExpressionContextType = {
    calculatedExpressions: calculatedExpressions,
    /**
     * Evaluate all calculated expressions after a change has been made in a questionnaireResponse
     * Evaluation is done using fhirpath.evaluate function
     *
     * @author Sean Fong
     */
    updateCalculatedExpressions: (
      questionnaireResponse: QuestionnaireResponse,
      variablesFhirPath: Record<string, Expression[]>
    ) => {
      // Evaluate top-level items' variables
      let isUpdated = false;
      const updatedCalculatedExpressions = { ...calculatedExpressions };
      if (Object.keys(calculatedExpressions).length > 0 && questionnaireResponse.item) {
        const fhirPathContext: Record<string, any> = createFhirPathContext(
          questionnaireResponse,
          variablesFhirPath
        );

        // Update calculatedExpressions
        if (Object.keys(context).length > 0) {
          for (const linkId in calculatedExpressions) {
            const result = fhirpath.evaluate(
              questionnaireResponse,
              calculatedExpressions[linkId].expression,
              fhirPathContext,
              fhirpath_r4_model
            );

            if (result.length > 0) {
              if (calculatedExpressions[linkId].value !== result[0]) {
                isUpdated = true;
                updatedCalculatedExpressions[linkId].value = result[0];
              }
            }
          }
        }
      }

      if (isUpdated) {
        setCalculatedExpressions(updatedCalculatedExpressions);
      }
    }
  };

  return (
    <CalculatedExpressionContext.Provider value={calculatedExpressionContext}>
      {children}
    </CalculatedExpressionContext.Provider>
  );
}

export default CalculatedExpressionContextProvider;
