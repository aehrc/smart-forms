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

import QCvdRisk2023 from '../data/resources/CVD-Risk-2023.json';
import QTestAssembled715 from '../data/resources/TestAssembled715.json';
import QAboriginalTorresStraitIslanderHealthCheckAssembled from '../data/resources/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import type { Questionnaire } from 'fhir/r4';

/**
 * FOR TESTING ONLY
 * Loads local questionnaires and returns them as an array of questionnaires
 *
 * To add local questionnaires to list:
 * 1. Move questionnaire file to src/data/resources
 * 2. Import file at the beginning of this file
 *    i.e. import QNew from '../data/resources/NewQuestionnaire.json';
 *
 * 3. Add imported questionnaire in localFiles array below
 *    i.e. return [
 *            Q715,
 *            QAssembled,
 *            QCvdCheck,
 *            QNew
 *         ] as Questionnaire[];
 *
 * @author Sean Fong
 */
export function loadQuestionnairesFromLocal() {
  return [
    QCvdRisk2023,
    QTestAssembled715,
    QAboriginalTorresStraitIslanderHealthCheckAssembled
  ] as Questionnaire[];
}
