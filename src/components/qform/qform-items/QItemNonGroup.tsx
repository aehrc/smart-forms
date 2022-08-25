import React from 'react';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import QItemGroup from './QItemGroup';
import QItemString from './QItemString';
import QItemBoolean from './QItemBoolean';
import QItemText from './QItemText';
import QItemDisplay from './QItemDisplay';
import QItemInteger from './QItemInteger';
import QItemDate from './QItemDate';
import QItemDateTime from './QItemDateTime';
import QItemChoice from './QItemChoice';
import QItemOpenChoice from './QItemOpenChoice';
import QItemQuantity from './QItemQuantity';
import { Container, FormControl, Grid, Typography } from '@mui/material';

export class QItemNonGroup {
  item: QuestionnaireItem;
  itemRender: JSX.Element;
  itemInstruction: string | null;

  constructor(item: QuestionnaireItem) {
    this.item = item;
    this.itemRender = this.getItemRender(item);
    this.itemInstruction = this.getInstruction();
  }

  getItemRender(item: QuestionnaireItem) {
    switch (item.type) {
      case 'group':
        return <QItemGroup item={item} />;
      case 'string':
        return <QItemString item={item} />;
      case 'boolean':
        return <QItemBoolean item={item} />;
      case 'text':
        return <QItemText item={item} />;
      case 'display':
        return <QItemDisplay item={item} />;
      case 'integer':
        return <QItemInteger item={item} />;
      case 'date':
        return <QItemDate item={item} />;
      case 'datetime':
        return <QItemDateTime item={item} />;
      case 'choice':
        return <QItemChoice item={item} />;
      case 'open-choice':
        return <QItemOpenChoice item={item} />;
      case 'quantity':
        return <QItemQuantity item={item} />;
      default:
        return <div>Default</div>;
    }
  }

  getInstruction(): string | null {
    const extension = this.item.extension?.find(
      (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-instruction'
    );
    if (extension) {
      return extension.valueString;
    }
    return null;
  }

  render() {
    return (
      <FormControl fullWidth sx={{ m: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{this.item.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            <Container>{this.itemRender}</Container>
            {this.itemInstruction && (
              <Container>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {this.itemInstruction}
                </Typography>
              </Container>
            )}
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}
