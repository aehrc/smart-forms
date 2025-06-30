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

export {
  buildForm,
  destroyForm,
  getResponse,
  removeEmptyAnswersFromResponse,
  removeInternalIdsFromResponse
} from './manageForm';
export { initialiseQuestionnaireResponse } from './initialise';
export { createEmptyQrItem, createEmptyQrGroup, updateQrItemsInGroup } from './qrItem';
export { mapQItemsIndex, getQrItemsIndex } from './mapItem';

export { isSpecificItemControl, getDecimalPrecision } from './itemControl';
export { isRepeatItemAndNotCheckbox, isHiddenByEnableWhen } from './qItem';
export { parseDecimalStringToFloat, parseDecimalStringWithPrecision } from './parseInputs';
export type { ItemToRepopulate } from './repopulateItems';
export { generateItemsToRepopulate } from './repopulateItems';
export { repopulateResponse } from './repopulateIntoResponse';
export {
  extractObservationBased,
  canBeObservationExtracted,
  buildBundleFromObservationArray
} from './extractObservation';

export { getQuestionnaireItem, getSectionHeading } from './misc';
