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
 * RendererStrings is the catalog of user-facing strings that the renderer itself
 * provides (the renderer "chrome"), as opposed to text that comes from the
 * Questionnaire resource (e.g. `item.text`, `answerOption.display`).
 *
 * The catalog is intentionally flat so that partial overrides can be merged with
 * a simple shallow spread (see {@link resolveRendererStrings}). Every entry must
 * have an English default in {@link defaultRendererStrings}.
 *
 * To localise the renderer, pass a `rendererStrings` partial catalog in the
 * renderer config (e.g. `buildForm({ rendererConfigOptions: { rendererStrings } })`).
 * The renderer does not bundle any translations; consuming apps own their
 * translation files (e.g. per-locale JSON) and inject them here. The `locale`
 * config option does not select strings — it only drives date formatting and
 * calendar localisation.
 *
 * @author Smart Forms
 */
export interface RendererStrings {
  /** Label for the "true" option of a boolean item. */
  booleanYesLabel: string;
  /** Label for the "false" option of a boolean item. */
  booleanNoLabel: string;
  /** Date validation error when the input uses a different separator than the format. Supports `{separator}`. */
  dateSeparatorError: string;
  /** Date validation error when the input does not match the full date format. Supports `{format}`. */
  dateFullFormatError: string;
  /** Date validation error when the input matches neither the month-year nor the full date format. Supports `{monthYearFormat}` and `{format}`. */
  dateMonthOrFullFormatError: string;
  /** Date validation error when the input is well-formed but not a valid calendar date. */
  dateInvalidError: string;
  /** Date validation error when the input matches no supported date format. */
  dateUnrecognizedError: string;

  /** Fallback validation error when an input is invalid but no specific issue is available. */
  validationUnknownIssue: string;
  /** Validation error when a required field is empty (fallback if no custom required text is provided). */
  fieldRequired: string;
  /** Validation error when input fails a regex, including the pattern. Supports `{regex}`. */
  regexMismatchWithExpression: string;
  /** Validation error when input fails a regex (no pattern available). */
  regexMismatch: string;
  /** Validation error when input is shorter than the minimum length. Supports `{minLength}`. */
  minLengthWithLimit: string;
  /** Validation error when input is shorter than the minimum length (no limit available). */
  minLengthFallback: string;
  /** Validation error when input is longer than the maximum length. Supports `{maxLength}`. */
  maxLengthWithLimit: string;
  /** Validation error when input is longer than the maximum length (no limit available). */
  maxLengthFallback: string;
  /** Validation error when a number has too many decimal places. Supports `{maxDecimalPlaces}`. */
  maxDecimalPlacesWithLimit: string;
  /** Validation error when a number has too many decimal places (no limit available). */
  maxDecimalPlacesFallback: string;
  /** Validation error when a value is below the minimum. Supports `{minValue}`. */
  minValueWithLimit: string;
  /** Validation error when a value is below the minimum (no limit available). */
  minValueFallback: string;
  /** Validation error when a value is above the maximum. Supports `{maxValue}`. */
  maxValueWithLimit: string;
  /** Validation error when a value is above the maximum (no limit available). */
  maxValueFallback: string;
  /** Validation error when a quantity is below the minimum. Supports `{minQuantityValue}`. */
  minQuantityWithLimit: string;
  /** Validation error when a quantity is below the minimum (no limit available). */
  minQuantityFallback: string;
  /** Validation error when a quantity is above the maximum. Supports `{maxQuantityValue}`. */
  maxQuantityWithLimit: string;
  /** Validation error when a quantity is above the maximum (no limit available). */
  maxQuantityFallback: string;
  /** Validation error shown for a date/time item when the time is set but the date is empty. */
  dateTimeDateRequired: string;

  /** Terminology autocomplete hint shown when fewer than 2 characters have been typed. */
  terminologyMinCharacters: string;
  /** Terminology autocomplete message shown when the value set query fails. */
  terminologyError: string;
  /** Terminology autocomplete message shown when the query returns no results. */
  terminologyNoResults: string;

