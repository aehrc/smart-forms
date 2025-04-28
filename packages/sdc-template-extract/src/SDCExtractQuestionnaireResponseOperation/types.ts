// Types and interfaces for SDC Extract operation

import type { QuestionnaireResponse, Resource, Bundle, OperationOutcome, Observation, Element, Extension } from 'fhir/r4';

export interface ExtractInputParameters {
  questionnaireResponse: QuestionnaireResponse;
  // Optionally, allow passing the Questionnaire directly if not resolvable by reference
  questionnaire?: Resource;
}

export interface DebugInfo {
  contentAnalysis: {
    detectedTemplates: string[];
    patterns: string[];
    confidence: string;
  };
  fieldMapping: {
    mappedFields: Record<string, any>;
    assumptions: string[];
    alternatives: string[];
  };
  valueProcessing: {
    values: Record<string, any>;
    transformations: string[];
    qualityChecks: Array<{
      check: string;
      passed: boolean;
      message: string;
    }>;
    datetime?: {
      source: 'static' | 'dynamic' | 'fallback';
      expression?: string;
      value?: string;
      originalValue?: string;
    };
  };
  resultGeneration: {
    status: string;
    observations: Observation[];
    warnings?: string[];
  };
}

export interface ExtendedElement extends Element {
  extension?: Extension[];
}

export interface ExtendedObservation extends Observation {
  _effectiveDateTime?: ExtendedElement;
  _issued?: ExtendedElement;
  _valueBoolean?: ExtendedElement;
}

export interface ExtractOutputParameters {
  // The extracted resource(s) (could be a single resource or a Bundle)
  result: Resource | Bundle | null;
  // Any issues or warnings encountered during extraction
  issues?: OperationOutcome;
  // Optional debug information for diagnostics
  debugInfo?: DebugInfo;
  // Error message if extraction failed
  error?: string;
} 