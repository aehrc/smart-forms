/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Box, Typography } from '@mui/material';

export interface Props {
  file: File | null;
  onDrop: (item: { files: any[] }) => void;
  errorMessage: string;
}

function DropBox(props: Props) {
  const { file, onDrop, errorMessage } = props;

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: any[] }) {
        if (onDrop) {
          onDrop(item);
        }
      },
      canDrop() {
        return true;
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop()
        };
      }
    }),
    [props]
  );

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
    <Box
      ref={drop}
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: 'background.paper',
        border: '3px dashed',
        borderColor: isActive ? 'green' : 'primary.main',
        borderRadius: '4px',
        height: '200px',
        width: '350px'
      }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1">{boxMessage}</Typography>
      </Box>
    </Box>
  );
}

export default DropBox;
