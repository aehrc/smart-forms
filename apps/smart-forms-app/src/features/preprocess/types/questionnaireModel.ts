import type { Coding } from 'fhir/r4';
import type { Tabs } from '../../renderer/types/tab.interface.ts';
import type { Variables } from '../../../providers/questionnaireProvider.interfaces.ts';
import type { LaunchContext } from '../../prepopulate/types/populate.interface.ts';
import type { CalculatedExpression } from '../../calculatedExpression/types/calculatedExpression.interface.ts';
import type {
  EnableWhenExpression,
  EnableWhenItemProperties
} from '../../enableWhen/types/enableWhen.interface.ts';
import type { AnswerExpression } from '../../answerExpression/types/answerExpression.interface.ts';

export interface QuestionnaireModel {
  tabs: Tabs;
  variables: Variables;
  launchContexts: Record<string, LaunchContext>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  calculatedExpressions: Record<string, CalculatedExpression>;
  answerExpressions: Record<string, AnswerExpression>;
  processedValueSetCodings: Record<string, Coding[]>;
}
