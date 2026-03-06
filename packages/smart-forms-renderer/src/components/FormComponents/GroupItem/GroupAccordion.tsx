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

import React, { useCallback, useState, useRef } from 'react';
import type { AccordionProps } from '@mui/material/Accordion';
import { StyledGroupAccordion } from './GroupAccordion.styles';

// Matches the MUI Accordion transition timeout used in GroupItemView/RepeatGroupView
const TRANSITION_DURATION_MS = 300;

/**
 * Walk up the DOM to find the nearest element that actually scrolls.
 * The page may not scroll on window — e.g. the smart-forms-app uses a styled
 * `Main` div with `overflow: auto` as the scroll container.
 */
function findScrollContainer(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflow, overflowY } = window.getComputedStyle(node);
    if (
      overflow === 'auto' ||
      overflow === 'scroll' ||
      overflowY === 'auto' ||
      overflowY === 'scroll'
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

interface GroupAccordionProps extends Omit<AccordionProps, 'elevation'> {
  elevation: number;
  defaultExpanded?: boolean;
}

/**
 * GroupAccordion component.
 */
export function GroupAccordion(props: GroupAccordionProps) {
  const { defaultExpanded = false, onChange, children, ...rest } = props;

  const [expanded, setExpanded] = useState(defaultExpanded);
  const accordionRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      // When the accordion expands, its content is mounted into the DOM (unmountOnExit).
      // The browser's CSS scroll anchoring then adjusts the nearest scrollable ancestor's
      // scrollTop every animation frame to keep anchor elements below the accordion in
      // place — visually making the accordion header appear to jump upward.
      //
      // Fix: temporarily opt the scroll container out of scroll anchoring for the
      // duration of the transition, then restore it.
      const scrollContainer = accordionRef.current
        ? findScrollContainer(accordionRef.current)
        : null;
      if (scrollContainer) {
        scrollContainer.style.overflowAnchor = 'none';
        setTimeout(() => {
          scrollContainer.style.overflowAnchor = '';
        }, TRANSITION_DURATION_MS);
      }

      setExpanded(isExpanded);
      onChange?.(event, isExpanded);
    },
    [onChange]
  );

  return (
    <StyledGroupAccordion ref={accordionRef} expanded={expanded} onChange={handleChange} {...rest}>
      {children}
    </StyledGroupAccordion>
  );
}

export default GroupAccordion;
