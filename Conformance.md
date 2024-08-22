# Questionnaire & SDC conformance

Smart Forms is based on FHIR R4. The checklist below is a summary of the Questionnaire item types and SDC extensions supported by Smart Forms.

For specific details of each item types/extensions, refer to the [docs](https://smartforms.csiro.au/docs).

## Supported item types 
The list can be found here: http://hl7.org/fhir/R4/valueset-item-type.html

- [x] group
- [x] display
- [x] boolean
- [x] decimal
- [x] integer
- [x] date
- [x] dateTime
- [x] time
- [x] string
- [x] text
- [ ] url (partial implementation - using string UI component currently)
- [x] choice
- [x] open-choice
- [x] attachment 
- [ ] reference (partial implementation - using string UI component currently)
- [ ] quantity (partial implementation - using decimal UI component currently)

### Using Expressions
View the source here: http://hl7.org/fhir/uv/sdc/expressions.html

#### [Expression Extensions](http://hl7.org/fhir/uv/sdc/expressions.html#expression-extensions)
- [x] variable
- [x] answerExpression
- [x] initialExpression
- [ ] candidateExpression
- [ ] contextExpression
- [x] calculatedExpression
- [x] enableWhenExpression
- [ ] answerOptionToggleExpression
- [x] itemPopulationContext
- [ ] itemExtractionContext
- [ ] constraint

#### [Other extensions](http://hl7.org/fhir/uv/sdc/expressions.html#other-extensions)
- [ ] library
- [x] launchContext

#### [x-fhir-query enhancements](http://hl7.org/fhir/uv/sdc/expressions.html#x-fhir-query-enhancements)
- [x] x-fhir-query

### Advanced Form Rendering
View the source here: http://hl7.org/fhir/uv/sdc/rendering.html

#### [Text Appearance](http://hl7.org/fhir/uv/sdc/rendering.html#extension-overview)
- [x] rendering-style
- [x] rendering-xhtml
- [x] displayCategory
- [x] openLabel
- [x] hidden  
- [ ] itemMedia
- [ ] itemAnswerMedia

#### [Control Appearance](http://hl7.org/fhir/uv/sdc/rendering.html#control-appearance)
- [x] itemControl
- [x] choiceOrientation
- [x] sliderStepValue
- [ ] width
- [x] collapsible

**Questionnaire `itemControl` Checklist**

View the source here: https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html
- [ ] group
  - [ ] list
  - [ ] table
  - [ ] htable
  - [x] gtable
  - [x] grid
  - [ ] header
  - [ ] footer
  - [ ] page
  - [x] tab-container
- [ ] display
  - [ ] inline
  - [x] prompt (deprecated - encouraged to use [entryFormat](http://hl7.org/fhir/uv/sdc/rendering.html#entryFormat))
  - [x] unit (deprecated - encouraged to use [questionnaire-unit](https://hl7.org/fhir/extensions/StructureDefinition-questionnaire-unit.html))
  - [x] lower
  - [x] upper
  - [x] flyover
  - [ ] help
  - [ ] legal
- [ ] question
  - [x] autocomplete
  - [x] drop-down
  - [x] check-box
  - [ ] lookup
  - [x] radio-button
  - [x] slider
  - [ ] spinner
  - [ ] text-box

#### [Additional Display Content](http://hl7.org/fhir/uv/sdc/rendering.html#additional-display-content)
- [ ] supportLink
- [ ] choiceColumn
- [ ] optionPrefix
- [ ] valueset-label
- [x] entryFormat
- [x] shortText

#### [Other](http://hl7.org/fhir/uv/sdc/rendering.html#other)
- [x] required
- [x] repeats
- [x] readOnly
- [ ] rendering-styleSensitive
- [ ] optionalDisplay

### Form Behavior and Calculation

View the source here: http://hl7.org/fhir/uv/sdc/behavior.html

#### [Value Constraints](http://hl7.org/fhir/uv/sdc/behavior.html#value-constraints)
- [x] maxLength
- [x] minLength
- [x] regex
- [x] minValue
- [x] maxValue
- [ ] minQuantity
- [ ] maxQuantity
- [x] maxDecimalPlaces
- [ ] mimeType
- [ ] maxSize

#### [Choice Restriction](http://hl7.org/fhir/uv/sdc/behavior.html#choice-restriction)

- [x] answerOption
- [x] answerValueSet
- [ ] answerValueSet with Expression
- [x] answerExpression
- [ ] answerOptionToggleExpression
- [x] required
- [x] repeats
- [x] readOnly
- [ ] minOccurs
- [ ] maxOccurs
- [ ] optionExclusive
- [x] unitOption
- [ ] unitValueSet
- [ ] unitOpen
- [ ] unitSupplementalSystem
- [ ] referenceResource
- [ ] referenceProfile
- [ ] candidateExpression
- [ ] lookupQuestionnaire

#### [Calculations](http://hl7.org/fhir/uv/sdc/behavior.html#calculations)

- [ ] cqf-library
- [x] launchContext
- [x] variable
- [x] initialExpression
- [x] calculatedExpression
- [ ] cqf-calculatedValue
- [x] cqf-expression

#### [Other Control](http://hl7.org/fhir/uv/sdc/behavior.html#other-control)

- [ ] entryMode
- [x] initial
- [x] enableWhen
- [x] enableBehavior
- [x] enableWhenExpression
- [ ] usageMode
- [ ] constraint
- [ ] endpoint
- [ ] signatureRequired
- [ ] ordinalValue
- [x] text

## Form Population
View the page here: http://hl7.org/fhir/uv/sdc/populate.html

**Population operations**
- [x] $populate
- [ ] $populate-html
- [ ] $populate-link

Smart Forms only supports **full population** at the moment, and SMART App Launch is a requirement. Only patient, practitioner and encounter launch contexts are supported.

**Population mechanisms**
- [ ] Observation-based
- [x] Expression-based
- [ ] StructureMap-based

While StructuredMap-based population mechanism is not supported, [sdc-questionnaire-sourceQueries](http://hl7.org/fhir/uv/sdc/StructureDefinition-sdc-questionnaire-sourceQueries.html) is supported, using an expression-based approach.

## Form Data Extraction
View the page here: http://hl7.org/fhir/uv/sdc/extraction.html

This is something we are super interested in, but haven't quite got to it yet.

## Modular Forms
View the page here: http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires

Our Forms Server https://smartforms.csiro.au/api/fhir supports the [$assemble](http://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-assemble.html) operation.
The implementation is based on http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires.

## Adaptive Forms

View the page here: http://hl7.org/fhir/uv/sdc/adaptive.html

This is not something on our radar at the moment :(
