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

/**
 * Headless entrypoint for the SDC engine, published as `@aehrc/smart-forms-renderer/engine`.
 *
 * The package root (`@aehrc/smart-forms-renderer`) is a DOM renderer: importing it pulls in
 * Material UI, Emotion, react-dom, react-markdown and the drag-and-drop libraries. Consumers
 * that only need the form engine cannot use that barrel, so they have been deep-importing
 * internal `lib/...` paths instead.
 *
 * Scope of "headless" here: no DOM and no UI library in the runtime graph, which is what makes
 * the engine usable from a React Native host or a test. It does not mean the package is
 * loadable by Node directly. The build emits `module: ES2020` with extensionless relative
 * specifiers and the package does not set `"type": "module"`, so every entrypoint including
 * this one is bundler-only. That is pre-existing and unchanged here.
 *
 * This entrypoint is the supported alternative. Its contents are the subset of the package's
 * public API that has no DOM or UI-library dependency, plus the vanilla Zustand stores that
 * hold form state. It intentionally re-exports nothing from `src/components`, `src/hooks` or
 * `src/theme`.
 *
 * Two consequences of being headless are worth stating:
 * - Nothing here renders. `buildForm` and the stores drive form state; drawing it is the
 *   host's job.
 * - `RendererConfig` is exported as a type only, because `BuildFormParams` accepts it. Its
 *   values describe DOM layout and have no effect without the DOM renderer.
 */

// Form state stores (vanilla Zustand stores plus their React selector hooks)
export type { QuestionnaireStoreType } from './stores/questionnaireStore';
export { questionnaireStore, useQuestionnaireStore } from './stores/questionnaireStore';

export type { QuestionnaireResponseStoreType } from './stores/questionnaireResponseStore';
export {
  questionnaireResponseStore,
  useQuestionnaireResponseStore
} from './stores/questionnaireResponseStore';

export type { FormUpdateQueueStoreType, UpdateTask } from './stores/formUpdateQueueStore';
export { formUpdateQueueStore, useFormUpdateQueueStore } from './stores/formUpdateQueueStore';

export type { TerminologyServerStoreType } from './stores/terminologyServerStore';
export { terminologyServerStore, useTerminologyServerStore } from './stores/terminologyServerStore';

export type { SmartConfigStoreType } from './stores/smartConfigStore';
export { smartConfigStore, useSmartConfigStore } from './stores/smartConfigStore';

// Type only: `BuildFormParams.rendererConfigOptions` is typed as `RendererConfig`
export type { RendererConfig } from './stores/rendererConfigStore';

// Form lifecycle
export type { BuildFormParams, RepopulateFormParams } from './utils/manageForm';
export {
  buildForm,
  repopulateForm,
  destroyForm,
  getResponse,
  removeEmptyAnswersFromResponse,
  removeInternalIdsFromResponse,
  initialiseFhirClient,
  answerHasValue,
  qrItemHasItemsOrAnswer
} from './utils/manageForm';
export { initialiseQuestionnaireResponse } from './utils/initialise';

// QuestionnaireResponse item construction and traversal
export {
  createEmptyQrItem,
  createEmptyQrGroup,
  updateQrItemsInGroup,
  removeNoAnswerQrItem,
  getQRItemId
} from './utils/qrItem';
export { mapQItemsIndex, getQrItemsIndex } from './utils/mapItem';

// Questionnaire item inspection
export type { CollapsibleType } from './utils/qItem';
export {
  isRepeatItemAndNotCheckbox,
  isCheckbox,
  isHiddenByEnableWhen,
  isItemHidden,
  getGroupCollapsible,
  getXHtmlStringFromQuestionnaire
} from './utils/qItem';
export { isSpecificItemControl, getDecimalPrecision } from './utils/extensions';
export { getQuestionnaireItem, getSectionHeading } from './utils/misc';

// Answer parsing
export { parseDecimalStringToFloat, parseDecimalStringWithPrecision } from './utils/parseInputs';

// Repopulation
export type { ItemToRepopulate } from './utils/repopulateItems';
export { generateItemsToRepopulate } from './utils/repopulateItems';
export { repopulateResponse } from './utils/repopulateIntoResponse';

// Observation-based extraction
export type { Extractable } from './utils/extractObservation';
export {
  extractObservationBased,
  canBeObservationExtracted,
  buildBundleFromObservationArray,
  mapQItemsExtractable,
  createObservation,
  generateUniqueId
} from './utils/extractObservation';
