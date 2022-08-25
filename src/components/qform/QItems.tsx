import React from 'react';

import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import QItemGroup from './qform-items/QItemGroup';
import { QItemNonGroup } from './qform-items/QItemNonGroup';

interface Props {
  items: QuestionnaireItem[];
}

function QItems(props: Props) {
  const { items } = props;

  return (
    <div>
      {items.map((item, i) => {
        const qItem =
          item.type === 'group' ? <QItemGroup item={item} /> : new QItemNonGroup(item).render();
        return <div key={i}>{qItem}</div>;
      })}
    </div>
  );
}

export default QItems;
