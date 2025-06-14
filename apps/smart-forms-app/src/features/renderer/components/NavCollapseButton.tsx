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

import { IconButton } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useResponsive } from '@aehrc/smart-forms-renderer';

interface NavExpandButtonProps {
  desktopNavCollapsed: boolean;
  onExpandNav: () => void;
}

function NavExpandButton(props: NavExpandButtonProps) {
  const { desktopNavCollapsed, onExpandNav } = props;

  const isLgUp = useResponsive({ query: 'up', start: 'lg' });

  return desktopNavCollapsed && isLgUp ? (
    <IconButton
      onClick={onExpandNav}
      sx={{ position: 'fixed', bottom: 16, left: 16 }}
      aria-label="Expand navigation">
      <KeyboardDoubleArrowRightIcon fontSize="small" />
    </IconButton>
  ) : null;
}

export default NavExpandButton;
