import type { Questionnaire } from 'fhir/r4';

export const qBooleanItem: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BooleanBasic',
  name: 'BooleanBasic',
  title: 'Boolean Basic',
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
  id: 'DecimalBasic',
  name: 'DecimalBasic',
  title: 'Decimal Basic',
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
  id: 'IntegerBasic',
  name: 'IntegerBasic',
  title: 'Integer Basic',
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
  id: 'DateBasic',
  name: 'DateBasic',
  title: 'Date Basic',
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
  id: 'DateTimeBasic',
  name: 'DateTimeBasic',
  title: 'DateTime Basic',
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
  id: 'TimeBasic',
  name: 'TimeBasic',
  title: 'Time Basic',
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
  id: 'StringBasic',
  name: 'StringBasic',
  title: 'String Basic',
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
  id: 'TextBasic',
  name: 'TextBasic',
  title: 'Text Basic',
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
  id: 'UrlBasic',
  name: 'UrlBasic',
  title: 'URL Basic',
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
  id: 'AttachmentBasic',
  name: 'AttachmentBasic',
  title: 'Attachment Basic',
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
  id: 'ReferenceBasic',
  name: 'ReferenceBasic',
  title: 'Reference Basic',
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
  id: 'QuantityBasic',
  name: 'QuantityBasic',
  title: 'Quantity Basic',
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
