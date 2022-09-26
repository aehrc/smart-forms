import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Container, Divider, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import QFormBody from './QFormBody';
import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';
import QItemBodyTabbed from './QFormBodyTabs';
import { containsTabs, getIndexOfFirstTab } from './functions/TabFunctions';
import { cleanQrItem } from './functions/QrItemFunctions';
import { CalculatedExpressionsContext, VariablesContext } from './QPage';
import * as fhirpath from 'fhirpath';
import * as fhirpath_r4_model from 'fhirpath/fhir-context/r4';

interface Props {
  questionnaire: Questionnaire;
  qrResponse: QuestionnaireResponse;
}

function QForm(props: Props) {
  const { questionnaire, qrResponse } = props;

  const variables = useContext(VariablesContext);
  const calculatedExpressions = useContext(CalculatedExpressionsContext);

  const [questionnaireResponse, setQuestionnaireResponse] =
    useState<QuestionnaireResponse>(qrResponse);

  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  useEffect(() => {
    if (!qrResponse.item) return;

    const qrFormClean = cleanQrItem(qrResponse.item[0]);
    if (qrFormClean) {
      setQuestionnaireResponse({ ...qrResponse, item: [qrFormClean] });
    }
  }, [qrResponse]);

  function onResponseChange(newQrForm: QuestionnaireResponseItem) {
    console.log(variables);
    console.log(calculatedExpressions);
    console.log('-------------------');
    const newQuestionnaireResponse = { ...questionnaireResponse, item: [newQrForm] };
    if (Object.keys(calculatedExpressions).length > 0) {
      const context: any = { questionnaire: questionnaire, resource: newQuestionnaireResponse };

      if (variables.length > 0 && newQrForm) {
        variables.forEach((variable) => {
          context[`${variable.name}`] = fhirpath.evaluate(
            newQuestionnaireResponse.item[0],
            {
              base: 'QuestionnaireResponse.item',
              expression: `${variable.expression}`
            },
            context,
            fhirpath_r4_model
          );
        });

        for (const linkId in calculatedExpressions) {
          const result = fhirpath.evaluate(
            newQuestionnaireResponse,
            calculatedExpressions[linkId].expression,
            context,
            fhirpath_r4_model
          );

          if (result.length > 0) {
            calculatedExpressions[linkId].value = result[0];
          }
        }
      }
    }

    setQuestionnaireResponse(newQuestionnaireResponse);
  }

  // only for testing
  function clearQuestionnaireResponseButton() {
    const clearQrForm: QuestionnaireResponseItem = {
      linkId: '715-clear',
      text: 'MBS 715 Cleared',
      item: []
    };
    setQuestionnaireResponse({ ...questionnaireResponse, item: [clearQrForm] });
  }

  if (qForm.item && qrForm.item) {
    return (
      <div>
        <Container maxWidth="lg">
          <Stack spacing={2.5} sx={{ my: 4 }}>
            <Typography variant="h4">{questionnaire.title}</Typography>
            <Divider />

            {containsTabs(qForm.item) ? (
              <QItemBodyTabbed
                qForm={qForm}
                qrForm={qrForm}
                indexOfFirstTab={getIndexOfFirstTab(qForm.item)}
                onQrItemChange={(newQrForm) => onResponseChange(newQrForm)}
              />
            ) : (
              <QFormBody
                qForm={qForm}
                qrForm={qrForm}
                onQrItemChange={(newQrForm) => {
                  onResponseChange(newQrForm);
                }}></QFormBody>
            )}

            <Box sx={{ pt: 6 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">Questionnaire Response</Typography>
                <Button
                  variant="outlined"
                  onClick={clearQuestionnaireResponseButton}
                  sx={{ borderRadius: 20 }}>
                  Clear Responses
                  <ClearIcon sx={{ ml: 1 }} />
                </Button>
              </Stack>
              {<pre>{JSON.stringify(questionnaireResponse, null, 2)}</pre>}
            </Box>
          </Stack>
        </Container>
      </div>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default QForm;
