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

import type { Coding, Expression, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type {
  CalculatedExpression,
  EnableWhenItemProperties,
  ValueSetPromise
} from '../interfaces/Interfaces';
import { getEnableWhenItemProperties } from '../functions/EnableWhenFunctions';
import { getCalculatedExpression } from '../functions/ItemControlFunctions';
import {
  getValueSetCodings,
  getValueSetPromise,
  getValueSetUrlFromContained,
  resolvePromises
} from '../functions/ValueSetFunctions';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  variables: Expression[];
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  preprocessedValueSetCodings: Record<string, Coding[]>;

  constructor() {
    this.questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    this.variables = [];
    this.calculatedExpressions = {};
    this.enableWhenItems = {};
    this.preprocessedValueSetCodings = {};
  }

  async setQuestionnaire(questionnaire: Questionnaire): Promise<void> {
    this.questionnaire = questionnaire;
    await this.preprocessQuestionnaire();
    this.readVariables();
  }

  /**
   * Check if an extension is a variable and gets all variable expressions
   *
   * @author Sean Fong
   */
  readVariables() {
    if (!this.questionnaire.item) return;

    this.questionnaire.item.forEach((item) => {
      if (item.extension) {
        item.extension
          .filter(
            (extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/variable'
          )
          .forEach((extension) => {
            if (extension.valueExpression) {
              this.variables.push(extension.valueExpression);
            }
          });
      }
    });
  }

  /**
   * Read all enableWhen items and calculated expressions in questionnaireResponse
   *
   * @author Sean Fong
   */
  async preprocessQuestionnaire() {
    if (!this.questionnaire.item) return;

    const valueSetPromiseMap: Record<string, ValueSetPromise> = {};

    // Process contained ValueSets
    if (this.questionnaire.contained && this.questionnaire.contained.length > 0) {
      this.questionnaire.contained.forEach((entry) => {
        if (entry.resourceType === 'ValueSet' && entry.id) {
          if (entry.expansion) {
            // Store contained valueSet codings
            this.preprocessedValueSetCodings[entry.id] = getValueSetCodings(entry);
          } else {
            // Add unexpanded contained ValueSets to valueSetPromiseMap
            const valueSetUrl = getValueSetUrlFromContained(entry);
            if (valueSetUrl) {
              valueSetPromiseMap[entry.id] = {
                promise: getValueSetPromise(valueSetUrl)
              };
            }
          }
        }
      });
    }

    // Read enableWhen items, calculated expressions and valueSets to be expanded
    this.questionnaire.item.forEach((item) => {
      this.readQuestionnaireItem(item, valueSetPromiseMap);
    });

    const valueSetPromises = await resolvePromises(valueSetPromiseMap);

    // Store valueSet codings
    for (const valueSetUrl in valueSetPromises) {
      const valueSet = valueSetPromises[valueSetUrl].valueSet;
      if (valueSet) {
        this.preprocessedValueSetCodings[valueSetUrl] = getValueSetCodings(valueSet);
      }
    }
  }

  /**
   * Read enableWhen items and calculated expressions of each qItem recursively
   *
   * @author Sean Fong
   */
  readQuestionnaireItem(
    item: QuestionnaireItem,
    valueSetPromiseMap: Record<string, ValueSetPromise>
  ) {
    const items = item.item;
    if (items && items.length > 0) {
      // iterate through items of item recursively
      items.forEach((item) => {
        this.readQuestionnaireItem(item, valueSetPromiseMap);
      });
    }

    // Read enableWhen items, calculated expressions and valueSets from qItem
    const calculatedExpression = getCalculatedExpression(item);
    if (calculatedExpression) {
      this.calculatedExpressions[item.linkId] = {
        expression: `${calculatedExpression.expression}`
      };
    }

    const enableWhenItemProperties = getEnableWhenItemProperties(item);
    if (enableWhenItemProperties) {
      this.enableWhenItems[item.linkId] = enableWhenItemProperties;
    }

    const valueSetUrl = item.answerValueSet;
    if (valueSetUrl) {
      if (!valueSetPromiseMap[valueSetUrl] && !valueSetUrl.startsWith('#')) {
        valueSetPromiseMap[valueSetUrl] = {
          promise: getValueSetPromise(valueSetUrl)
        };
      }
    }
  }
}
