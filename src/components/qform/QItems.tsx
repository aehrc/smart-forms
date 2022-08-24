import React from 'react';

import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import QItemBoolean from './qform-items/QItemBoolean';
import QItemGroup from './qform-items/QItemGroup';
import QItemString from './qform-items/QItemString';

interface Props {
  items: QuestionnaireItem[];
}

function QItems(props: Props) {
  const { items } = props;
  console.log(items);

  return (
    <div>
      {items.map((item, i) => {
        return <div key={i}>{renderSwitch(item)}</div>;
      })}
    </div>
  );
}

function renderSwitch(item: QuestionnaireItem) {
  switch (item.type) {
    case 'group':
      return <QItemGroup item={item} />;
    case 'string':
      return <QItemString item={item} />;
    case 'text':
      return <QItemBoolean item={item} />;
    default:
      return '';
  }
}

export default QItems;
