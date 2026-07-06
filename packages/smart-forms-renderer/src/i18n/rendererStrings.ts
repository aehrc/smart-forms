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

// Bundled locale catalogs are authored as standard JSON translation files (translator-tool
// friendly). Their values are type-checked against RendererStrings via the bundledRendererStrings
// Record type below; a unit test additionally guards against unknown keys (typos).
import deCHRendererStrings from './locales/de-CH.json';
import frCHRendererStrings from './locales/fr-CH.json';
import itCHRendererStrings from './locales/it-CH.json';

/**
 * RendererStrings is the catalog of user-facing strings that the renderer itself
 * provides (the renderer "chrome"), as opposed to text that comes from the
 * Questionnaire resource (e.g. `item.text`, `answerOption.display`).
 *
 * The catalog is intentionally flat so that partial overrides can be merged with
 * a simple shallow spread (see {@link resolveRendererStrings}). Every entry must
 * have an English default in {@link defaultRendererStrings}.
 *
 * To localise the renderer, either:
 * - pass a known `locale` in the renderer config to select a bundled catalog
 *   (e.g. `'de-CH'`), and/or
 * - pass a `rendererStrings` partial override to replace individual strings.
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
  dateSeparatorError: 'Input does not match the required format with "{separator}" as the separator.',
  dateFullFormatError: 'Input does not match the format {format}.',
  dateMonthOrFullFormatError: 'Input does not match the formats {monthYearFormat} or {format}.',
  dateInvalidError: 'Input is an invalid date.',
  dateUnrecognizedError: 'Input does not match any date format.'
  // dateFormat is intentionally omitted; it is derived from the active locale (see resolveDateFormat).
};

/**
 * Bundled renderer string catalogs keyed by BCP-47 locale tag.
 * Consumers can select one of these via the renderer config `locale` option.
 *
 * Each non-default locale lives in its own file under `./locales`; register new
 * locales by importing the partial and adding an entry here.
 */
export const bundledRendererStrings: Record<string, Partial<RendererStrings>> = {
  'en': defaultRendererStrings,
  'de-CH': deCHRendererStrings,
  'fr-CH': frCHRendererStrings,
  'it-CH': itCHRendererStrings
};

/**
 * Resolve the effective renderer strings for a given locale and optional
 * per-string overrides.
 *
 * Resolution order (later wins):
 * 1. English defaults ({@link defaultRendererStrings})
 * 2. Bundled catalog for `locale`, if one exists (exact match, then the base
 *    language sub-tag, e.g. `de-CH` falls back to `de`)
 * 3. Explicit `overrides`
 *
 * Unknown locales simply fall back to the English defaults, so this never throws.
 *
 * @param locale - BCP-47 locale tag, e.g. `'de-CH'`. Optional.
 * @param overrides - Per-string overrides that take precedence over the catalog.
 */
export function resolveRendererStrings(
  locale?: string,
  overrides?: Partial<RendererStrings>
): RendererStrings {
  const localeCatalog = locale ? lookupBundledCatalog(locale) : undefined;

  return {
    ...defaultRendererStrings,
    ...localeCatalog,
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

function lookupBundledCatalog(locale: string): Partial<RendererStrings> | undefined {
  if (bundledRendererStrings[locale]) {
    return bundledRendererStrings[locale];
  }

  // Fall back from a region-specific tag (e.g. `de-CH`) to its base language (`de`)
  const baseLanguage = locale.split('-')[0];
  return bundledRendererStrings[baseLanguage];
}
