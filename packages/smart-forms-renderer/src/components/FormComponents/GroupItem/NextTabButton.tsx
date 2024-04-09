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

import React from 'react';
import Button from '@mui/material/Button';
import Iconify from '../../Iconify/Iconify';

interface NextTabButtonProps {
  isDisabled: boolean;
  onNextTabClick: () => void;
}

function NextTabButton(props: NextTabButtonProps) {
  const { isDisabled, onNextTabClick } = props;

  return (
    <Button
      variant="contained"
      size="small"
      endIcon={<Iconify icon="material-symbols:arrow-forward" />}
      disabled={isDisabled}
      color="secondary"
      onClick={onNextTabClick}>
      Next tab
    </Button>
  );
}

export default NextTabButton;
