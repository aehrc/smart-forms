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

import { calculateColumnWidths } from './columnWidth';

describe('calculateColumnWidths', () => {
  it('all columns as percentages', () => {
    const columnWidths = ['25%', '25%', '25%', '25%'];
    const result = calculateColumnWidths(columnWidths, 1000);
    expect(result.map((r) => r.width)).toEqual(['25%', '25%', '25%', '25%']);
  });

  it('one column as px, rest unset', () => {
    const columnWidths = [undefined, '400px', undefined];
    const result = calculateColumnWidths(columnWidths, 1000);
    // 1000 - 400 = 600, split between 2 unset columns
    expect(result[0].width).toBe('300px');
    expect(result[1].width).toBe('400px');
    expect(result[2].width).toBe('300px');
  });

  it('one column as %, rest unset', () => {
    const columnWidths = [undefined, '70%', undefined];
    const result = calculateColumnWidths(columnWidths, 1000);
    // 70% = 700px, 300px left for 2 columns
    expect(result[0].width).toBe('150px');
    expect(result[1].width).toBe('70%');
    expect(result[2].width).toBe('150px');
  });

  it('mixed px and % columns', () => {
    const columnWidths = [undefined, '400px', '20%', undefined];
    const result = calculateColumnWidths(columnWidths, 1200);
    // 400px + 20% of 1200 = 400px + 240px = 640px, 560px left for 2 unset
    expect(result[0].width).toBe('280px');
    expect(result[1].width).toBe('400px');
    expect(result[2].width).toBe('20%');
    expect(result[3].width).toBe('280px');
  });

  it('all columns px, sum < table width', () => {
    const columnWidths = ['200px', '300px'];
    const result = calculateColumnWidths(columnWidths, 700);
    expect(result[0].width).toBe('200px');
    expect(result[1].width).toBe('300px');
  });

  it('all columns px, sum > table width (overflow)', () => {
    const columnWidths = ['500px', '600px'];
    const result = calculateColumnWidths(columnWidths, 1000);
    expect(result[0].width).toBe('500px');
    expect(result[1].width).toBe('600px');
  });

  it('handles empty columns', () => {
    const columnWidths = [undefined, undefined];
    const result = calculateColumnWidths(columnWidths, 1000);
    expect(result[0].width).toBe('500px');
    expect(result[1].width).toBe('500px');
  });
});
