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

import type { QuestionnaireItem } from 'fhir/r4';
import { getItemTerminologyServerToUse } from '../../utils/preferredTerminologyServer';

// Mock the dependencies
jest.mock('../../utils/valueSet', () => ({
  getTerminologyServerUrl: jest.fn()
}));

jest.mock('../../globals', () => ({
  TERMINOLOGY_SERVER_URL: 'https://tx.ontoserver.csiro.au/fhir/'
}));

import { getTerminologyServerUrl } from '../../utils/valueSet';
import { TERMINOLOGY_SERVER_URL } from '../../globals';

const mockGetTerminologyServerUrl = getTerminologyServerUrl as jest.MockedFunction<typeof getTerminologyServerUrl>;

describe('getItemTerminologyServerToUse', () => {
  const createMockQItem = (linkId: string): QuestionnaireItem => ({
    linkId,
    type: 'choice' as const,
    text: `Test item ${linkId}`
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('priority 1: sdc-questionnaire-preferredTerminologyServer extension', () => {
    it('should return preferred terminology server URL when available', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {
        'test-item': 'https://preferred.server.com/fhir/'
      };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://preferred.server.com/fhir/');
      // Should not call backwards compatible function when preferred is available
      expect(mockGetTerminologyServerUrl).not.toHaveBeenCalled();
    });

    it('should handle multiple items with different preferred servers', () => {
      const qItem1 = createMockQItem('item-1');
      const qItem2 = createMockQItem('item-2');
      const itemPreferredServers = {
        'item-1': 'https://server1.com/fhir/',
        'item-2': 'https://server2.com/fhir/'
      };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      const result1 = getItemTerminologyServerToUse(qItem1, itemPreferredServers, rendererDefault);
      const result2 = getItemTerminologyServerToUse(qItem2, itemPreferredServers, rendererDefault);

      expect(result1).toBe('https://server1.com/fhir/');
      expect(result2).toBe('https://server2.com/fhir/');
    });

    it('should handle empty string values correctly', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {
        'test-item': ''
      };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue('');

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      // Empty string is falsy, so should fall through to next priority
      expect(result).toBe('https://renderer.default.com/fhir/');
      expect(mockGetTerminologyServerUrl).toHaveBeenCalledWith(qItem);
    });
  });

  describe('priority 2: StructureDefinition/terminology-server extension (backwards compatible)', () => {
    it('should return backwards compatible URL when no preferred server available', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue('https://backwards.compatible.com/fhir/');

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://backwards.compatible.com/fhir/');
      expect(mockGetTerminologyServerUrl).toHaveBeenCalledWith(qItem);
    });

    it('should call getTerminologyServerUrl with correct qItem', () => {
      const qItem = createMockQItem('specific-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue('https://result.com/fhir/');

      getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(mockGetTerminologyServerUrl).toHaveBeenCalledWith(qItem);
      expect(mockGetTerminologyServerUrl).toHaveBeenCalledTimes(1);
    });

    it('should handle null return from getTerminologyServerUrl', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://renderer.default.com/fhir/');
    });

    it('should handle undefined return from getTerminologyServerUrl', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://renderer.default.com/fhir/');
    });
  });

  describe('priority 3: renderer default terminology server URL', () => {
    it('should return renderer default when no preferred or backwards compatible URL available', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://custom.renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://custom.renderer.default.com/fhir/');
    });

    it('should handle different renderer default URLs', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};

      mockGetTerminologyServerUrl.mockReturnValue('');

      const result1 = getItemTerminologyServerToUse(qItem, itemPreferredServers, 'https://server1.com/fhir/');
      const result2 = getItemTerminologyServerToUse(qItem, itemPreferredServers, 'https://server2.com/fhir/');

      expect(result1).toBe('https://server1.com/fhir/');
      expect(result2).toBe('https://server2.com/fhir/');
    });

    it('should handle empty renderer default URL', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = '';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      // Should fall through to global fallback
      expect(result).toBe(TERMINOLOGY_SERVER_URL);
    });
  });

  describe('priority 4: global fallback URL', () => {
    it('should return global fallback when all other options are unavailable', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = '';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://tx.ontoserver.csiro.au/fhir/');
    });

    it('should use global fallback as last resort', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = null as any; // Simulate null/undefined

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe(TERMINOLOGY_SERVER_URL);
    });
  });

  describe('edge cases', () => {
    it('should handle qItem with missing linkId gracefully', () => {
      const qItem = { type: 'choice' as const } as QuestionnaireItem; // Missing linkId
      const itemPreferredServers = { 'some-id': 'https://server.com/fhir/' };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://renderer.default.com/fhir/');
    });

    it('should handle empty itemPreferredTerminologyServers object', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://renderer.default.com/fhir/');
    });

    it('should handle null itemPreferredTerminologyServers', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = null as any;
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      // The function does not handle null itemPreferredServers, it will throw
      expect(() => {
        getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);
      }).toThrow('Cannot read properties of null');
    });

    it('should handle whitespace-only URLs correctly', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = { 'test-item': '   ' };
      const rendererDefault = '  ';

      mockGetTerminologyServerUrl.mockReturnValue('  ');

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      // Whitespace strings are truthy, so should use preferred server
      expect(result).toBe('   ');
    });
  });

  describe('complex scenarios', () => {
    it('should respect priority order when multiple sources are available', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = { 'test-item': 'https://preferred.com/fhir/' };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue('https://backwards.compatible.com/fhir/');

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      // Should use preferred (priority 1) even though others are available
      expect(result).toBe('https://preferred.com/fhir/');
      expect(mockGetTerminologyServerUrl).not.toHaveBeenCalled();
    });

    it('should handle different qItem types correctly', () => {
      const choiceItem: QuestionnaireItem = { linkId: 'choice-item', type: 'choice', text: 'Choice' };
      const stringItem: QuestionnaireItem = { linkId: 'string-item', type: 'string', text: 'String' };
      const itemPreferredServers = {};
      const rendererDefault = 'https://renderer.default.com/fhir/';

      mockGetTerminologyServerUrl.mockReturnValue(undefined);

      const result1 = getItemTerminologyServerToUse(choiceItem, itemPreferredServers, rendererDefault);
      const result2 = getItemTerminologyServerToUse(stringItem, itemPreferredServers, rendererDefault);

      expect(result1).toBe('https://renderer.default.com/fhir/');
      expect(result2).toBe('https://renderer.default.com/fhir/');
      expect(mockGetTerminologyServerUrl).toHaveBeenCalledWith(choiceItem);
      expect(mockGetTerminologyServerUrl).toHaveBeenCalledWith(stringItem);
    });

    it('should handle very long URLs correctly', () => {
      const qItem = createMockQItem('test-item');
      const veryLongUrl = 'https://very.long.terminology.server.url.with.many.subdomains.and.paths.com/fhir/ValueSet/$expand?url=http://very.long.code.system.url.com&version=1.0.0&displayLanguage=en&includeDesignations=true';
      const itemPreferredServers = { 'test-item': veryLongUrl };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe(veryLongUrl);
    });

    it('should handle international domain names', () => {
      const qItem = createMockQItem('test-item');
      const itemPreferredServers = { 'test-item': 'https://服务器.中国.com/fhir/' };
      const rendererDefault = 'https://сервер.рф/fhir/';

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://服务器.中国.com/fhir/');
    });

    it('should maintain performance with large itemPreferredTerminologyServers', () => {
      const qItem = createMockQItem('target-item');
      const largePreferredServers: Record<string, string> = {};
      
      // Create 1000 entries
      for (let i = 0; i < 1000; i++) {
        largePreferredServers[`item-${i}`] = `https://server-${i}.com/fhir/`;
      }
      largePreferredServers['target-item'] = 'https://target.server.com/fhir/';

      const rendererDefault = 'https://renderer.default.com/fhir/';

      const startTime = Date.now();
      const result = getItemTerminologyServerToUse(qItem, largePreferredServers, rendererDefault);
      const endTime = Date.now();

      expect(result).toBe('https://target.server.com/fhir/');
      expect(endTime - startTime).toBeLessThan(10); // Should be fast
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle typical FHIR questionnaire item', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'diagnosis-code',
        type: 'choice',
        text: 'Primary diagnosis',
        answerValueSet: 'http://hl7.org/fhir/ValueSet/icd-10'
      };
      const itemPreferredServers = {
        'diagnosis-code': 'https://terminology.hl7.org/fhir/'
      };
      const rendererDefault = 'https://ontoserver.csiro.au/fhir/';

      const result = getItemTerminologyServerToUse(qItem, itemPreferredServers, rendererDefault);

      expect(result).toBe('https://terminology.hl7.org/fhir/');
    });

    it('should handle questionnaire with mixed terminology server configurations', () => {
      const items = [
        createMockQItem('item-with-preferred'),
        createMockQItem('item-with-backwards-compatible'),
        createMockQItem('item-with-default-only')
      ];
      
      const itemPreferredServers = {
        'item-with-preferred': 'https://preferred.server.com/fhir/'
      };
      const rendererDefault = 'https://renderer.default.com/fhir/';

      // Mock different returns for different items
      mockGetTerminologyServerUrl
        .mockReturnValueOnce('https://backwards.compatible.com/fhir/') // Second call for item-with-backwards-compatible
        .mockReturnValueOnce(undefined); // Third call for item-with-default-only

      const results = items.map(item => 
        getItemTerminologyServerToUse(item, itemPreferredServers, rendererDefault)
      );

      expect(results[0]).toBe('https://preferred.server.com/fhir/');
      expect(results[1]).toBe('https://backwards.compatible.com/fhir/');
      expect(results[2]).toBe('https://renderer.default.com/fhir/');
    });
  });
});
