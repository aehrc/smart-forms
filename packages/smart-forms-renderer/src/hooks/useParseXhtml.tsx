/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { getXHtmlString } from '../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import type { HTMLReactParserOptions } from 'html-react-parser';
import { attributesToProps, default as htmlParse, domToReact } from 'html-react-parser';
import type { Attributes } from 'html-react-parser/lib/attributes-to-props';

export interface ParsedXhtml {
  content: React.ReactNode;
  styles?: Record<string, string>;
}

export function useParseXhtml(qItem: QuestionnaireItem): ParsedXhtml | null {
  return useMemo(() => {
    const xHtmlString = getXHtmlString(qItem);

    if (xHtmlString === null || xHtmlString === '') {
      return null;
    }

    // Extract global styles from the XHTML
    let extractedStyles: Record<string, string> | undefined;

    const htmlParseOptions = {
      // Limited to work with document.getElementById manipulation only
      replace: (domNode: { attribs: Attributes; name: string; children: any[]; type?: string }) => {
        if (!domNode.attribs) return;

        // Extract CSS styles from style tags
        if (domNode.name === 'style' && domNode.children && domNode.children.length > 0) {
          const styleContent = domNode.children[0].data;
          if (styleContent) {
            // We don't return anything for style tags as they will be applied globally
            return <></>;
          }
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
                if (style.trim()) {
                  const [property, value] = style.split(':');
                  if (property && value) {
                    // Convert kebab-case to camelCase for React
                    const propName = property
                      .trim()
                      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
                    styleObj[propName] = value.trim();
                  }
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
  }, [qItem]);
}
