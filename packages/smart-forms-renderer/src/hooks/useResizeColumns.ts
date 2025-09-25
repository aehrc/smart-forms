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

import { useLayoutEffect } from 'react';

/**
 * Hook to observe a container element's width and call a callback whenever it changes.
 *
 * Uses `ResizeObserver` to track changes to the element’s dimensions.
 * Works with libraries like Allotment that resize elements without triggering a window resize event.
 *
 */
export function useResizeColumns(
  ref: React.RefObject<HTMLDivElement | null>,
  onSetTableWidth: (width: number) => void
) {
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const node = ref.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          onSetTableWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(node);

    // Set initial width
    onSetTableWidth(node.offsetWidth);

    return () => {
      observer.disconnect();
    };
  }, [onSetTableWidth, ref]);
}
