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

import { Expression, Questionnaire, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { CalculatedExpression, EnableWhenItemProperties } from '../interfaces/Interfaces';
import { getEnableWhenItemProperties } from '../functions/EnableWhenFunctions';
import { getCalculatedExpression } from '../functions/ItemControlFunctions';
import { QuestionnaireSource } from '../interfaces/Enums';
import {
  assembleQuestionnaire,
  assemblyIsRequired,
  updateAssembledQuestionnaire
} from '../functions/AssembleFunctions';
import Client from 'fhirclient/lib/Client';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  source: QuestionnaireSource | null;
  variables: Expression[];
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  containedValueSets: Record<string, ValueSet>;

  constructor() {
    this.questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    this.source = null;
    this.variables = [];
    this.calculatedExpressions = {};
    this.enableWhenItems = {};
    this.containedValueSets = {};
  }

  async setQuestionnaire(
    questionnaire: Questionnaire,
    questionnaireSourceIsLocal: boolean,
    client: Client | null
  ) {
    // Assemble questionnaire if its not assembled
    if (assemblyIsRequired(questionnaire)) {
      questionnaire = await assembleQuestionnaire(questionnaire);

      if (client) {
        await updateAssembledQuestionnaire(client, questionnaire);
      }
    }

    this.questionnaire = questionnaire;
    this.source = questionnaireSourceIsLocal
      ? QuestionnaireSource.Local
      : QuestionnaireSource.Remote;
    this.readCalculatedExpressionsAndEnableWhenItems();
    this.readVariables();
    this.readContainedValueSets();
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
  readCalculatedExpressionsAndEnableWhenItems() {
    if (!this.questionnaire.item) return;

    this.questionnaire.item.forEach((item) => {
      this.readQuestionnaireItem(item);
    });
  }

  /**
   * Read enableWhen items and calculated expressions of each qItem recursively
   *
   * @author Sean Fong
   */
  readQuestionnaireItem(item: QuestionnaireItem) {
    const items = item.item;
    if (items && items.length > 0) {
      // iterate through items of item recursively
      items.forEach((item) => {
        this.readQuestionnaireItem(item);
      });
    }

    // Read enableWhen item and calculated expressions of simple qItem
    const calculatedExpression = getCalculatedExpression(item);
    if (calculatedExpression) {
      this.calculatedExpressions[item.linkId] = {
        expression: `${calculatedExpression.expression}`
      };
    }

    const EnableWhenItemProperties = getEnableWhenItemProperties(item);
    if (EnableWhenItemProperties) {
      this.enableWhenItems[item.linkId] = EnableWhenItemProperties;
    }

    return;
  }

  readContainedValueSets() {
    if (!this.questionnaire.contained || this.questionnaire.contained.length === 0) return;

    this.questionnaire.contained.forEach((entry) => {
      if (entry.resourceType === 'ValueSet' && entry.id) {
        this.containedValueSets[entry.id] = entry;
      }
    });
  }
}
