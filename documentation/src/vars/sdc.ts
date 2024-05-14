export const urls = {
  // 5 Using Expressions http://hl7.org/fhir/uv/sdc/expressions.html
  // 5.2 Expression Extensions
  variable: 'http://hl7.org/fhir/StructureDefinition/variable',
  answerExpression:
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
  initialExpression:
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
  calculatedExpression:
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
  enableWhenExpression:
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
  itemPopulationContext:
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',

  // 5.3 Other extensions
  launchContext: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',

  // 8 Advanced Form Rendering http://hl7.org/fhir/uv/sdc/rendering.html
  // 8.1.1 Text Appearance
  renderingXhtml: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
  displayCategory: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory', // Support instructions only
  openLabel: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
  hidden: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',

  // 8.1.2 Control Appearance
  itemControl: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  choiceOrientation: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
  sliderStepValue: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',

  // 8.1.3 Additional Display Content
  entryFormat: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
  shortText: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',

  // 8.1.4 Other
  required: 'item.required',
  repeats: 'item.repeats',
  readOnly: 'item.readOnly',

  // 9 Form Behavior and Calculation http://hl7.org/fhir/uv/sdc/behavior.html
  // 9.1.1 Value constraints
  maxLength: 'item.maxLength',
  minLength: 'http://hl7.org/fhir/StructureDefinition/minLength',
  regex: 'http://hl7.org/fhir/StructureDefinition/regex',
  minValue: 'http://hl7.org/fhir/StructureDefinition/minValue',
  maxValue: 'http://hl7.org/fhir/StructureDefinition/maxValue',
  maxDecimalPlaces: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',

  // 9.1.2 Choice restriction
  answerOption: 'item.answerOption',
  answerValueSet: 'item.answerValueSet',
  // answerExpression already defined above - 5.2 Expression Extensions
  // required already defined above - 8.1.4 Other
  // repeats already defined above - 8.1.4 Other
  // readOnly already defined above - 8.1.4 Other

  // 9.1.2 Calculations
  // launchContext already defined above - 5.3 Other extensions
  // variable already defined above - 5.2 Expression Extensions
  // initialExpression already defined above - 5.2 Expression Extensions
  // calculatedExpression already defined above - 5.2 Expression Extensions

  // 9.1.3 Other Control
  initial: 'item.initial',
  enableWhen: 'item.enableWhen',
  enableBehavior: 'item.enableBehavior',
  // enableWhenExpression already defined above - 5.2 Expression Extensions
  text: 'item.text'
};
