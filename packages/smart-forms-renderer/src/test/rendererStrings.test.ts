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

import {
  defaultRendererStrings,
  interpolate,
  resolveRendererStrings
} from '../i18n/rendererStrings';

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

describe('resolveRendererStrings', () => {
  it('returns English defaults when no overrides are provided', () => {
    expect(resolveRendererStrings()).toEqual(defaultRendererStrings);
    expect(resolveRendererStrings().booleanYesLabel).toBe('Yes');
    expect(resolveRendererStrings().booleanNoLabel).toBe('No');
  });

  it('merges a consumer-supplied partial catalog on top of the English defaults', () => {
    // The renderer bundles no translations; a consuming app injects its own catalog like this.
    const strings = resolveRendererStrings({ booleanYesLabel: 'Ja', booleanNoLabel: 'Nein' });
    expect(strings.booleanYesLabel).toBe('Ja');
    expect(strings.booleanNoLabel).toBe('Nein');
    expect(strings.fieldRequired).toBe(defaultRendererStrings.fieldRequired); // untouched keys fall back
  });

  it('interpolates placeholders in injected templates', () => {
    const strings = resolveRendererStrings({
      dateFullFormatError: 'Die Eingabe entspricht nicht dem Format {format}.'
    });
    expect(interpolate(strings.dateFullFormatError, { format: 'DD.MM.YYYY' })).toBe(
      'Die Eingabe entspricht nicht dem Format DD.MM.YYYY.'
    );
  });

  it('does not mutate the default catalog', () => {
    resolveRendererStrings({ booleanYesLabel: 'Oui' });
    expect(defaultRendererStrings.booleanYesLabel).toBe('Yes');
    expect(defaultRendererStrings.booleanNoLabel).toBe('No');
  });
});
