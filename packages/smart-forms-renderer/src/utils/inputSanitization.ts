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

/**
 * List of dangerous patterns that should be blocked from text inputs to prevent XSS and code injection attacks
 * See https://github.com/aehrc/smart-forms/issues/1533.
 */
const DANGEROUS_PATTERNS = [
  // The below is handled by filterXSS
  /<script/i,
  /<SCRIPT/,
  /<body/i,
  /<BODY/,
  /<style/i,
  /<STYLE/,

  // Style tags and attributes
  /style\s*=/i,
  /STYLE\s*=/,

  // CSS references
  /\.css/i,

  // JavaScript protocol and keywords
  /javascript:/i,

  // Event handlers
  /onload/i,
  /onmouseover/i,
  /onerror/i,
  /onclick/i,
  /onsubmit/i,
  /onfocus/i,
  /onblur/i,
  /onchange/i,
  /onkeydown/i,
  /onkeyup/i,
  /onkeypress/i,
  /onmousedown/i,
  /onmouseup/i,
  /onmousemove/i,

  // Alert and other dangerous functions
  /alert\(/i,
  /confirm\(/i,
  /prompt\(/i,
  /eval\(/i,
  /setTimeout\(/i,
  /setInterval\(/i,

  // HTML encoded characters that could be used for bypassing
  /%3C/i, // <
  /&lt/i, // <
  /&LT/, // <
  /\\x3C/i, // <

  /%3E/i, // >
  /&gt/i, // >
  /&GT/i, // >
  /\\x3E/i, // >

  /\\u003[ce]/i, // blocks \u003c or \u003e, but not literal "<" or ">"
  /&#/i // all HTML entities e.g. &#x3C; for < (This might result in false positives, make it less strict if needed)
] as const;

/**
 * Sanitizes text input using a dangerous patterns list to prevent XSS and code injection attacks.
 */
export function sanitizeInput(input: string): string {
  if (input === '') {
    return input;
  }

  // Pre-neutralize dangerous patterns
  let sanitizedInput = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitizedInput = sanitizedInput.replace(pattern, '');
  }

  return sanitizedInput;
}
