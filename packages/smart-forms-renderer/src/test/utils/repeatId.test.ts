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

import { generateNewRepeatId, generateExistingRepeatId } from '../../utils/repeatId';

// Mock nanoid to make tests deterministic
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-nanoid-123')
}));

describe('repeatId', () => {
  describe('generateNewRepeatId', () => {
    it('should generate a new repeat ID with linkId and nanoid', () => {
      const linkId = 'test-question';
      const result = generateNewRepeatId(linkId);
      
      expect(result).toBe('test-question-repeat-mock-nanoid-123');
    });

    it('should include the provided linkId in the result', () => {
      const linkId = 'patient-info';
      const result = generateNewRepeatId(linkId);
      
      expect(result).toContain(linkId);
      expect(result).toMatch(/^patient-info-repeat-/);
    });

    it('should handle empty linkId', () => {
      const result = generateNewRepeatId('');
      
      expect(result).toBe('-repeat-mock-nanoid-123');
    });

    it('should handle linkId with special characters', () => {
      const linkId = 'section.1_item-2';
      const result = generateNewRepeatId(linkId);
      
      expect(result).toBe('section.1_item-2-repeat-mock-nanoid-123');
    });

    it('should generate unique IDs for different linkIds', () => {
      const id1 = generateNewRepeatId('linkId1');
      const id2 = generateNewRepeatId('linkId2');
      
      expect(id1).not.toBe(id2);
      expect(id1).toContain('linkId1');
      expect(id2).toContain('linkId2');
    });
  });

  describe('generateExistingRepeatId', () => {
    it('should generate a repeat ID with zero-padded index', () => {
      const linkId = 'test-question';
      const index = 5;
      const result = generateExistingRepeatId(linkId, index);
      
      expect(result).toBe('test-question-repeat-000005');
    });

    it('should pad index to 6 digits', () => {
      const linkId = 'question';
      
      expect(generateExistingRepeatId(linkId, 0)).toBe('question-repeat-000000');
      expect(generateExistingRepeatId(linkId, 1)).toBe('question-repeat-000001');
      expect(generateExistingRepeatId(linkId, 42)).toBe('question-repeat-000042');
      expect(generateExistingRepeatId(linkId, 999)).toBe('question-repeat-000999');
      expect(generateExistingRepeatId(linkId, 123456)).toBe('question-repeat-123456');
    });

    it('should handle large index numbers', () => {
      const linkId = 'question';
      const largeIndex = 9999999;
      const result = generateExistingRepeatId(linkId, largeIndex);
      
      expect(result).toBe('question-repeat-9999999');
      expect(result).toContain(largeIndex.toString());
    });

    it('should handle index 0', () => {
      const linkId = 'first-question';
      const result = generateExistingRepeatId(linkId, 0);
      
      expect(result).toBe('first-question-repeat-000000');
    });

    it('should handle empty linkId', () => {
      const result = generateExistingRepeatId('', 123);
      
      expect(result).toBe('-repeat-000123');
    });

    it('should handle linkId with special characters', () => {
      const linkId = 'section.1_item-2';
      const result = generateExistingRepeatId(linkId, 42);
      
      expect(result).toBe('section.1_item-2-repeat-000042');
    });

    it('should generate consistent IDs for same inputs', () => {
      const linkId = 'test';
      const index = 100;
      
      const id1 = generateExistingRepeatId(linkId, index);
      const id2 = generateExistingRepeatId(linkId, index);
      
      expect(id1).toBe(id2);
      expect(id1).toBe('test-repeat-000100');
    });
  });

  describe('function differences', () => {
    it('should generate different formats for new vs existing IDs', () => {
      const linkId = 'test-question';
      
      const newId = generateNewRepeatId(linkId);
      const existingId = generateExistingRepeatId(linkId, 1);
      
      expect(newId).not.toBe(existingId);
      expect(newId).toMatch(/test-question-repeat-[a-zA-Z0-9_-]+/);
      expect(existingId).toMatch(/test-question-repeat-\d{6}/);
    });

    it('should both include the linkId and repeat prefix', () => {
      const linkId = 'common-question';
      
      const newId = generateNewRepeatId(linkId);
      const existingId = generateExistingRepeatId(linkId, 1);
      
      expect(newId).toContain(`${linkId}-repeat-`);
      expect(existingId).toContain(`${linkId}-repeat-`);
    });
  });
});
