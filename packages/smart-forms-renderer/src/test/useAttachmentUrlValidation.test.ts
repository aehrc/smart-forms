/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { renderHook } from '@testing-library/react';
import useAttachmentUrlValidation from '../hooks/useAttachmentUrlValidation';

describe('useAttachmentUrlValidation', () => {
  describe('valid URLs', () => {
    it('should validate standard HTTP URLs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('http://example.com'));

      expect(result.current).toBe(true);
    });

    it('should validate standard HTTPS URLs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://example.com'));

      expect(result.current).toBe(true);
    });

    it('should validate URLs with paths', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com/path/to/file.pdf')
      );

      expect(result.current).toBe(true);
    });

    it('should validate URLs with query parameters', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com/search?q=test&sort=date')
      );

      expect(result.current).toBe(true);
    });

    it('should validate URLs with fragments', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com/page#section1')
      );

      expect(result.current).toBe(true);
    });

    it('should validate URLs with ports', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com:8080/api')
      );

      expect(result.current).toBe(true);
    });

    it('should validate FTP URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('ftp://files.example.com/file.zip')
      );

      expect(result.current).toBe(true);
    });

    it('should validate file URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('file:///path/to/local/file.txt')
      );

      expect(result.current).toBe(true);
    });

    it('should validate localhost URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('http://localhost:3000/api/data')
      );

      expect(result.current).toBe(true);
    });

    it('should validate IP address URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('http://192.168.1.1:8080/status')
      );

      expect(result.current).toBe(true);
    });

    it('should validate URLs with subdomains', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://api.example.com/v1/data')
      );

      expect(result.current).toBe(true);
    });

    it('should validate URLs with authentication', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://user:pass@example.com/secure')
      );

      expect(result.current).toBe(true);
    });

    it('should validate data URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('data:text/plain;base64,SGVsbG8gV29ybGQ=')
      );

      expect(result.current).toBe(true);
    });

    it('should validate blob URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('blob:https://example.com/550e8400-e29b-41d4-a716-446655440000')
      );

      expect(result.current).toBe(true);
    });

    it('should validate complex URLs with multiple components', () => {
      const complexUrl =
        'https://user:password@api.example.com:8080/v2/files/download?id=123&format=pdf&token=abc#page=1';
      const { result } = renderHook(() => useAttachmentUrlValidation(complexUrl));

      expect(result.current).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('should reject empty string', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation(''));

      expect(result.current).toBe(false);
    });

    it('should reject URLs without protocol', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('example.com'));

      expect(result.current).toBe(false);
    });

    it('should reject malformed protocols', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('ht tp://example.com'));

      expect(result.current).toBe(false);
    });

    it('should accept URLs with angle brackets (URL constructor encodes them)', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com/<invalid>')
      );

      expect(result.current).toBe(true); // URL constructor automatically encodes angle brackets
    });

    it('should reject incomplete URLs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://'));

      expect(result.current).toBe(false);
    });

    it('should reject URLs with only protocol', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('http://'));

      expect(result.current).toBe(false);
    });

    it('should reject random text', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('not a url at all'));

      expect(result.current).toBe(false);
    });

    it('should reject URLs with spaces', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://example .com'));

      expect(result.current).toBe(false);
    });

    it('should reject URLs with invalid port numbers', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://example.com:99999'));

      expect(result.current).toBe(false);
    });

    it('should accept query parameters with spaces (URL constructor encodes them)', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com?query with spaces')
      );

      expect(result.current).toBe(true); // URL constructor automatically encodes spaces in query
    });

    it('should reject null-like strings', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('null'));

      expect(result.current).toBe(false);
    });

    it('should reject undefined-like strings', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('undefined'));

      expect(result.current).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000);
      const longUrl = `https://example.com/${longPath}`;
      const { result } = renderHook(() => useAttachmentUrlValidation(longUrl));

      expect(result.current).toBe(true);
    });

    it('should handle URLs with international domain names', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://müller.de'));

      expect(result.current).toBe(true);
    });

    it('should handle URLs with encoded characters', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com/path%20with%20spaces')
      );

      expect(result.current).toBe(true);
    });

    it('should handle single character inputs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('a'));

      expect(result.current).toBe(false);
    });

    it('should handle numeric strings', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('12345'));

      expect(result.current).toBe(false);
    });

    it('should handle special characters', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('!@#$%^&*()'));

      expect(result.current).toBe(false);
    });

    it('should handle whitespace-only strings', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('   '));

      expect(result.current).toBe(false);
    });

    it('should handle newline characters', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com\nmalicious.com')
      );

      expect(result.current).toBe(true); // URL constructor accepts and handles newlines
    });

    it('should handle tab characters', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('https://example.com\tpath'));

      expect(result.current).toBe(true); // URL constructor accepts and handles tabs
    });
  });

  describe('protocol-specific validations', () => {
    it('should validate custom protocols', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('myapp://open/document?id=123')
      );

      expect(result.current).toBe(true);
    });

    it('should validate mailto URLs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('mailto:user@example.com'));

      expect(result.current).toBe(true);
    });

    it('should validate tel URLs', () => {
      const { result } = renderHook(() => useAttachmentUrlValidation('tel:+1-555-123-4567'));

      expect(result.current).toBe(true);
    });

    it('should validate websocket URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('ws://example.com:8080/socket')
      );

      expect(result.current).toBe(true);
    });

    it('should validate secure websocket URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('wss://example.com/secure-socket')
      );

      expect(result.current).toBe(true);
    });
  });

  describe('attachment-specific scenarios', () => {
    it('should validate PDF attachment URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://docs.example.com/files/document.pdf')
      );

      expect(result.current).toBe(true);
    });

    it('should validate image attachment URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://images.example.com/photo.jpg')
      );

      expect(result.current).toBe(true);
    });

    it('should validate document attachment URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://storage.example.com/docs/report.docx')
      );

      expect(result.current).toBe(true);
    });

    it('should validate cloud storage URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation('https://drive.google.com/file/d/1234567890/view')
      );

      expect(result.current).toBe(true);
    });

    it('should validate direct download URLs', () => {
      const { result } = renderHook(() =>
        useAttachmentUrlValidation(
          'https://downloads.example.com/files/attachment.zip?download=true'
        )
      );

      expect(result.current).toBe(true);
    });

    it('should validate signed URLs', () => {
      const signedUrl =
        'https://s3.amazonaws.com/bucket/file.pdf?AWSAccessKeyId=AKIAI&Expires=1234567890&Signature=abc123';
      const { result } = renderHook(() => useAttachmentUrlValidation(signedUrl));

      expect(result.current).toBe(true);
    });
  });

  describe('performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const url = 'https://example.com/test';
      const { result: result1 } = renderHook(() => useAttachmentUrlValidation(url));
      const { result: result2 } = renderHook(() => useAttachmentUrlValidation(url));

      expect(result1.current).toBe(result2.current);
      expect(result1.current).toBe(true);
    });

    it('should handle multiple validation calls efficiently', () => {
      const urls = [
        'https://valid.com',
        'invalid-url',
        'https://another-valid.com/path',
        'not-a-url-at-all'
      ];

      const results = urls.map((url) => {
        const { result } = renderHook(() => useAttachmentUrlValidation(url));
        return result.current;
      });

      expect(results).toEqual([true, false, true, false]);
    });

    it('should not have side effects between calls', () => {
      const { result: result1 } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com')
      );
      const { result: result2 } = renderHook(() => useAttachmentUrlValidation('invalid'));
      const { result: result3 } = renderHook(() =>
        useAttachmentUrlValidation('https://example.com')
      );

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(false);
      expect(result3.current).toBe(true);
    });

    it('should handle rapid successive calls', () => {
      const testUrl = 'https://rapid-test.com';
      const results: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        const { result } = renderHook(() => useAttachmentUrlValidation(testUrl));
        results.push(result.current);
      }

      expect(results.every((result) => result === true)).toBe(true);
      expect(results).toHaveLength(100);
    });
  });

  describe('URL constructor error handling', () => {
    it('should gracefully handle URL constructor errors', () => {
      // Test various inputs that would cause URL constructor to throw
      const problematicInputs = ['', ' ', '\\invalid', 'http:// invalid'];

      problematicInputs.forEach((input) => {
        const { result } = renderHook(() => useAttachmentUrlValidation(input));
        expect(result.current).toBe(false);
      });

      // Test some inputs that are actually valid
      const validInputs = [
        'https://[::1]:8080/', // IPv6 is valid when properly formatted
        'ftp://user@host', // This format is valid
        'javascript:alert("xss")' // URL constructor accepts javascript: protocol
      ];

      validInputs.forEach((input) => {
        const { result } = renderHook(() => useAttachmentUrlValidation(input));
        expect(result.current).toBe(true);
      });
    });

    it('should handle URL constructor with all valid inputs', () => {
      const validInputs = [
        'https://example.com',
        'http://localhost',
        'ftp://files.com/file.txt',
        'file:///path/to/file',
        'data:text/plain,hello'
      ];

      validInputs.forEach((input) => {
        const { result } = renderHook(() => useAttachmentUrlValidation(input));
        expect(result.current).toBe(true);
      });
    });
  });
});
