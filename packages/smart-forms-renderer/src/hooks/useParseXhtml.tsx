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

import React, { useMemo } from 'react';
import { getXHtmlStringFromExtension } from '../utils/extensions';
import type { Element } from 'fhir/r4';
import type { HTMLReactParserOptions } from 'html-react-parser';
import { attributesToProps, default as htmlParse, domToReact } from 'html-react-parser';
import type { Attributes } from 'html-react-parser/lib/attributes-to-props';

export interface ParsedXhtml {
  content: React.ReactNode;
  styles?: Record<string, string>;
}

export function useParseXhtml(
  element: Element | undefined,
  text: string | null | undefined
): ParsedXhtml | null {
  return useMemo(() => {
    let xHtmlString = getXHtmlStringFromExtension(element?.extension || []);

    if (xHtmlString === null || xHtmlString === '') {
      return null;
    }

    // Replace <img with alt text - only if there are no alt tags
    if (!xHtmlString.includes('alt=') && !xHtmlString.includes('alt =')) {
      const altText = `<img alt='${text}'`;
      xHtmlString = xHtmlString.replace('<img', altText);
    }

    // Extract global styles from the XHTML
    let extractedStyles: Record<string, string> | undefined;

    const htmlParseOptions = {
      // Limited to work with document.getElementById manipulation only
      replace: (domNode: { attribs: Attributes; name: string; children: any[]; type?: string }) => {
        if (!domNode.attribs) return;

        // Extract external CSS styles from class attributes
        // To use this, define your stylesheet where you are calling <BaseRenderer/> in your app
        if (domNode.name === 'div' && domNode.attribs.class) {
          const classNames = domNode.attribs.class.split(/\s+/);
          classNames.forEach((className) => {
            const classStyles = getStylesFromClass(className);
            if (classStyles) {
              extractedStyles = { ...extractedStyles, ...classStyles };
            }
          });
        }

        // Extract styles from the root div for group-level styling
        if (
          domNode.name === 'div' &&
          !domNode.attribs.class &&
          Object.keys(domNode.attribs).length > 0
        ) {
          if (domNode.attribs.style) {
            try {
              // Convert style string to object
              const styleObj: Record<string, string> = {};
              const styleStr = domNode.attribs.style;
              styleStr.split(';').forEach((style) => {
                // Skip empty styles
                if (!style.trim()) {
                  return;
                }

                // Split property and value
                const [property, value] = style.split(':').map((s) => s.trim());

                // Only keep if both property and value exist
                if (property && value) {
                  const propName = convertKebabToCamelCase(property);
                  styleObj[propName] = value;
                }
              });

              // Store styles to be applied to parent container
              extractedStyles = styleObj;
            } catch (error) {
              console.error('Error parsing style', error);
            }
          }
        }

        if (domNode.attribs) {
          if (domNode.name === 'button') {
            // Extract the onclick attribute
            const { onclick } = domNode.attribs;

            let clickHandler;
            if (onclick) {
              clickHandler = () => {
                try {
                  // Check if it starts with 'document.getElementById' and safely execute it
                  if (onclick.trim().startsWith('document.getElementById')) {
                    const fn = new Function(onclick);
                    fn();
                  } else {
                    console.warn('Unhandled onclick:', onclick);
                  }
                } catch (error) {
                  console.error('Error executing onclick:', error);
                }
              };
            }
            delete domNode.attribs.onclick;

            return (
              <button
                {...attributesToProps(domNode.attribs)}
                onClick={clickHandler || (() => console.log('No specific handler defined'))}>
                {domToReact(domNode.children, htmlParseOptions as HTMLReactParserOptions)}
              </button>
            );
          }
        }
      }
    };

    const parsedContent = htmlParse(xHtmlString, htmlParseOptions as HTMLReactParserOptions);

    return {
      content: parsedContent,
      styles: extractedStyles
    };
  }, [element, text]);
}

export function getStylesFromClass(className: string): Record<string, string> | null {
  if (!className) {
    return null;
  }

  const selector = className.startsWith('.') ? className : `.${className}`;

  for (const sheet of document.styleSheets) {
    // Skip stylesheets that are not on the same origin, as they may cause CORS issues - we also don't want to show warnings every time the user performs an action in the form
    if (sheet.href) {
      const sheetURL = new URL(sheet.href);
      if (sheetURL.hostname !== location.hostname) {
        continue;
      }
    }

    try {
      const rules = sheet.cssRules;
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
          const computedStyles: Record<string, string> = {};
          const style = rule.style;

          for (let i = 0; i < style.length; i++) {
            const property = style[i];

            // Convert propertyName from kebab-case to camelCase for React
            const propNameCamelCase = convertKebabToCamelCase(property);

            computedStyles[propNameCamelCase] = style.getPropertyValue(property);
          }

          return computedStyles;
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'SecurityError') {
        console.warn(
          `Unable to access stylesheet due to CORS restrictions: Skipping sheet ${sheet.href}. Add crossorigin="anonymous" to the stylesheet link if you want to bypass this warning.`,
          sheet.href
        );
        continue;
      }

      console.warn(`Error accessing stylesheet ${sheet.href}`, error);
    }
  }

  return null;
}

// Convert kebab-case to camelCase for React
export function convertKebabToCamelCase(property: string): string {
  return property.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
