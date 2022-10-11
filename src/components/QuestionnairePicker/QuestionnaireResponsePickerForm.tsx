import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Card, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { QuestionnaireResponse } from 'fhir/r5';

interface Props {
  questionnaireResponses: QuestionnaireResponse[];
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnaireResponsePickerForm(props: Props) {
  const { questionnaireResponses, onSelectedIndexChange } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <Stack direction={'column'}>
        <Typography variant="h1" fontWeight="bold" fontSize={42} color="inherit">
          Responses
        </Typography>

        <Card elevation={2} sx={{ my: 3.5 }}>
          <List sx={{ width: '100%', maxHeight: 540, overflow: 'auto', py: 0 }}>
            {questionnaireResponses.map((questionnaireResponse, i) => (
              <React.Fragment key={questionnaireResponse.id}>
                <ListItemButton
                  selected={selectedIndex === i}
                  sx={{ p: 2 }}
                  onClick={() => {
                    setSelectedIndex(i);
                    onSelectedIndexChange(i);
                  }}>
                  <ListItemText
                    primary={dayjs(`${questionnaireResponse.meta?.lastUpdated}`).format('LLL')}
                    primaryTypographyProps={{ fontSize: '18px' }}
                    sx={{ px: 1.5 }}
                  />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Card>
      </Stack>
    </>
  );
}

export default QuestionnaireResponsePickerForm;
