/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Coding, Expression, Extension, FhirResource, Reference } from 'fhir/r4';

export interface LaunchContext extends Extension {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext';
  extension: LaunchContextExtensions;
}

type LaunchContextExtensions =
  | [LaunchContextName, LaunchContextType]
  | [LaunchContextName, LaunchContextType, LaunchContextDescription];

type LaunchContextName = LaunchContextNameId | LaunchContextNameCoding;

// for backwards compatibility with old questionnaires (though it is not conformant)
interface LaunchContextNameId extends Extension {
  url: 'name';
  valueId: string;
}

interface LaunchContextNameCoding extends Extension {
  url: 'name';
  valueCoding: LaunchContextNameCodingValueCoding;
}

interface LaunchContextNameCodingValueCoding extends Coding {
  code: 'patient' | 'encounter' | 'location' | 'user' | 'study';
}

interface LaunchContextType extends Extension {
  url: 'type';
  valueCode: FhirResourceString;
}

interface LaunchContextDescription extends Extension {
  url: 'description';
  valueString: string;
}

export type FhirResourceString =
  | 'Account'
  | 'ActivityDefinition'
  | 'AdverseEvent'
  | 'AllergyIntolerance'
  | 'Appointment'
  | 'AppointmentResponse'
  | 'AuditEvent'
  | 'Basic'
  | 'Binary'
  | 'BiologicallyDerivedProduct'
  | 'BodyStructure'
  | 'Bundle'
  | 'CapabilityStatement'
  | 'CarePlan'
  | 'CareTeam'
  | 'CatalogEntry'
  | 'ChargeItem'
  | 'ChargeItemDefinition'
  | 'Claim'
  | 'ClaimResponse'
  | 'ClinicalImpression'
  | 'CodeSystem'
  | 'Communication'
  | 'CommunicationRequest'
  | 'CompartmentDefinition'
  | 'Composition'
  | 'ConceptMap'
  | 'Condition'
  | 'Consent'
  | 'Contract'
  | 'Coverage'
  | 'CoverageEligibilityRequest'
  | 'CoverageEligibilityResponse'
  | 'DetectedIssue'
  | 'Device'
  | 'DeviceDefinition'
  | 'DeviceMetric'
  | 'DeviceRequest'
  | 'DeviceUseStatement'
  | 'DiagnosticReport'
  | 'DocumentManifest'
  | 'DocumentReference'
  | 'EffectEvidenceSynthesis'
  | 'Encounter'
  | 'Endpoint'
  | 'EnrollmentRequest'
  | 'EnrollmentResponse'
  | 'EpisodeOfCare'
  | 'EventDefinition'
  | 'Evidence'
  | 'EvidenceVariable'
  | 'ExampleScenario'
  | 'ExplanationOfBenefit'
  | 'FamilyMemberHistory'
  | 'Flag'
  | 'Goal'
  | 'GraphDefinition'
  | 'Group'
  | 'GuidanceResponse'
  | 'HealthcareService'
  | 'ImagingStudy'
  | 'Immunization'
  | 'ImmunizationEvaluation'
  | 'ImmunizationRecommendation'
  | 'ImplementationGuide'
  | 'InsurancePlan'
  | 'Invoice'
  | 'Library'
  | 'Linkage'
  | 'List'
  | 'Location'
  | 'Measure'
  | 'MeasureReport'
  | 'Media'
  | 'Medication'
  | 'MedicationAdministration'
  | 'MedicationDispense'
  | 'MedicationKnowledge'
  | 'MedicationRequest'
  | 'MedicationStatement'
  | 'MedicinalProduct'
  | 'MedicinalProductAuthorization'
  | 'MedicinalProductContraindication'
  | 'MedicinalProductIndication'
  | 'MedicinalProductIngredient'
  | 'MedicinalProductInteraction'
  | 'MedicinalProductManufactured'
  | 'MedicinalProductPackaged'
  | 'MedicinalProductPharmaceutical'
  | 'MedicinalProductUndesirableEffect'
  | 'MessageDefinition'
  | 'MessageHeader'
  | 'MolecularSequence'
  | 'NamingSystem'
  | 'NutritionOrder'
  | 'Observation'
  | 'ObservationDefinition'
  | 'OperationDefinition'
  | 'OperationOutcome'
  | 'Organization'
  | 'OrganizationAffiliation'
  | 'Parameters'
  | 'Patient'
  | 'PaymentNotice'
  | 'PaymentReconciliation'
  | 'Person'
  | 'PlanDefinition'
  | 'Practitioner'
  | 'PractitionerRole'
  | 'Procedure'
  | 'Provenance'
  | 'Questionnaire'
  | 'QuestionnaireResponse'
  | 'RelatedPerson'
  | 'RequestGroup'
  | 'ResearchDefinition'
  | 'ResearchElementDefinition'
  | 'ResearchStudy'
  | 'ResearchSubject'
  | 'RiskAssessment'
  | 'RiskEvidenceSynthesis'
  | 'Schedule'
  | 'SearchParameter'
  | 'ServiceRequest'
  | 'Slot'
  | 'Specimen'
  | 'SpecimenDefinition'
  | 'StructureDefinition'
  | 'StructureMap'
  | 'Subscription'
  | 'Substance'
  | 'SubstanceNucleicAcid'
  | 'SubstancePolymer'
  | 'SubstanceProtein'
  | 'SubstanceReferenceInformation'
  | 'SubstanceSourceMaterial'
  | 'SubstanceSpecification'
  | 'SupplyDelivery'
  | 'SupplyRequest'
  | 'Task'
  | 'TerminologyCapabilities'
  | 'TestReport'
  | 'TestScript'
  | 'ValueSet'
  | 'VerificationResult'
  | 'VisionPrescription';

export interface SourceQuery extends Extension {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries';
  valueReference: Reference;
}

export interface QuestionnaireLevelXFhirQueryVariable extends Extension {
  url: 'http://hl7.org/fhir/StructureDefinition/variable';
  valueExpression: XFhirQueryVariableExpression;
}

interface XFhirQueryVariableExpression extends Expression {
  name: string;
  language: 'application/x-fhir-query';
  expression: string;
}

export interface VariableXFhirQuery {
  valueExpression: Expression;
  result?: FhirResource;
}

export interface Variables {
  fhirPathVariables: Record<string, Expression[]>;
  xFhirQueryVariables: Record<string, VariableXFhirQuery>;
}
