import { Box, Typography, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { useExtractOperationStore } from '../stores/extractOperationStore.ts';

function TemplateExtractionDebug() {
  const extractionResult = useExtractOperationStore.use.extractionResult();
  const extractionError = useExtractOperationStore.use.extractionError();
  const debugInfo = useExtractOperationStore.use.debugInfo();
  const isExtractionStarted = useExtractOperationStore.use.isExtractionStarted();

  // Don't render anything if extraction hasn't started
  if (!isExtractionStarted) {
    return null;
  }

  const steps = [
    {
      label: 'Content Analysis',
      description: debugInfo?.contentAnalysis 
        ? `Detected: ${debugInfo.contentAnalysis.detectedSigns?.join(', ') || 'No vital signs detected'}\n` +
          `Confidence: ${debugInfo.contentAnalysis.confidence || 'N/A'}\n` +
          `Patterns: ${debugInfo.contentAnalysis.patterns?.join(', ') || 'No patterns identified'}`
        : 'Analyzing questionnaire content...'
    },
    {
      label: 'Field Mapping',
      description: debugInfo?.fieldMapping
        ? `Mapped fields: ${JSON.stringify(debugInfo.fieldMapping.mappedFields, null, 2)}\n` +
          `Assumptions: ${debugInfo.fieldMapping.assumptions?.join(', ') || 'None'}\n` +
          `Alternatives: ${debugInfo.fieldMapping.alternatives?.join(', ') || 'None'}`
        : 'Mapping questionnaire fields...'
    },
    {
      label: 'Value Processing',
      description: debugInfo?.valueProcessing
        ? `Processed values: ${JSON.stringify(debugInfo.valueProcessing.values, null, 2)}\n` +
          `Transformations: ${debugInfo.valueProcessing.transformations?.join(', ') || 'None'}\n` +
          `Quality checks: ${JSON.stringify(debugInfo.valueProcessing.qualityChecks, null, 2)}`
        : 'Processing extracted values...'
    },
    {
      label: 'Result Generation',
      description: extractionResult 
        ? `Successfully generated ${extractionResult.contained?.length || 0} observations\n` +
          (debugInfo?.resultGeneration?.warnings?.length 
            ? `Warnings: ${debugInfo.resultGeneration.warnings.join(', ')}`
            : '') +
          (extractionResult.contained?.length 
            ? `\n\nObservations:\n${JSON.stringify(extractionResult.contained, null, 2)}`
            : '')
        : extractionError || 'Failed to generate observations'
    }
  ];

  return (
    <Box sx={{ maxWidth: 400, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Template Extraction Debug
      </Typography>
      <Stepper orientation="vertical">
        {steps.map((step) => (
          <Step key={step.label} active={true}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography sx={{ whiteSpace: 'pre-line' }}>{step.description}</Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default TemplateExtractionDebug; 