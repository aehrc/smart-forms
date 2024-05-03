# Smart Forms Questionnaire & SDC conformance

Smart Forms is based on FHIR R4. No plans for compatibility for R5 at the moment or in the near future.

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
- [ ] url
- [x] choice
- [x] open-choice
- [ ] attachment
- [ ] reference
- [ ] quantity



## Advanced Form Rendering
View the page here: http://hl7.org/fhir/uv/sdc/rendering.html

**Text Appearance**
- [ ] rendering-style
- [x] rendering-xhtml
- [x] displayCategory
- [x] openLabel
- [x] hidden
- [ ] itemMedia
- [ ] itemAnswerMedia

**Control Apperance**
- [x] itemControl
- [x] choiceOrientation
- [x] sliderStepValue
- [ ] width
- [ ] collapsible

**Questionnaire Item Controls** (http://hl7.org/fhir/r4/valueset-questionnaire-item-control.html)
- [ ] group
    - [ ] list
    - [ ] table
    - [ ] htable
    - [x] gtable
    - [ ] atable
    - [ ] header
    - [ ] footer
- [ ] text
    - [ ] inline
    - [x] prompt
    - [x] unit
    - [ ] lower (supported for slider currently)
    - [ ] upper (supported for slider currently)
    - [ ] flyover
    - [ ] help
- [ ] question
    - [x] autocomplete
    - [x] drop-down
    - [x] check-box
    - [ ] lookup
    - [x] radio-button
    - [x] slider
    - [ ] spinner
    - [ ] text-box


**Additional Display Content**
- [ ] supportLink
- [ ] choiceColumn
- [ ] optionPrefix
- [ ] valueset-label
- [x] entryFormat
- [x] shortText

**Other**
- [ ] required
- [x] repeats
- [x] readOnly
- [ ] rendering-styleSensitive
- [ ] optionalDisplay

## Form Behavior and Calculation
View the page here: http://hl7.org/fhir/uv/sdc/behavior.html


**Value constraints**
- [x] maxLength
- [ ] minLength
- [x] regex
- [ ] minValue
- [ ] maxValue
- [ ] minQuantity
- [ ] maxQuantity
- [ ] maxDecimalPlaces
- [ ] mimeType
- [ ] maxSize

**Choice Restriction**
- [x] answerOption
- [x] answerValueSet
- [ ] answerValueSet with Expression
- [x] answerExpression
- [ ] answerOptionToggleExpression
- [ ] required
- [x] repeats
- [x] readOnly
- [ ] minOccurs
- [ ] maxOccurs
- [ ] optionExclusive
- [ ] unitOption
- [ ] unitValueSet
- [ ] unitOpen
- [ ] unitSupplementalSystem
- [ ] referenceResource
- [ ] referenceProfile
- [ ] candidateExpression
- [ ] lookupQuestionnaire

**Calculations**
- [ ] cqf-library
- [x] launchContext
- [x] variable
- [x] initialExpression
- [x] calculatedExpression
- [ ] cqf-calculatedValue
- [ ] cqf-expression

| Item types that support calculations <br/>(refer https://www.hl7.org/fhir/r4/codesystem-item-type.html) |
|---------------------------------------------------------------------------------------------------------|
| integer                                                                                                 |
| decimal                                                                                                 |
| string                                                                                                  |
| text                                                                                                    |
| boolean                                                                                                 |
| choice (limited to the below) <br/>- radio item control <br/> - dropdown    item control                |


**Other Control**
- [ ] entryMode
- [ ] initial
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

Smart Forms only supports **Full population** at the moment, and SMART App Launch is a requirement. Only patient, practitioner and encounter launch contexts are supported.

**Population mechanisms**
- [ ] Observation-based
- [x] Expression-based
- [ ] StructureMap-based

While StructuredMap-based population mechanism is not supported, [sdc-questionnaire-sourceQueries](http://hl7.org/fhir/uv/sdc/StructureDefinition-sdc-questionnaire-sourceQueries.html) is supported, using an expression-based approach.

## Form Data Extraction
View the page here: http://hl7.org/fhir/uv/sdc/extraction.html

This is something we are super interested in, but we haven't quite gotten to it yet.

## Modular Forms
View the page here: http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires

Our Forms Server https://smartforms.csiro.au/api/fhir supports the [$assemble](http://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-assemble.html) operation. 
The implementation is based on http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires.

## Adaptive Forms

View the page here: http://hl7.org/fhir/uv/sdc/adaptive.html

This is not something on our radar at the moment. 
