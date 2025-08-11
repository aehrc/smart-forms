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

import React from 'react';
import { SecondaryFab } from '../Button.styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PreviousPageButtonProps {
  isDisabled: boolean;
  onPreviousPageClick: () => void;
}

function PreviousPageButton(props: PreviousPageButtonProps) {
  const { isDisabled, onPreviousPageClick } = props;

  return (
    <SecondaryFab
      size="small"
      aria-label="Previous page"
      disabled={isDisabled}
      onClick={onPreviousPageClick}>
      <ArrowBackIcon fontSize="small" />
    </SecondaryFab>
  );
}

export default PreviousPageButton;
