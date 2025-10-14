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

import { sanitizeInput } from '../utils/inputSanitization';

describe('sanitizeInput', () => {
  it('should return input as-is when it is a plain safe string', () => {
    expect(sanitizeInput('hello world')).toBe('hello world');
    expect(sanitizeInput('123456')).toBe('123456');
  });

  // See https://github.com/aehrc/smart-forms/issues/1533
  describe('should sanitize dangerous HTML/script patterns', () => {
    const dangerousInputs = [
      '<script>',
      '<SCRIPT>',
      '<body>',
      '<BODY>',
      '<style>',
      '<STYLE>',
      'STYLE=',
      '.css',
      // 'javascript' - Handled in separate test
      'onload',
      'onmouseover',
      'onerror',
      // 'alert'  - Handled in separate test
      '%3C', // URL encoded <
      '&lt', // HTML entity
      '&LT',
      '&#',
      '\\x3c', // hex escape for "<"
      '\\x3C', // hex escape for "<"
      '\\x3e', // hex escape for ">"
      '\\x3E', // hex escape for ">"
      '\\u003c', // unicode escape for "<"
      '\\u003C', // unicode escape for "<"
      '\\u003e', // unicode escape for ">"
      '\\u003E' // unicode escape for ">"
    ];

    dangerousInputs.forEach((input) => {
      it(`should sanitize "${input}"`, () => {
        const sanitized = sanitizeInput(input);
        // Should never be identical to original if dangerous
        expect(sanitized).not.toEqual(input);
        // Should not contain raw angle brackets or script tags
        expect(sanitized.toLowerCase()).not.toContain('<script');
        expect(sanitized.toLowerCase()).not.toContain('<style');
        expect(sanitized.toLowerCase()).not.toContain('<body');
      });
    });
  });

  it('should strip entire script/style blocks', () => {
    const input = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  it('should strip event handler attributes', () => {
    const input = '<img src=x onerror=alert(1) />';
    const sanitized = sanitizeInput(input);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert');
  });

  describe('should sanitize dangerous javascript URLs', () => {
    const dangerousJsInputs = ['javascript:alert(1)', 'JAVASCRIPT:doSomething()'];

    dangerousJsInputs.forEach((input) => {
      it(`should sanitize "${input}"`, () => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toEqual(input);
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
      });
    });
  });

  describe('should allow safe javascript/alert text', () => {
    const safeInputs = [
      'javascript',
      'alert',
      'javascript is my fav programming language',
      'Please click alert box'
    ];

    safeInputs.forEach((input) => {
      it(`should allow "${input}"`, () => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toEqual(input);
      });
    });
  });

  describe('should not produce false positives', () => {
    const falsePositiveInputs = [
      'I love javascript and typescript', // contains "javascript" safely
      'alert me when ready', // contains "alert" safely
      'Patient is alert (responds to stimuli)', // contains "alert" with brackets safely
      'The system will prompt you for details', // contains "prompt" safely
      'Prompt (the user) to enter their name', // contains "prompt" with brackets safely
      'Evaluate the results carefully', // contains "eval" safely
      'Eval (the data) before submission', // contains "eval" with brackets safely
      'This is a css file reference in text', // literal "css"
      'Medical script', // contains "script" safely
      'His body temperature is critically high', // contains "body" safely
      'Your style is cool', // literal "style" but not HTML
      '5 < 10', // comparison operator <
      '10 > 5', // comparison operator >
      '5 < 10 and 10 > 5' // comparison operators combined
    ];

    falsePositiveInputs.forEach((input) => {
      it(`should allow safe text "${input}"`, () => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toEqual(input);
      });
    });
  });
});
