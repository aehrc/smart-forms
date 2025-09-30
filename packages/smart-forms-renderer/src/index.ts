// Import self-host typography Inter font
import '@fontsource/inter';
import * as testUtils from './stories/testUtils';

export { testUtils };
// interface exports
export type {
  Tab,
  Tabs,
  Variables,
  VariableXFhirQuery,
  LaunchContext,
  CalculatedExpression,
  QItemOverrideComponentProps,
  SdcUiOverrideComponentProps
} from './interfaces';

// component exports
export type { SmartFormsRendererProps } from './components';
export {
  SmartFormsRenderer,
  BaseRenderer,
  SingleItem,
  GroupItem,
  RepeatItem,
  RepeatGroup,
  GroupTable,
  GridGroup,
  parseFhirDateToDisplayDate,
  parseFhirDateTimeToDisplayDateTime,
  ItemFieldGrid,
  ItemLabel,
  BooleanField,
  DecimalField,
  StringField,
  ChoiceRadioSingle,
  FullWidthFormComponentBox
} from './components';

// state management store exports
export type {
  QuestionnaireStoreType,
  QuestionnaireResponseStoreType,
  SmartConfigStoreType,
  TerminologyServerStoreType,
  RendererStyling,
  RendererStylingStoreType
} from './stores';
export {
  questionnaireStore,
  useQuestionnaireStore,
  questionnaireResponseStore,
  useQuestionnaireResponseStore,
  smartConfigStore,
  useSmartConfigStore,
  terminologyServerStore,
  useTerminologyServerStore,
  rendererStylingStore,
  useRendererStylingStore
} from './stores';

// hooks exports
export type { UseResponsiveProps } from './hooks';
export {
  useHidden,
  useReadOnly,
  useBuildForm,
  useRendererQueryClient,
  useRenderingExtensions,
  useValidationFeedback,
  useValueSetCodings,
  useStringCalculatedExpression,
  useDisplayCqfAndCalculatedExpression,
  useCodingCalculatedExpression,
  objectIsCoding,
  useResponsive
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
  createEmptyQrGroup,
  updateQrItemsInGroup,
  mapQItemsIndex,
  getQrItemsIndex,
  isSpecificItemControl,
  getDecimalPrecision,
  isRepeatItemAndNotCheckbox,
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision,
  isHiddenByEnableWhen,
  initialiseQuestionnaireResponse,
  generateItemsToRepopulate,
  repopulateResponse,
  extractObservationBased,
  canBeObservationExtracted,
  buildBundleFromObservationArray,
  getQuestionnaireItem,
  getSectionHeading
} from './utils';

// theme provider exports
export {
  RendererThemeProvider,
  rendererThemeComponentOverrides,
  accordionOverride,
  autocompleteOverride,
  buttonOverride,
  cardOverride,
  inputOverride,
  paperOverride,
  speedDialOverride,
  tableOverride,
  rendererThemeOptions
} from './theme';

// wrapper exports - only for smartforms.csiro.au/standalone use
export type { InitialiseFormWrapperProps } from './stories/storybookWrappers';
export { InitialiseFormWrapperForStorybook } from './stories/storybookWrappers';
