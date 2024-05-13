import type { Questionnaire } from 'fhir/r4';

export const qBooleanItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BooleanComponent',
  name: 'BooleanComponent',
  title: 'Boolean Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/boolean',
  item: [
    {
      linkId: 'eaten-boolean',
      type: 'boolean',
      repeats: false,
      text: 'Have you eaten yet?'
    }
  ]
};

export const qDecimalItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DecimalComponent',
  name: 'DecimalComponent',
  title: 'Decimal Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/decimal',
  item: [
    {
      linkId: 'weight-decimal',
      type: 'decimal',
      repeats: false,
      text: 'Weight in kg'
    }
  ]
};

export const qIntegerItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'IntegerComponent',
  name: 'IntegerComponent',
  title: 'Integer Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/integer',
  item: [
    {
      linkId: 'age',
      type: 'integer',
      repeats: false,
      text: 'Age'
    }
  ]
};

export const qDateItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DateComponent',
  name: 'DateComponent',
  title: 'Date Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/date',
  item: [
    {
      linkId: 'dob-date',
      type: 'date',
      repeats: false,
      text: 'Date of birth'
    }
  ]
};

export const qDateTimeItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'DateTimeComponent',
  name: 'DateTimeComponent',
  title: 'DateTime Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/datetime',
  item: [
    {
      linkId: 'dob-datetime',
      type: 'dateTime',
      repeats: false,
      text: 'Datetime of birth'
    }
  ]
};

export const qTimeItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TimeComponent',
  name: 'TimeComponent',
  title: 'Time Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/time',
  item: [
    {
      linkId: 'last-meal-time',
      type: 'time',
      repeats: false,
      text: 'Time of last meal'
    }
  ]
};

export const QSingleItems: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'StringComponent',
  name: 'StringComponent',
  title: 'String Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/string',
  item: [
    {
      linkId: 'container',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'name-string',
          type: 'string',
          repeats: false,
          text: 'Name'
        }
      ]
    }
  ]
};

export const qTextItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'TextComponent',
  name: 'TextComponent',
  title: 'Text Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/text',
  item: [
    {
      linkId: 'details-text',
      type: 'text',
      repeats: false,
      text: 'Details of intermittent fasting'
    }
  ]
};

export const qUrlItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'UrlComponent',
  name: 'UrlComponent',
  title: 'URL Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/url',
  item: [
    {
      linkId: 'website-url',
      type: 'url',
      repeats: false,
      text: 'Website URL'
    }
  ]
};

export const qAttachmentItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AttachmentComponent',
  name: 'AttachmentComponent',
  title: 'Attachment Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/attachment',
  item: [
    {
      linkId: 'file-attachment',
      type: 'attachment',
      repeats: false,
      text: 'File Attachment'
    }
  ]
};

export const qReferenceItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ReferenceComponent',
  name: 'ReferenceComponent',
  title: 'Reference Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/reference',
  item: [
    {
      linkId: 'patient-reference',
      type: 'reference',
      repeats: false,
      text: 'Patient Reference'
    }
  ]
};

export const qQuantityItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityComponent',
  name: 'QuantityComponent',
  title: 'Quantity Component',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/quantity',
  item: [
    {
      linkId: 'body-weight',
      type: 'quantity',
      repeats: false,
      text: 'Body Weight'
    }
  ]
};

// choice
// open-choice
