// interface exports
export type {
  Tab,
  Tabs,
  Variables,
  VariableXFhirQuery,
  LaunchContext,
  CustomComponentProps
} from './interfaces';

// component exports
export type { SmartFormsRendererProps } from './components';
export {
  SmartFormsRenderer,
  BaseRenderer,
  SingleItem,
  RepeatItem,
  RepeatGroup,
  GroupTable,
  GridGroup,
  parseFhirDateToDisplayDate,
  ItemFieldGrid,
  StringField,
  FullWidthFormComponentBox
} from './components';

// state management store exports
export type {
  QuestionnaireStoreType,
  QuestionnaireResponseStoreType,
  SmartConfigStoreType,
  TerminologyServerStoreType
} from './stores';
export {
  questionnaireStore,
  useQuestionnaireStore,
  questionnaireResponseStore,
  useQuestionnaireResponseStore,
  smartConfigStore,
  useSmartConfigStore,
  terminologyServerStore,
  useTerminologyServerStore
} from './stores';

// hooks exports
export {
  useHidden,
  useReadOnly,
  useBuildForm,
  useRendererQueryClient,
  useRenderingExtensions,
  useValidationFeedback,
  useStringCalculatedExpression
} from './hooks';

// utils exports
export type { ItemToRepopulate } from './utils';
export {
  buildForm,
  destroyForm,
  getResponse,
  removeEmptyAnswersFromResponse,
  removeInternalIdsFromResponse,
  createEmptyQrItem,
  isSpecificItemControl,
  isRepeatItemAndNotCheckbox,
  initialiseQuestionnaireResponse,
  generateItemsToRepopulate,
  repopulateResponse,
  extractObservationBased
} from './utils';

// theme provider exports
export { RendererThemeProvider } from './theme';

// wrapper exports - only for smartforms.csiro.au/standalone use
export type { InitialiseFormWrapperProps } from './stories/storybookWrappers';
export { InitialiseFormWrapperForStorybook } from './stories/storybookWrappers';
