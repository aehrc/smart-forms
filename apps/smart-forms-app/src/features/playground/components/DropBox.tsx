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

import { Box, Typography } from '@mui/material';
import { DropBoxWrapper } from './Dropbox.styles.ts';
import useFileDrop from '../hooks/useFileDrop.ts';

export interface Props {
  file: File | null;
  onDrop: (item: { files: any[] }) => void;
  errorMessage: string;
}

function DropBox(props: Props) {
  const { file, onDrop, errorMessage } = props;

  const { canDrop, isOver, dropTarget } = useFileDrop(onDrop);

  const isActive = canDrop && isOver;

  let boxMessage = 'Drop Questionnaire JSON file here';
  if (isActive) {
    boxMessage = 'Release to drop file';
  } else if (errorMessage) {
    boxMessage = errorMessage;
  } else if (file) {
    boxMessage = file.name;
  }

  return (
    <DropBoxWrapper
      ref={dropTarget}
      display="flex"
      justifyContent="center"
      alignItems="center"
      isActive={isActive}>
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1">{boxMessage}</Typography>
      </Box>
    </DropBoxWrapper>
  );
}

export default DropBox;
