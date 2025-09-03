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

import { processHtmlNarrativeForPrinting } from '../../viewer/utils/print';

// Mock DOMParser and XMLSerializer
global.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: jest.fn()
}));

global.XMLSerializer = jest.fn().mockImplementation(() => ({
  serializeToString: jest.fn()
}));

describe('processHtmlNarrativeForPrinting', () => {
  let mockDoc: {
    querySelectorAll: jest.Mock;
    createElement: jest.Mock;
    documentElement: { querySelector: jest.Mock };
  };
  let mockSection: {
    children: unknown[];
    classList: { add: jest.Mock };
  };
  let mockStyleElement: { textContent: string };
  let mockRootDiv: { insertBefore: jest.Mock; firstChild: Record<string, unknown> };
  let mockParser: { parseFromString: jest.Mock };
  let mockSerializer: { serializeToString: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock style element
    mockStyleElement = {
      textContent: ''
    };

    // Mock section element
    mockSection = {
      children: [],
      classList: {
        add: jest.fn()
      }
    };

    // Mock root div
    mockRootDiv = {
      insertBefore: jest.fn(),
      firstChild: {}
    };

    // Mock document
    mockDoc = {
      querySelectorAll: jest.fn().mockReturnValue([mockSection]),
      createElement: jest.fn().mockReturnValue(mockStyleElement),
      documentElement: {
        querySelector: jest.fn().mockReturnValue(mockRootDiv)
      }
    };

    // Mock parser
    mockParser = {
      parseFromString: jest.fn().mockReturnValue(mockDoc)
    };

    // Mock serializer
    mockSerializer = {
      serializeToString: jest.fn().mockReturnValue('<processed-html></processed-html>')
    };

    (global.DOMParser as jest.Mock).mockReturnValue(mockParser);
    (global.XMLSerializer as jest.Mock).mockReturnValue(mockSerializer);
  });

  it('processes HTML with h2 heading and adds h2-section class', () => {
    const mockH2Element = { tagName: 'H2' };
    mockSection.children = [mockH2Element];

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h2>Test</h2></section></div>';
    const result = processHtmlNarrativeForPrinting(htmlString);

    expect(mockParser.parseFromString).toHaveBeenCalledWith(htmlString, 'application/xhtml+xml');
    expect(mockDoc.querySelectorAll).toHaveBeenCalledWith('section');
    expect(mockSection.classList.add).toHaveBeenCalledWith('h2-section');
    expect(mockDoc.createElement).toHaveBeenCalledWith('style');
    expect(mockStyleElement.textContent).toContain('@media print');
    expect(mockRootDiv.insertBefore).toHaveBeenCalledWith(mockStyleElement, mockRootDiv.firstChild);
    expect(mockSerializer.serializeToString).toHaveBeenCalledWith(mockDoc);
    expect(result).toBe('<processed-html></processed-html>');
  });

  it('processes HTML with h3 heading and adds h3-section class', () => {
    const mockH3Element = { tagName: 'H3' };
    mockSection.children = [mockH3Element];

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h3>Test</h3></section></div>';
    processHtmlNarrativeForPrinting(htmlString);

    expect(mockSection.classList.add).toHaveBeenCalledWith('h3-section');
  });

  it('processes HTML with h4 heading and adds h4-section class', () => {
    const mockH4Element = { tagName: 'H4' };
    mockSection.children = [mockH4Element];

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h4>Test</h4></section></div>';
    processHtmlNarrativeForPrinting(htmlString);

    expect(mockSection.classList.add).toHaveBeenCalledWith('h4-section');
  });

  it('handles section without heading elements', () => {
    const mockDivElement = { tagName: 'DIV' };
    mockSection.children = [mockDivElement];

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><div>No heading</div></section></div>';
    processHtmlNarrativeForPrinting(htmlString);

    expect(mockSection.classList.add).not.toHaveBeenCalled();
  });

  it('handles multiple sections with different headings', () => {
    const mockSection2 = {
      children: [{ tagName: 'H3' }],
      classList: { add: jest.fn() }
    };
    const mockSection3 = {
      children: [{ tagName: 'H4' }],
      classList: { add: jest.fn() }
    };

    mockDoc.querySelectorAll.mockReturnValue([mockSection, mockSection2, mockSection3]);
    mockSection.children = [{ tagName: 'H2' }];

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h2>Test</h2></section><section><h3>Test</h3></section><section><h4>Test</h4></section></div>';
    processHtmlNarrativeForPrinting(htmlString);

    expect(mockSection.classList.add).toHaveBeenCalledWith('h2-section');
    expect(mockSection2.classList.add).toHaveBeenCalledWith('h3-section');
    expect(mockSection3.classList.add).toHaveBeenCalledWith('h4-section');
  });

  it('handles case where root div is not found', () => {
    mockDoc.documentElement.querySelector.mockReturnValue(null);

    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h2>Test</h2></section></div>';
    const result = processHtmlNarrativeForPrinting(htmlString);

    expect(mockRootDiv.insertBefore).not.toHaveBeenCalled();
    expect(result).toBe('<processed-html></processed-html>');
  });

  it('adds proper CSS print styles', () => {
    const htmlString =
      '<div xmlns="http://www.w3.org/1999/xhtml"><section><h2>Test</h2></section></div>';
    processHtmlNarrativeForPrinting(htmlString);

    expect(mockStyleElement.textContent).toContain('.h2-section,');
    expect(mockStyleElement.textContent).toContain('.h3-section,');
    expect(mockStyleElement.textContent).toContain('.h4-section');
    expect(mockStyleElement.textContent).toContain('break-inside: avoid;');
    expect(mockStyleElement.textContent).toContain('page-break-inside: avoid;');
    expect(mockStyleElement.textContent).toContain('h4 {');
    expect(mockStyleElement.textContent).toContain('break-after: avoid;');
  });
});
