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
 * @author Janardhan Vignarajan
 * 
 */


import { Variant } from '@mui/material/styles/createTypography';

/**
 * Returns the values from h1 to h6 based on the elevation number.
 *
 * @export
 * @param {number} groupCardElevation
 * @return {*}  {Variant}
 */

export function getHeadingVariant(groupCardElevation: number): Variant {


  // Ensure heading level is within valid range
  let headingIntValue = Math.min(groupCardElevation, 6);
  //If Elevation is 0, then return always 1
  headingIntValue = Math.max(groupCardElevation, 0);  
  // Construct the Variant type
  const variant: Variant = `h${headingIntValue}` as Variant;

  
  return variant;
}


