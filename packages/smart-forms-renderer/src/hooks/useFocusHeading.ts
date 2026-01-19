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

import { useCallback } from 'react';

/**
 * Hook to focus on a heading or other suitable element within a container.
 * This helps maintain scroll position by creating a focus anchor point.
 */
export function useFocusHeading() {
  return useCallback((containerId: string) => {
    // Wait 100ms for MUI expansion animation to settle
    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.log('[useFocusHeading] Container not found:', containerId);
        return;
      }

      // Try to find a suitable focus target in priority order:
      // 1. Standard headings (h1-h6)
      let target: HTMLElement | null = container.querySelector('h1, h2, h3, h4, h5, h6');

      // 2. Elements with role="heading"
      if (!target) {
        target = container.querySelector('[role="heading"]');
      }

      // 3. MUI AccordionSummary content
      if (!target) {
        target = container.querySelector('.MuiAccordionSummary-content');
      }

      // 4. Any element with tabindex="0"
      if (!target) {
        target = container.querySelector('[tabindex="0"]');
      }

      // 5. Fallback to the first child
      if (!target && container.firstElementChild) {
        target = container.firstElementChild as HTMLElement;
      }

      if (!target) {
        console.log('[useFocusHeading] No focusable target found in container:', containerId);
        return;
      }

      // Ensure the element is focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      console.log('[useFocusHeading] Focusing target:', target.tagName, target.className);

      // Focus the element to anchor the scroll position
      target.focus({ preventScroll: true });
    }, 100);
  }, []);
}
