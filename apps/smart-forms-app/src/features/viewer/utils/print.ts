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
 * Parses an XHTML narrative string, enhances it for print by:
 * - Adding section classes like `.h2-section`, `.h3-section`, etc. based on the first heading tag.
 * - Injecting CSS print rules to prevent page breaks inside sections.
 *
 * @param htmlString - XHTML string to be processed.
 * @returns Processed XHTML string with added classes and print styles.
 */
export function processHtmlNarrativeForPrinting(htmlString: string): string {
  // Parse the HTML string into a DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'application/xhtml+xml');

  const sections = doc.querySelectorAll('section');

  // Insert h{1-6}-section class names based on the heading found in each section
  sections.forEach((section) => {
    const firstElement = Array.from(section.children).find((child) =>
      /^H[1-6]$/i.test(child.tagName)
    );

    if (firstElement) {
      const headingLevel = firstElement.tagName.toLowerCase(); // e.g., 'h3'
      section.classList.add(`${headingLevel}-section`);
    }
  });

  // Add print-specific styles to avoid breaking inside section containers
  const style = doc.createElement('style');
  style.textContent = `
    @media print {
        /* Prevent content from breaking inside these section containers. 
           These classes should wrap around content grouped by heading level 
           (e.g. each h2 + its related content inside a .h2-section) */
        .h2-section,
        .h3-section,
        .h4-section {
            break-inside: avoid;        /* CSS fragmentation model: avoid breaking inside this container */
            page-break-inside: avoid;   /* Older syntax for the same purpose (for better browser support) */
        }

        /* For h4 headings, avoid page break immediately after them */
        h4 {
            break-after: avoid;
        }

        /* For h3 headings, avoid breaks right after, and allow them to begin on a new page if needed */
        h3 {
            break-after: avoid;
            break-before: auto;
        }

        /* For h2 headings, apply same logic: avoid breaking right after, allow break before if needed */
        h2 {
            break-after: avoid;
            break-before: auto;
        }
    }
  `;

  const rootDiv = doc.documentElement.querySelector('div[xmlns="http://www.w3.org/1999/xhtml"]');
  if (rootDiv) {
    rootDiv.insertBefore(style, rootDiv.firstChild);
  }

  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}
