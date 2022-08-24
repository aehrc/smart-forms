import React from 'react';
import {
  Typography,
  Container,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Input,
  Box
} from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { QItem } from '../QItem';
import { grey } from '@mui/material/colors';

interface Props {
  item: QuestionnaireItem;
}

// A generic form item
function QItemString(props: Props) {
  const { item } = props;
  const itemBoolean = new QItem(item);
  return (
    <div>
      <Container sx={{ border: 0.5, mb: 2, p: 3, borderRadius: 5, borderColor: grey.A400 }}>
        <FormControl fullWidth>
          <Grid container>
            <Grid item xs={5}>
              <Typography>{item.text}</Typography>
            </Grid>

            <Grid item xs={7}>
              <div>
                <Input id={item.linkId} />
                {itemBoolean.getInstruction() ? (
                  <FormHelperText>itemBoolean.getInstruction()</FormHelperText>
                ) : (
                  <div />
                )}
              </div>
            </Grid>
          </Grid>
        </FormControl>
      </Container>
    </div>
  );
}

export default QItemString;
