// Import self-host typography Inter font
import '@fontsource/inter';

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
  RendererConfig,
  RendererConfigStoreType
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
  rendererConfigStore,
  useRendererConfigStore
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
  useDisplayCqfAndCalculatedExpression,
  useResponsive
} from './hooks';

// utils exports
export type { ItemToRepopulate, BuildFormParams, RepopulateFormParams } from './utils';
export {
  buildForm,
  repopulateForm,
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
