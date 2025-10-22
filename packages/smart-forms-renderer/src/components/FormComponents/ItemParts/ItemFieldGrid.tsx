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

import type { ReactNode } from 'react';
import React from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { useRendererConfigStore } from '../../../stores';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import Grid from '@mui/material/Grid';

interface ItemFieldGridProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  labelChildren?: ReactNode;
  fieldChildren?: ReactNode;
  feedback?: string;
  dateFeedback?: string;
  timeFeedback?: string;
}

/**
 * Helper function to generate instruction ID if instructions exist and there's no feedback
 */
export function getInstructionsId(
  qItem: QuestionnaireItem,
  displayInstructions: string,
  hasFeedback: boolean
): string | undefined {
  return displayInstructions && !hasFeedback ? `instructions-${qItem.linkId}` : undefined;
}

/**
 * Recursively add aria-describedby to input/textarea elements and radio/checkbox groups in the React tree
 */
function addAriaDescribedBy(children: ReactNode, instructionsId: string): ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const element = child as React.ReactElement<any>;

    // Add aria-describedby to input elements
    if (element.type === 'input' || element.type === 'textarea') {
      const existingDescribedBy = element.props['aria-describedby'];
      const newDescribedBy = existingDescribedBy
        ? `${existingDescribedBy} ${instructionsId}`
        : instructionsId;

      return React.cloneElement(element, {
        'aria-describedby': newDescribedBy
      });
    }

    // Add aria-describedby to RadioGroup and FormGroup (for radio buttons and checkboxes)
    if (element.type && typeof element.type === 'object' && 'render' in element.type) {
      const existingDescribedBy = element.props['aria-describedby'];
      const newDescribedBy = existingDescribedBy
        ? `${existingDescribedBy} ${instructionsId}`
        : instructionsId;

      return React.cloneElement(element, {
        'aria-describedby': newDescribedBy
      });
    }

    // Recursively process children
    if (element.props && element.props.children) {
      return React.cloneElement(element, {
        children: addAriaDescribedBy(element.props.children, instructionsId)
      });
    }

    return child;
  });
}

function ItemFieldGrid(props: ItemFieldGridProps) {
  const { qItem, readOnly, labelChildren, fieldChildren } = props;

  const itemResponsive = useRendererConfigStore.use.itemResponsive();
  const { labelBreakpoints, fieldBreakpoints, columnGapPixels, rowGapPixels } = itemResponsive;

  const { displayInstructions } = useRenderingExtensions(qItem);

  // Generate instruction ID if instructions exist
  const instructionsId =
    displayInstructions && !props.feedback && !props.dateFeedback && !props.timeFeedback
      ? `instructions-${qItem.linkId}`
      : undefined;

  // Add aria-describedby to field children if instructions exist
  const enhancedFieldChildren =
    instructionsId && fieldChildren
      ? addAriaDescribedBy(fieldChildren, instructionsId)
      : fieldChildren;

  return (
    <Grid container columnSpacing={columnGapPixels + 'px'} rowGap={rowGapPixels + 'px'}>
      {/* NOTE: Boolean checkboxes now have labels which uses <SrOnly/>, similar to tailwind's sr-only class  */}
      <Grid size={{ ...labelBreakpoints }}>
        <>{labelChildren}</>
      </Grid>
      <Grid size={{ ...fieldBreakpoints }}>
        <>{enhancedFieldChildren}</>
        {/* Only show display instructions if there is no feedback of any type */}
        {instructionsId && (
          <DisplayInstructions id={instructionsId} readOnly={readOnly}>
            {displayInstructions}
          </DisplayInstructions>
        )}
      </Grid>
    </Grid>
  );
}

export default ItemFieldGrid;
