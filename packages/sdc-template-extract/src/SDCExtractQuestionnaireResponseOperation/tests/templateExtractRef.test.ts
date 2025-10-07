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

import type { Extension, QuestionnaireItem } from 'fhir/r4';
import { hasTemplateExtractRefExtension } from '../utils/templateExtractRef';

const TEMPLATE_EXTRACT_EXTENSION_URL =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract';

function buildExtension(slices: Extension[]): Extension {
  return {
    url: TEMPLATE_EXTRACT_EXTENSION_URL,
    extension: slices
  };
}

describe('hasTemplateExtractRefExtension', () => {
  it('returns null if no extension is present', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      text: 'Question',
      type: 'string'
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result).toEqual({ templateExtractRef: null });
  });

  it('returns null if extension is present but not the templateExtract one', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      text: 'Question',
      type: 'string',
      extension: [{ url: 'http://example.com/other-extension', valueString: 'foo' }]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result).toEqual({ templateExtractRef: null });
  });

  it('returns a valid templateExtractRef when template slice is present with valid reference', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          {
            url: 'template',
            valueReference: { reference: '#contained-template' }
          }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef).toEqual({
      templateId: 'contained-template'
    });
    expect(result.warning).toBeUndefined();
  });

  it('returns a warning if template reference does not start with #', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          {
            url: 'template',
            valueReference: { reference: 'Questionnaire/template-123' }
          }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef).toBeNull();
    expect(result.warning?.details?.text).toMatch(/ missing required "template"/);
  });

  it('returns a warning if template slice is missing', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [buildExtension([{ url: 'fullUrl', valueString: 'http://example.com/resource' }])]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef).toBeNull();
    expect(result.warning?.details?.text).toMatch(/missing required "template"/);
  });

  it('returns a warning if template slice appears more than once', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          { url: 'template', valueReference: { reference: '#id1' } },
          { url: 'template', valueReference: { reference: '#id2' } }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef).toEqual({ templateId: 'id1' });
    expect(result.warning?.details?.text).toMatch(/template" must appear exactly once/);
  });

  it('returns a warning if a slice is duplicated (0..1 cardinality)', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          { url: 'template', valueReference: { reference: '#valid' } },
          { url: 'fullUrl', valueString: 'http://a.com' },
          { url: 'fullUrl', valueString: 'http://b.com' }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef?.templateId).toBe('valid');
    expect(result.warning?.details?.text).toMatch(/fullUrl" must not appear more than once/);
  });

  it('returns a warning if a slice has nested extensions', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          {
            url: 'template',
            valueReference: { reference: '#valid' },
            extension: [{ url: 'inner', valueString: 'bad' }]
          }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.templateExtractRef?.templateId).toBe('valid');
    expect(result.warning?.details?.text).toMatch(/must not have nested extensions/);
  });

  it('handles all slice types correctly (with resourceId)', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          { url: 'template', valueReference: { reference: '#x' } },
          { url: 'fullUrl', valueString: 'url' },
          { url: 'resourceId', valueString: 'res' },
          { url: 'ifNoneMatch', valueString: 'etag' },
          { url: 'ifModifiedSince', valueString: 'date' },
          { url: 'ifMatch', valueString: 'match' },
          { url: 'ifNoneExist', valueString: 'condition' }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.warning).toBeUndefined();
    expect(result.templateExtractRef).toEqual({
      templateId: 'x',
      fullUrl: 'url',
      resourceId: 'res',
      ifNoneMatch: 'etag',
      ifModifiedSince: 'date',
      ifMatch: 'match',
      ifNoneExist: 'condition'
    });
  });

  it('handles all slice types correctly (with patchRequestUrl)', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        buildExtension([
          { url: 'template', valueReference: { reference: '#x' } },
          { url: 'fullUrl', valueString: 'url' },
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl',
            valueString: 'Observation/res'
          },
          { url: 'ifNoneMatch', valueString: 'etag' },
          { url: 'ifModifiedSince', valueString: 'date' },
          { url: 'ifMatch', valueString: 'match' },
          { url: 'ifNoneExist', valueString: 'condition' }
        ])
      ]
    };

    const result = hasTemplateExtractRefExtension(item);
    expect(result.warning).toBeUndefined();
    expect(result.templateExtractRef).toEqual({
      templateId: 'x',
      fullUrl: 'url',
      patchRequestUrl: 'Observation/res',
      ifNoneMatch: 'etag',
      ifModifiedSince: 'date',
      ifMatch: 'match',
      ifNoneExist: 'condition'
    });
  });
});
