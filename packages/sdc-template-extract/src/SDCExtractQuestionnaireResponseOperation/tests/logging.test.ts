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

import type {
  TemplateExtractPath,
  TemplateExtractPathJsObject
} from '../interfaces/templateExtractPath.interface';
import {
  logTemplateExtractPathMapFull,
  logTemplateExtractPathMapJsObjectFull,
  logTemplateExtractPathMapJsObjectResults,
  logTemplateExtractPathMapResults
} from '../utils';

describe('Template extract logging functions', () => {
  const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  const mockTable = jest.spyOn(console, 'table').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockMap = new Map<string, TemplateExtractPath>([
    [
      'Patient.name[0]',
      {
        contextPathTuple: ['Patient.name[0].extension[0]', "item.where(linkId = 'name')"],
        valuePathMap: new Map([
          [
            'Patient.name[0]._text.extension[0]',
            {
              valueExpression: "item.where(linkId='given').answer.value.join(' ')",
              valueResult: ['Jane']
            }
          ]
        ])
      }
    ]
  ]);

  const mockObjectMap: Record<string, TemplateExtractPathJsObject> = {
    'Patient.name[0]': {
      contextPathTuple: ['Patient.name[0].extension[0]', "item.where(linkId = 'name')"],
      valuePathMap: {
        'Patient.name[0]._text.extension[0]': {
          valueExpression: "item.where(linkId='given').answer.value.join(' ')",
          valueResult: ['Jane']
        }
      }
    }
  };

  it('logTemplateExtractPathMapFull logs full table from Map', () => {
    logTemplateExtractPathMapFull('TestTemplate', mockMap);
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('📋 Contexts and values for template: TestTemplate')
    );
    expect(mockTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entryPath: 'Patient.name[0]',
          contextPath: 'Patient.name[0].extension[0]',
          contextExpression: "item.where(linkId = 'name')",
          valuePath: 'Patient.name[0]._text.extension[0]',
          valueExpression: "item.where(linkId='given').answer.value.join(' ')",
          valueResult: ['Jane']
        })
      ])
    );
  });

  it('logTemplateExtractPathMapJsObjectFull logs full table from JS object', () => {
    logTemplateExtractPathMapJsObjectFull('TestTemplate', mockObjectMap);
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('📋 Contexts and values for template: TestTemplate')
    );
    expect(mockTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entryPath: 'Patient.name[0]',
          contextPath: 'Patient.name[0].extension[0]',
          contextExpression: "item.where(linkId = 'name')",
          valuePath: 'Patient.name[0]._text.extension[0]',
          valueExpression: "item.where(linkId='given').answer.value.join(' ')",
          valueResult: ['Jane']
        })
      ])
    );
  });

  it('logTemplateExtractPathMapResults logs value-only table from Map', () => {
    logTemplateExtractPathMapResults('TestTemplate', mockMap);
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('🔹Context and value results for: TestTemplate')
    );
    expect(mockTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entryPath: 'Patient.name[0]',
          valueResult: ['Jane']
        })
      ])
    );
  });

  it('logTemplateExtractPathMapJsObjectResults logs value-only table from JS object', () => {
    logTemplateExtractPathMapJsObjectResults('TestTemplate', mockObjectMap);
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('🔹Context and value results for: TestTemplate')
    );
    expect(mockTable).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          entryPath: 'Patient.name[0]',
          valueResult: ['Jane']
        })
      ])
    );
  });
});