  /** Shown when a choice/open-choice field has no options to display. */
  optionsUnavailable: string;
  /** Shown when a field's options cannot be resolved from the questionnaire or launch context. */
  optionsFetchError: string;
  /** Autocomplete loading text while options are being fetched. */
  fetchingResults: string;
  /** Fallback shown when a form body fails to load. */
  unableToLoadForm: string;
  /** Fallback shown when an unsupported group item is encountered. */
  somethingWentWrong: string;
  /** Shown when the terminology server errors while expanding a value set. Supports `{valueSet}`. */
  terminologyServerFetchError: string;

  /** Clear-input button label/tooltip. */
  clear: string;
  /** Remove-item button label/tooltip (repeats and table rows). */
  removeItem: string;
  /** Next-page navigation button label. */
  nextPage: string;
  /** Previous-page navigation button label. */
  previousPage: string;
  /** Attach-file button label/tooltip. */
  attachFile: string;
  /** Remove-file button tooltip. */
  removeFile: string;
  /** Date-picker calendar button label. */
  pickDate: string;
  /** Repopulate button tooltip after a successful sync. */
  syncSuccessful: string;
  /** Repopulate button tooltip prompting a sync with the server. */
  syncWithServer: string;
  /** Repopulate button tooltip shown when syncing an item fails. Supports `{item}`. */
  syncFailed: string;
  /** Drag-handle label for reordering table rows. */
  dragRow: string;
  /** Accessible label for the tab list navigation landmark. */
  formSections: string;
  /** Screen-reader-only text marking a required field (rendered next to the asterisk). */
  mandatoryField: string;
  /** Accessible label for a table row select control. Supports `{label}`. */
  selectRow: string;
  /** Accessible label for a table select-all control. Supports `{label}`. */
  selectAllRows: string;
  /** Fallback accessible label for an item with no text, by item type. Supports `{type}`. */
  unnamedItem: string;
  /** Fallback accessible label for an attachment field with no text. */
  unnamedAttachment: string;
  /** Fallback accessible label for a group with nested items and no text. */
  unnamedNestedItem: string;
  /** Fallback accessible label for an open-label field with no text. */
  unnamedOpenLabel: string;
  /** Fallback accessible label for a radio group with no text. */
  unnamedRadioGroup: string;
  /** Fallback accessible label for a checkbox with no text. */
  unnamedCheckbox: string;
  /** Fallback accessible label for a checkbox list with no text. */
  unnamedCheckboxList: string;
  /** Fallback accessible label for a choice dropdown with no text. */
  unnamedChoiceDropdown: string;
  /** Fallback accessible label for a group with no text. */
  unnamedGroup: string;
  /** Fallback accessible label for a time field with no text. */
  unnamedTimeField: string;
  /** Fallback accessible label for a slider with no text. */
  unnamedSlider: string;
  /** Accessible label for a page region. Supports `{label}`. */
  pageAriaLabel: string;
  /** Fallback accessible label for a page with no text. */
  unnamedPage: string;
  /**
   * Optional override for the full-date input/display format, as a dayjs format string
   * (e.g. `'DD.MM.YYYY'`).
   *
   * When omitted, the format is derived from the active `locale` using dayjs' locale data
   * (e.g. `de-CH` -> `DD.MM.YYYY`), falling back to `'DD/MM/YYYY'` when no locale is set.
   * Set this only to force a specific format regardless of locale.
   *
   * The format must use `DD`, `MM` and `YYYY` tokens joined by a single separator character.
   * The shorter month-year (`MM<sep>YYYY`) and year (`YYYY`) formats and the input-validation
   * separator are derived from it.
   */
  dateFormat?: string;
}

/**
 * Default (English) renderer strings. Acts as the base that every locale and
 * override is merged on top of, so it must contain a value for every key.
 */
