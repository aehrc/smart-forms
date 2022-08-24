import React from 'react';
import {
  Typography,
  Container,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Input,
  Box,
  Checkbox
} from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { grey } from '@mui/material/colors';

interface Props {
  item: QuestionnaireItem;
}

// A generic form item
function QItemBoolean(props: Props) {
  const { item } = props;
  return (
    <div>
      <Container sx={{ border: 0.5, mb: 2, p: 3, borderRadius: 5, borderColor: grey.A400 }}>
        <FormControl fullWidth>
          <Box
            sx={{
              display: 'grid',
              columnGap: 3,
              rowGap: 1,
              gridTemplateColumns: 'repeat(2, 1fr)'
            }}>
            <Typography>{item.text}</Typography>

            <div>
              <Checkbox id={item.linkId} />
            </div>
          </Box>
        </FormControl>
      </Container>
    </div>
  );
}

export default QItemBoolean;
