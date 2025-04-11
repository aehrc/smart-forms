# Template-Based Extraction Implementation Plan

## Overview
This document outlines the implementation plan for template-based extraction in the Smart Forms application. Template-based extraction allows creating FHIR resources from questionnaire responses using predefined templates stored in the questionnaire's `contained` array.

## Component Structure
```
src/
  features/
    playground/
      components/
        ExtractMenu/
          - ExtractMenu.tsx (main component)
          - TemplateExtractButton.tsx (new component)
      stores/
        - templateExtractStore.ts (new store)
      types/
        - templateExtract.types.ts (new types)
      utils/
        - templateExtractUtils.ts (new utilities)
```

## Implementation Steps

### 1. Template Processing Logic
```typescript
interface TemplateProcessor {
  // Process FHIRPath expressions in templates
  processTemplateExpressions(template: Resource, questionnaireResponse: QuestionnaireResponse): Resource;
  
  // Handle different types of template values
  processValueExpression(expression: string, context: any): any;
  
  // Create transaction bundle from extracted resources
  createTransactionBundle(resources: Resource[]): Bundle;
}
```

### 2. Template Extraction Store
```typescript
interface TemplateExtractState {
  isExtracting: boolean;
  extractedResources: Resource[];
  error: string | null;
}
```

### 3. Implementation Flow
1. User clicks "Template-based $extract" button
2. System checks if form has templates in `contained` array
3. For each template:
   - Process FHIRPath expressions
   - Replace template values with actual form data
   - Create new resource instance
4. Create transaction bundle with all resources
5. Update store with results
6. Show success/error notification

### 4. Testing Strategy
- Unit tests for template processing
- Integration tests for full extraction flow
- Test cases for:
  - Simple templates (single value)
  - Complex templates (multiple values)
  - Error cases (invalid expressions)
  - Edge cases (missing values)

### 5. Error Handling
- Invalid FHIRPath expressions
- Missing required values
- Template validation errors
- Resource creation errors

### 6. Integration Points
- Connect with existing Playground component
- Integrate with existing notification system
- Use existing FHIR resource types
- Leverage existing FHIRPath processing

### 7. Documentation Needs
- Template format documentation
- FHIRPath expression examples
- Error handling documentation
- Usage examples

### 8. Future Considerations
- Support for template inheritance
- Template validation
- Template versioning
- Performance optimization for large templates

### 9. Dependencies to Add
- FHIRPath expression evaluator
- FHIR resource validator
- Template processing utilities

## Example Template Structure
```json
{
  "resourceType": "Observation",
  "id": "height-obs",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "vital-signs"
    }]
  }],
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "8302-2",
      "display": "Body height"
    }]
  },
  "valueQuantity": {
    "value": "%patient-height.value",
    "unit": "cm",
    "system": "http://unitsofmeasure.org"
  }
}
```

## FHIRPath Expression Processing
1. Identify FHIRPath expressions in template (e.g., `%patient-height.value`)
2. Extract expression path
3. Evaluate expression against questionnaire response
4. Replace expression with actual value
5. Validate resulting resource

## Resource Creation Process
1. Clone template resource
2. Process all FHIRPath expressions
3. Validate resource structure
4. Add to transaction bundle
5. Handle resource references

## Error Handling Strategy
1. Template Validation
   - Check required fields
   - Validate FHIRPath expressions
   - Verify resource structure

2. Expression Processing
   - Handle missing values
   - Type conversion errors
   - Invalid expressions

3. Resource Creation
   - Validation errors
   - Reference resolution
   - Bundle creation

## Performance Considerations
1. Template Caching
   - Cache processed templates
   - Update on template changes

2. Expression Optimization
   - Pre-compile expressions
   - Batch process similar expressions

3. Resource Creation
   - Parallel processing where possible
   - Optimize bundle creation

## Security Considerations
1. Template Validation
   - Sanitize FHIRPath expressions
   - Validate resource references
   - Check for malicious content

2. Resource Access
   - Validate resource permissions
   - Handle sensitive data appropriately

## Maintenance Plan
1. Regular Updates
   - Keep FHIRPath processor updated
   - Update template examples
   - Maintain documentation

2. Monitoring
   - Track usage patterns
   - Monitor performance
   - Log errors and issues

3. Support
   - Provide troubleshooting guides
   - Document common issues
   - Create user guides 