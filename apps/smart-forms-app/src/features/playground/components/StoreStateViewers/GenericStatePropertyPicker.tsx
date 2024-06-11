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

import { Stack } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

interface GenericStatePropertyPickerProps {
  statePropertyNames: string[];
  selectedProperty: string;
  onSelectProperty: (propertyName: string) => void;
}

function GenericStatePropertyPicker(props: GenericStatePropertyPickerProps) {
  const { statePropertyNames, selectedProperty, onSelectProperty } = props;

  return (
    <Stack gap={0.25} sx={{ overflowX: 'auto' }}>
      <ToggleButtonGroup
        size="small"
        color="primary"
        value={selectedProperty}
        sx={{ height: 28 }}
        exclusive
        data-test="specific-state-picker-playground"
        onChange={(_, newSelectedProperty) => onSelectProperty(newSelectedProperty)}>
        {statePropertyNames.map((property) => (
          <ToggleButton
            key={property}
            value={property}
            sx={{ fontSize: 10, textTransform: 'capitalize', height: 28 }}>
            {property}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

export default GenericStatePropertyPicker;
