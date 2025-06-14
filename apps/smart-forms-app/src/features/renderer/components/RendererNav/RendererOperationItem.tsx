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

import { ListItemText } from '@mui/material';
import type { OperationItem } from '../../../../types/Nav.interface.ts';
import { NavListItemButton, StyledNavItemIcon } from '../../../../components/Nav/Nav.styles.ts';

function RendererOperationItem(props: OperationItem) {
  const { title, icon, disabled, onClick } = props;

  return (
    <NavListItemButton
      role="button"
      disableGutters
      onClick={onClick}
      disabled={disabled}
      data-test="renderer-operation-item">
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>
      <ListItemText disableTypography primary={title} />
    </NavListItemButton>
  );
}

export default RendererOperationItem;
