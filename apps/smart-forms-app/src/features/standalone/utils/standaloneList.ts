/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { RendererPropsState } from '../interfaces/standalone.interface.ts';
import QTestGridJson from '../data/QTestGrid.json';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import RTestGridJson from '../data/RTestGrid.json';
import AddVarsTestGridJson from '../data/AddVariablesTestGrid.json';
import Q715Json from '../data/Q715.json';
import R715Json from '../data/R715.json';
import QCVDRiskJson from '../data/QCVDRisk.json';
import RCVDRiskJson from '../data/RCVDRisk.json';
import QDemoAnsExp from '../data/QDemoAnsExp.json';
import RDemoAnsExp from '../data/RDemoAnsExp.json';

export const rendererPropsList: RendererPropsState[] = [
  {
    id: 'AboriginalTorresStraitIslanderHealthCheck',
    questionnaire: Q715Json as Questionnaire,
    response: R715Json as QuestionnaireResponse,
    additionalVars: null,
    terminologyServerUrl: null,
    readOnly: false
  },
  {
    id: 'TestGrid',
    questionnaire: QTestGridJson as Questionnaire,
    response: RTestGridJson as QuestionnaireResponse,
    additionalVars: AddVarsTestGridJson,
    terminologyServerUrl: null,
    readOnly: false
  },
  {
    id: 'CVDRiskCalculator',
    questionnaire: QCVDRiskJson as Questionnaire,
    response: RCVDRiskJson as QuestionnaireResponse,
    additionalVars: null,
    terminologyServerUrl: null,
    readOnly: false
  },
  {
    id: 'DemoAnswerExpression',
    questionnaire: QDemoAnsExp as Questionnaire,
    response: RDemoAnsExp as QuestionnaireResponse,
    additionalVars: null,
    terminologyServerUrl: 'http://hapi.fhir.org/baseR4',
    readOnly: false
  }
];
