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

import { getAttachmentAnswer, getFileSize, readAttachmentFile } from '../../utils/fileUtils';

describe('fileUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFileSize', () => {
    it('should return KB format for small files (less than 7 characters)', () => {
      expect(getFileSize('1024')).toBe('1kb');
      expect(getFileSize('2048')).toBe('2kb');
      expect(getFileSize('5120')).toBe('5kb');
    });

    it('should return KB format for 6-character strings', () => {
      expect(getFileSize('123456')).toBe('121kb'); // 123456 / 1024 ≈ 120.56 → 121
    });

    it('should return MB format for large files (7 or more characters)', () => {
      expect(getFileSize('1024000')).toBe('1MB'); // (1024000 / 1024) / 1000 = 1
      expect(getFileSize('2048000')).toBe('2MB'); // (2048000 / 1024) / 1000 = 2
    });

    it('should handle edge case at boundary (exactly 7 characters)', () => {
      expect(getFileSize('1000000')).toBe('0.977MB'); // Actual calculation: (1000000 / 1024) / 1000 ≈ 0.9765625 → rounds to 0.977
    });

    it('should round KB values correctly', () => {
      expect(getFileSize('1500')).toBe('1kb'); // 1500 / 1024 ≈ 1.46 → 1
      expect(getFileSize('1600')).toBe('2kb'); // 1600 / 1024 ≈ 1.56 → 2
    });

    it('should handle very small files', () => {
      expect(getFileSize('100')).toBe('0kb'); // 100 / 1024 ≈ 0.098 → 0
      expect(getFileSize('500')).toBe('0kb'); // 500 / 1024 ≈ 0.488 → 0
    });

    it('should handle zero size', () => {
      expect(getFileSize('0')).toBe('0kb');
    });

    it('should handle single character strings', () => {
      expect(getFileSize('5')).toBe('0kb');
    });

    it('should handle empty string', () => {
      expect(getFileSize('')).toBe('0kb'); // '' converts to 0
    });

    it('should handle large file sizes correctly', () => {
      expect(getFileSize('10240000')).toBe('10MB'); // (10240000 / 1024) / 1000 = 10
    });

    it('should handle decimal precision for MB', () => {
      expect(getFileSize('1536000')).toBe('1.5MB'); // (1536000 / 1024) / 1000 = 1.5
    });
  });

  describe('readAttachmentFile', () => {
    const base64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const dataUrl = `data:image/png;base64,${base64}`;

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: dataUrl,
      onload: null as any,
      onerror: null as any
    };

    beforeEach(() => {
      mockFileReader.result = dataUrl;
      global.FileReader = jest.fn(() => mockFileReader) as any;
    });

    const createMockFile = (
      name: string,
      size: number,
      type: string,
      content: string = 'test content'
    ): File => {
      const file = new File([content], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('returns the content type, base64 data and size of a file it reads', async () => {
      const file = createMockFile('test.png', 1024, 'image/png');

      const promise = readAttachmentFile(file);
      mockFileReader.onload();

      await expect(promise).resolves.toEqual({
        contentType: 'image/png',
        data: base64,
        size: 1024
      });
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });

    it('returns only the base64 data when the content type contains a comma', async () => {
      const file = createMockFile('test.txt', 6, 'text/plain;x="a,b"');
      mockFileReader.result = 'data:text/plain;x="a,b";base64,cmVwb3J0';

      const promise = readAttachmentFile(file);
      mockFileReader.onload();

      await expect(promise).resolves.toMatchObject({ data: 'cmVwb3J0' });
    });

    it('keeps the size of a zero-size file', async () => {
      const file = createMockFile('empty.txt', 0, 'text/plain', '');

      const promise = readAttachmentFile(file);
      mockFileReader.onload();

      await expect(promise).resolves.toMatchObject({ size: 0 });
    });

    it.each(['', '   '])(
      'rejects the blank content type %p without reading the file',
      async (contentType) => {
        const file = createMockFile('unknown', 1024, contentType);

        await expect(readAttachmentFile(file)).resolves.toEqual({
          error: 'attachmentTypeUnknown'
        });
        expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
      }
    );

    it('returns a read error when FileReader reports an error', async () => {
      const file = createMockFile('test.jpg', 1024, 'image/jpeg');

      const promise = readAttachmentFile(file);
      mockFileReader.onerror();

      await expect(promise).resolves.toEqual({ error: 'attachmentReadError' });
    });

    it('returns a read error when FileReader throws', async () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      global.FileReader = jest.fn(() => {
        throw new Error('FileReader constructor error');
      }) as any;

      await expect(readAttachmentFile(file)).resolves.toEqual({
        error: 'attachmentReadError'
      });
    });
  });

  describe('getAttachmentAnswer', () => {
    const fileFields = { contentType: 'text/plain', data: 'UmVwb3J0', size: 6 };

    it.each(['', '   ', undefined])(
      'returns null when there is no file data and the URL is %p',
      (url) => {
        expect(getAttachmentAnswer({ url, title: 'Report' })).toBeNull();
      }
    );

    it('returns a URL-only answer with its title', () => {
      expect(getAttachmentAnswer({ url: 'http://example.com', title: 'Report' })).toEqual({
        url: 'http://example.com',
        title: 'Report'
      });
    });

    it('combines file data with the URL and title', () => {
      expect(
        getAttachmentAnswer({ ...fileFields, url: 'http://example.com', title: 'Report' })
      ).toEqual({ ...fileFields, url: 'http://example.com', title: 'Report' });
    });

    it('returns file data without a URL or title when both are empty', () => {
      expect(getAttachmentAnswer({ ...fileFields, url: '   ', title: '' })).toEqual(fileFields);
    });

    it('trims the URL', () => {
      expect(getAttachmentAnswer({ url: ' http://example.com ' })).toEqual({
        url: 'http://example.com'
      });
    });

    it('keeps other attachment fields such as the hash', () => {
      const hash = '7kXDAya3UDh1iXUsD3Xh3Yfdx+Q=';
      expect(getAttachmentAnswer({ url: 'http://example.com', hash })).toEqual({
        url: 'http://example.com',
        hash
      });
    });
  });
});
