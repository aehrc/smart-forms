/// <reference types="jest" />

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

import type { RendererStrings } from '../i18n/rendererStrings';
import {
  bundledRendererStrings,
  defaultRendererStrings,
  interpolate,
  resolveRendererStrings
} from '../i18n/rendererStrings';

// Every RendererStrings key must be listed here. Typed as Record<keyof RendererStrings, true>, so
// adding a key to the interface fails to compile until it is added, keeping the guard exhaustive.
const validRendererStringKeys: Record<keyof RendererStrings, true> = {
  booleanYesLabel: true,
  booleanNoLabel: true,
  dateFormat: true,
  dateSeparatorError: true,
  dateFullFormatError: true,
  dateMonthOrFullFormatError: true,
  dateInvalidError: true,
  dateUnrecognizedError: true,
  validationUnknownIssue: true,
  fieldRequired: true,
  regexMismatchWithExpression: true,
  regexMismatch: true,
  minLengthWithLimit: true,
  minLengthFallback: true,
  maxLengthWithLimit: true,
  maxLengthFallback: true,
  maxDecimalPlacesWithLimit: true,
  maxDecimalPlacesFallback: true,
  minValueWithLimit: true,
  minValueFallback: true,
  maxValueWithLimit: true,
  maxValueFallback: true,
  minQuantityWithLimit: true,
  minQuantityFallback: true,
  maxQuantityWithLimit: true,
  maxQuantityFallback: true,
  dateTimeDateRequired: true,
  terminologyMinCharacters: true,
  terminologyError: true,
  terminologyNoResults: true,
  optionsUnavailable: true,
  optionsFetchError: true,
  fetchingResults: true,
  unableToLoadForm: true,
  somethingWentWrong: true,
  terminologyServerFetchError: true,
  clear: true,
  removeItem: true,
  nextPage: true,
  previousPage: true,
  attachFile: true,
  removeFile: true,
  pickDate: true,
  syncSuccessful: true,
  syncWithServer: true,
  syncFailed: true,
  dragRow: true,
  formSections: true,
  mandatoryField: true,
  selectRow: true,
  selectAllRows: true,
  unnamedItem: true,
  unnamedAttachment: true,
  unnamedNestedItem: true,
  unnamedOpenLabel: true,
  unnamedRadioGroup: true,
  unnamedCheckbox: true,
  unnamedCheckboxList: true,
  unnamedChoiceDropdown: true,
  unnamedGroup: true,
  unnamedTimeField: true,
  unnamedSlider: true,
  pageAriaLabel: true,
  unnamedPage: true
};

describe('bundled locale catalogs (JSON)', () => {
  it('only use known RendererStrings keys (guards against typos in the JSON files)', () => {
    const allowedKeys = Object.keys(validRendererStringKeys);
    for (const [locale, catalog] of Object.entries(bundledRendererStrings)) {
      for (const key of Object.keys(catalog)) {
        expect({ locale, key, allowed: allowedKeys.includes(key) }).toEqual({
          locale,
          key,
          allowed: true
        });
      }
    }
  });
});

describe('placeholder consistency across locales', () => {
  const extractPlaceholders = (value: string): string[] =>
    [...value.matchAll(/\{(\w+)\}/g)].map((groups) => groups[1]).sort();

  it('every localized template keeps the same placeholders as its English default', () => {
    for (const [locale, catalog] of Object.entries(bundledRendererStrings)) {
      for (const [key, value] of Object.entries(catalog)) {
        const defaultValue = defaultRendererStrings[key as keyof RendererStrings];
        if (typeof defaultValue !== 'string' || typeof value !== 'string') {
          continue;
        }
        expect({ locale, key, placeholders: extractPlaceholders(value) }).toEqual({
          locale,
          key,
          placeholders: extractPlaceholders(defaultValue)
        });
      }
    }
  });
});

describe('interpolate', () => {
  it('replaces placeholders with the given params', () => {
    expect(interpolate('Format {format}.', { format: 'DD.MM.YYYY' })).toBe('Format DD.MM.YYYY.');
    expect(
      interpolate('{monthYearFormat} or {format}', {
        monthYearFormat: 'MM.YYYY',
        format: 'DD.MM.YYYY'
      })
    ).toBe('MM.YYYY or DD.MM.YYYY');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(interpolate('Hello {name}', {})).toBe('Hello {name}');
  });
});

describe('localized date validation messages', () => {
  it('provides German error messages for de-CH', () => {
    const strings = resolveRendererStrings('de-CH');
    expect(strings.dateInvalidError).toBe('Die Eingabe ist kein gültiges Datum.');
    expect(interpolate(strings.dateFullFormatError, { format: 'DD.MM.YYYY' })).toBe(
      'Die Eingabe entspricht nicht dem Format DD.MM.YYYY.'
    );
  });

  it('falls back to English messages for unknown locales', () => {
    expect(resolveRendererStrings('xx').dateInvalidError).toBe(
      defaultRendererStrings.dateInvalidError
    );
  });
});

describe('resolveRendererStrings', () => {
  it('returns English defaults when no locale or overrides are provided', () => {
    expect(resolveRendererStrings()).toEqual(defaultRendererStrings);
    expect(resolveRendererStrings().booleanYesLabel).toBe('Yes');
    expect(resolveRendererStrings().booleanNoLabel).toBe('No');
  });

  it('selects a bundled catalog by exact locale tag', () => {
    const strings = resolveRendererStrings('de-CH');
    expect(strings.booleanYesLabel).toBe('Ja');
    expect(strings.booleanNoLabel).toBe('Nein');
  });

  it.each([
    ['de-CH', 'Ja', 'Nein'],
    ['fr-CH', 'Oui', 'Non'],
    ['it-CH', 'Sì', 'No']
  ])('resolves the bundled Swiss catalog for %s', (locale, yes, no) => {
    const strings = resolveRendererStrings(locale);
    expect(strings.booleanYesLabel).toBe(yes);
    expect(strings.booleanNoLabel).toBe(no);
  });

  it('does not borrow a region-specific catalog for a different region', () => {
    // Only 'de-CH' is bundled (no generic 'de'), so 'de-DE' must not inherit
    // Swiss-German spelling and should fall back to English defaults.
    expect(resolveRendererStrings('de-DE')).toEqual(defaultRendererStrings);
  });

  it('falls back to English defaults for unknown locales', () => {
    expect(resolveRendererStrings('fr-FR')).toEqual(defaultRendererStrings);
  });

  it('applies overrides with the highest precedence', () => {
    const strings = resolveRendererStrings('de-CH', { booleanYesLabel: 'Oui' });
    expect(strings.booleanYesLabel).toBe('Oui'); // override wins
    expect(strings.booleanNoLabel).toBe('Nein'); // locale catalog still applies
  });

  it('allows overrides without a locale', () => {
    const strings = resolveRendererStrings(undefined, { booleanNoLabel: 'Non' });
    expect(strings.booleanYesLabel).toBe('Yes'); // English default
    expect(strings.booleanNoLabel).toBe('Non'); // override
  });

  it('does not mutate the default catalog', () => {
    resolveRendererStrings('de-CH', { booleanYesLabel: 'Oui' });
    expect(defaultRendererStrings.booleanYesLabel).toBe('Yes');
    expect(defaultRendererStrings.booleanNoLabel).toBe('No');
  });
});
