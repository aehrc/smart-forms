import React from 'react';
import { Extension, Questionnaire } from 'fhir/r5';
import parse from 'html-react-parser';

interface Props {
  questionnaire: Questionnaire;
}

function QTitle(props: Props) {
  const { questionnaire } = props;

  const xHtmlString = getXHtmlStringFromQuestionnaire(questionnaire);

  if (xHtmlString) {
    return <>{parse(xHtmlString)}</>;
  } else {
    return <>{questionnaire.title}</>;
  }
}

export default QTitle;

function getXHtmlStringFromQuestionnaire(questionnaire: Questionnaire): string | null {
  const itemControl = questionnaire._title?.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
  );

  if (itemControl) {
    if (itemControl.valueString) {
      return itemControl.valueString;
    }
  }
  return null;
}
