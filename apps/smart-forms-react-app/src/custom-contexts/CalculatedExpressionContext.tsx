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

import React, { useContext, useState } from 'react';
import type { CalculatedExpressionContextType } from '../interfaces/ContextTypes';
import type { Expression, QuestionnaireResponse } from 'fhir/r5';
import type { CalculatedExpression } from '../interfaces/Interfaces';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { QuestionnaireProviderContext } from '../App';

export const CalculatedExpressionContext = React.createContext<CalculatedExpressionContextType>({
  calculatedExpressions: {},
  updateCalculatedExpressions: () => void 0
});

function CalculatedExpressionContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  const [calculatedExpressions, setCalculatedExpressions] = useState<
    Record<string, CalculatedExpression>
  >(questionnaireProvider.calculatedExpressions);

  const calculatedExpressionContext: CalculatedExpressionContextType = {
    calculatedExpressions: calculatedExpressions,
    /**
     * Evaluate all calculated expressions after a change has been made in a questionnaireRespoonse
     * Evaluation is done using fhirpath.evaluate function
     *
     * @author Sean Fong
     */
    updateCalculatedExpressions: (
      questionnaireResponse: QuestionnaireResponse,
      variables: Expression[]
    ) => {
      let isUpdated = false;
      const updatedCalculatedExpressions = { ...calculatedExpressions };
      if (Object.keys(calculatedExpressions).length > 0 && questionnaireResponse.item) {
        const context: Record<string, any> = {};
        const qrForm = questionnaireResponse.item[0];

        if (variables.length > 0 && qrForm) {
          variables.forEach((variable) => {
            context[`${variable.name}`] = fhirpath.evaluate(
              qrForm,
              {
                base: 'QuestionnaireResponse.item',
                expression: `${variable.expression}`
              },
              context,
              fhirpath_r4_model
            );
          });

          for (const linkId in calculatedExpressions) {
            const result = fhirpath.evaluate(
              questionnaireResponse,
              calculatedExpressions[linkId].expression,
              context,
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
