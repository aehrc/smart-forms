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

import React, { useCallback, useState, useId } from 'react';
import type { AccordionProps } from '@mui/material/Accordion';
import { GroupAccordion as StyledGroupAccordion } from './GroupAccordion.styles';
import { useFocusHeading } from '../../../hooks/useFocusHeading';

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
  const accordionId = useId();
  const focusHeading = useFocusHeading();

  const handleChange = useCallback(
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded);
      
      if (isExpanded) {
        console.log('[GroupAccordion] Expanding...');
        focusHeading(accordionId);
      }
      
      onChange?.(event, isExpanded);
    },
    [onChange, focusHeading, accordionId]
  );

  return (
    <StyledGroupAccordion id={accordionId} expanded={expanded} onChange={handleChange} {...rest}>
      {children}
    </StyledGroupAccordion>
  );
}

export default GroupAccordion;
