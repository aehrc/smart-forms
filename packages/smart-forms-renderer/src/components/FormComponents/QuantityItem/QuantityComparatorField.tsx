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

import Autocomplete from '@mui/material/Autocomplete';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import MuiTextField from '../TextItem/MuiTextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Quantity } from 'fhir/r4';
import { useRendererStylingStore } from '../../../stores';

interface QuantityComparatorFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  options: Quantity['comparator'][];
  valueSelect: Quantity['comparator'] | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onChange: (newValue: Quantity['comparator'] | null) => void;
}

function QuantityComparatorField(props: QuantityComparatorFieldProps) {
  const { linkId, itemType, options, valueSelect, readOnly, onChange } = props;
  // TODO this component doesn't have a calcExpUpdated update animation

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const hideQuantityComparatorField = useRendererStylingStore.use.hideQuantityComparatorField();
  if (hideQuantityComparatorField) {
    return null;
  }

  return (
    <Box>
      <Autocomplete
        data-test={'q-item-quantity-comparator'}
        id={itemType + '-' + linkId + '-comparator'}
        value={valueSelect ?? null}
        options={options}
        onChange={(_, newValue) => onChange(newValue as Quantity['comparator'])}
        autoHighlight
        sx={{ width: 88 }}
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        size="small"
        renderInput={(params) => <MuiTextField sx={{ width: 88 }} {...params} />}
      />
      <Typography variant="caption" color="text.secondary">
        (optional)
      </Typography>
    </Box>
  );
}

export default QuantityComparatorField;