export const defaultRendererStrings: RendererStrings = {
  booleanYesLabel: 'Yes',
  booleanNoLabel: 'No',
  dateSeparatorError:
    'Input does not match the required format with "{separator}" as the separator.',
  dateFullFormatError: 'Input does not match the format {format}.',
  dateMonthOrFullFormatError: 'Input does not match the formats {monthYearFormat} or {format}.',
  dateInvalidError: 'Input is an invalid date.',
  dateUnrecognizedError: 'Input does not match any date format.',
  validationUnknownIssue:
    'Input is invalid but no specific issues are found. Please report this at https://github.com/aehrc/smart-forms/issues.',
  fieldRequired: 'This field is required.',
  regexMismatchWithExpression: 'Input should match the specified regex: {regex}',
  regexMismatch: 'Input should match the specified regex.',
  minLengthWithLimit: 'Enter at least {minLength} characters.',
  minLengthFallback: 'Input is below the minimum character limit.',
  maxLengthWithLimit: 'Enter no more than {maxLength} characters.',
  maxLengthFallback: 'Input is above the maximum character limit.',
  maxDecimalPlacesWithLimit: 'Enter a number with no more than {maxDecimalPlaces} decimal places.',
  maxDecimalPlacesFallback: 'Input has too many decimal places.',
  minValueWithLimit: 'Enter a value greater than or equal to {minValue}.',
  minValueFallback: 'Input is less than the minimum value allowed.',
  maxValueWithLimit: 'Enter a value less than or equal to {maxValue}.',
  maxValueFallback: 'Input exceeds the maximum value allowed.',
  minQuantityWithLimit: 'Enter a quantity greater than or equal to {minQuantityValue}.',
  minQuantityFallback: 'Input is less than the minimum quantity allowed.',
  maxQuantityWithLimit: 'Enter a quantity less than or equal to {maxQuantityValue}.',
  maxQuantityFallback: 'Input exceeds the maximum quantity allowed.',
  dateTimeDateRequired: 'Date is required',
  terminologyMinCharacters: 'Enter at least 2 characters to search for results.',
  terminologyError: 'An error occurred. Try again later or try searching for a different term.',
  terminologyNoResults: "We couldn't seem to find anything. Try searching for a different term.",
  optionsUnavailable: 'No options available.',
  optionsFetchError: 'Unable to fetch options from the questionnaire or launch context',
  fetchingResults: 'Fetching results...',
  unableToLoadForm: 'Unable to load form',
  somethingWentWrong: 'Something went wrong here',
  terminologyServerFetchError:
    'There was an error fetching options from the terminology server for {valueSet}',
  clear: 'Clear',
  removeItem: 'Remove item',
  nextPage: 'Next page',
  previousPage: 'Previous page',
  attachFile: 'Attach file',
  removeFile: 'Remove file',
  pickDate: 'Pick a date',
  syncSuccessful: 'Sync successful',
  syncWithServer: 'Sync with server',
  syncFailed: 'Unable to sync item "{item}".',
  dragRow: 'Drag row',
  formSections: 'Form sections',
  mandatoryField: 'Mandatory field',
  selectRow: 'Select row {label}',
  selectAllRows: 'Select all rows in {label}',
  unnamedItem: 'Unnamed {type} item',
  unnamedAttachment: 'Unnamed attachment field',
  unnamedNestedItem: 'Unnamed item with nested items',
  unnamedOpenLabel: 'Unnamed open label field',
  unnamedRadioGroup: 'Unnamed radio group',
  unnamedCheckbox: 'Unnamed checkbox',
  unnamedCheckboxList: 'Unnamed checkbox list',
  unnamedChoiceDropdown: 'Unnamed choice dropdown',
  unnamedGroup: 'Unnamed group',
  unnamedTimeField: 'Unnamed time field',
  unnamedSlider: 'Unnamed slider',
  pageAriaLabel: '{label} page',
  unnamedPage: 'Unnamed page'
  // dateFormat is intentionally omitted; it is derived from the active locale (see resolveDateFormat).
};

/**
 * Resolve the effective renderer strings for the given consumer-supplied
 * partial catalog.
 *
 * Missing keys fall back to the English defaults ({@link defaultRendererStrings}),
 * so this never throws. The renderer bundles no translations — consuming apps own
 * their translation files and pass them in via the renderer config `rendererStrings`
 * option (see `buildForm({ rendererConfigOptions: { rendererStrings } })`).
 *
 * @param overrides - Consumer-supplied strings that take precedence over the English defaults.
 */
export function resolveRendererStrings(overrides?: Partial<RendererStrings>): RendererStrings {
  return {
    ...defaultRendererStrings,
    ...overrides
  };
}

/**
 * Replaces `{token}` placeholders in a renderer string template with the given parameters.
 * Unknown placeholders are left untouched. For example
 * `interpolate('Format {format}.', { format: 'DD.MM.YYYY' })` -> `'Format DD.MM.YYYY.'`.
 */
export function interpolate(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? params[key] : match));
}
