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

import { Grid, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import GenericScreen from './GenericScreen.tsx';
import SdcIdeRenderer from './SdcIdeRenderer.tsx';
import SdcIdeQuestionnaireScreen from './SdcIdeQuestionnaireScreen.tsx';

const SdcIdeScreens = [
  'LaunchContext',
  'Questionnaire',
  'Renderer',
  'QuestionnaireResponse',
  'Mapping',
  'Extracted Bundle'
];

function SdcIde() {
  return (
    <Stack direction="row" height="100%" width="100%" alignItems="center" justifyContent="center">
      <Grid container height="100%" width="100%">
        {SdcIdeScreens.map((item) => (
          <Grid item xs={4} key={item} sx={{ border: `1px solid ${grey.A200}`, borderRadius: 1 }}>
            {item !== 'Renderer' ? (
              <GenericScreen screenTitle={item}>
                <SdcIdeQuestionnaireScreen />
              </GenericScreen>
            ) : (
              <GenericScreen screenTitle={item}>
                <SdcIdeRenderer />
              </GenericScreen>
            )}
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default SdcIde;

// {/*<ExpandableRow>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*</ExpandableRow>*/}
// {/*<ExpandableRow>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*  <ExpandableElement title="Launch Context">hola</ExpandableElement>*/}
// {/*</ExpandableRow>*/}
