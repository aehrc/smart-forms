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

import { Container, Divider, Fade } from '@mui/material';
import FormTitle from './FormTitle.tsx';
import FormTopLevelItem from '../FormTopLevelItem.tsx';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import FormInvalid from '../FormInvalid.tsx';

interface FormProps {
  questionnaire: Questionnaire;
  topLevelQItems: QuestionnaireItem[] | undefined;
  topLevelQRItems: QuestionnaireResponseItem[] | undefined;
  onTopLevelQRItemChange: (newTopLevelQItem: QuestionnaireResponseItem, index: number) => void;
}

function Form(props: FormProps) {
  const { questionnaire, topLevelQItems, topLevelQRItems, onTopLevelQRItemChange } = props;

  if (!topLevelQItems || !topLevelQRItems) {
    return <FormInvalid questionnaire={questionnaire} />;
  }

  if (topLevelQItems.length === 0 || topLevelQRItems.length === 0) {
    return <FormInvalid questionnaire={questionnaire} />;
  }

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="xl">
        <FormTitle questionnaire={questionnaire} />
        <Divider light sx={{ my: 1.5 }} />

        {topLevelQItems.map((qItem, index) => {
          const qrItem = topLevelQRItems[index];

          return (
            <FormTopLevelItem
              key={qItem.linkId}
              topLevelQItem={qItem}
              topLevelQRItem={qrItem}
              onQrItemChange={(newTopLevelQRItem) =>
                onTopLevelQRItemChange(newTopLevelQRItem, index)
              }
            />
          );
        })}
      </Container>
    </Fade>
  );
}

export default Form;
