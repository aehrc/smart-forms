import { Box, Typography, Stepper, Step, StepLabel, StepContent, Chip, Stack, Divider } from '@mui/material';
import { useExtractOperationStore } from '../stores/extractOperationStore.ts';

// Helper function to get appropriate chip color based on pattern type
const getPatternColor = (pattern: string): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  if (pattern.toLowerCase().includes('blood pressure') || pattern.toLowerCase() === 'bp measurement') {
    return 'primary';
  } else if (pattern.toLowerCase().includes('systolic')) {
    return 'info';
  } else if (pattern.toLowerCase().includes('diastolic')) {
    return 'info';
  } else if (pattern.toLowerCase().includes('height')) {
    return 'success';
  } else if (pattern.toLowerCase().includes('weight')) {
    return 'success';
  } else {
    return 'secondary';
  }
};

function TemplateExtractionDebug() {
  const extractionResult = useExtractOperationStore.use.extractionResult();
  const extractionError = useExtractOperationStore.use.extractionError();
  const debugInfo = useExtractOperationStore.use.debugInfo();
  const isExtractionStarted = useExtractOperationStore.use.isExtractionStarted();

  // Don't render anything if extraction hasn't started
  if (!isExtractionStarted) {
    return null;
  }

  // Helper to render content in a more organized way
  const renderTemplateValidation = () => {
    if (!debugInfo?.contentAnalysis) return 'Validating template configuration...';
    
    // Separate resource templates from clinical patterns
    const resourceTemplates = debugInfo.contentAnalysis.patterns?.filter((p: string) => 
      p.includes(':')
    ) || [];
    
    const clinicalPatterns = debugInfo.contentAnalysis.patterns?.filter((p: string) => 
      !p.includes(':') && p.includes('Measurement')
    ) || [];
    
    return (
      <>
        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
          Resource Templates:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5, mb: 1 }}>
          {debugInfo.contentAnalysis.detectedTemplates?.length 
            ? debugInfo.contentAnalysis.detectedTemplates.map((template: string) => (
                <Chip key={template} label={template} size="small" color="primary" variant="outlined" />
              ))
            : <Typography variant="body2" color="text.secondary">No templates detected</Typography>
          }
        </Stack>
        
        {clinicalPatterns.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Detected Measurement Patterns:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5, mb: 1 }}>
              {clinicalPatterns.map((pattern: string) => (
                <Chip 
                  key={pattern} 
                  label={pattern} 
                  size="small" 
                  color={getPatternColor(pattern)}
                  variant="outlined" 
                />
              ))}
            </Stack>
          </>
        )}
        
        <Divider sx={{ my: 1 }} />
        <Typography>
          Validation Status: <strong>{debugInfo.contentAnalysis.confidence || 'N/A'}</strong>
        </Typography>
      </>
    );
  };

  const renderFieldMapping = () => {
    if (!debugInfo?.fieldMapping) return 'Processing field mappings...';
    
    const fields = Object.keys(debugInfo.fieldMapping.mappedFields || {});
    
    return (
      <>
        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
          Template Fields:
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {fields.length ? fields.join(', ') : 'No fields mapped'}
        </Typography>
        
        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
          Pattern Analysis:
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {debugInfo.fieldMapping.assumptions?.map((assumption: string, index: number) => {
            // Get appropriate color based on matched patterns
            const patternMatch = debugInfo.contentAnalysis.patterns?.find((pattern: string) => 
              assumption.toLowerCase().includes(pattern.toLowerCase())
            );
            
            const color = patternMatch ? getPatternColor(patternMatch) : 'text.primary';
            
            return (
              <Typography 
                key={index} 
                variant="body2" 
                color={color === 'text.primary' ? color : `${color}.main`}
              >
                • {assumption}
              </Typography>
            );
          }) || <Typography variant="body2" color="text.secondary">No patterns detected</Typography>}
        </Stack>
        
        {debugInfo.fieldMapping.alternatives?.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Alternatives:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {debugInfo.fieldMapping.alternatives.join(', ')}
            </Typography>
          </>
        )}
        
        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
          Field Details:
        </Typography>
        <Box 
          component="pre" 
          sx={{ 
            mt: 0.5, 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1, 
            fontSize: '0.75rem',
            maxHeight: '150px',
            overflow: 'auto'
          }}
        >
          {JSON.stringify(debugInfo.fieldMapping.mappedFields, null, 2)}
        </Box>
      </>
    );
  };

  const steps = [
    {
      label: 'Template Validation',
      description: renderTemplateValidation()
    },
    {
      label: 'Field Mapping',
      description: renderFieldMapping()
    },
    {
      label: 'Value Extraction',
      description: debugInfo?.valueProcessing
        ? (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Extracted Values:
            </Typography>
            <Box 
              component="pre" 
              sx={{ 
                mt: 0.5, 
                p: 1, 
                bgcolor: 'grey.100', 
                borderRadius: 1, 
                fontSize: '0.75rem',
                maxHeight: '150px',
                overflow: 'auto'
              }}
            >
              {JSON.stringify(debugInfo.valueProcessing.values, null, 2)}
            </Box>
            
            {debugInfo.valueProcessing.datetime && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  DateTime Handling:
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2">
                    Source: <Chip 
                      size="small" 
                      color={debugInfo.valueProcessing.datetime.source === 'dynamic' ? 'success' : 'primary'} 
                      label={debugInfo.valueProcessing.datetime.source || 'unknown'}
                    />
                  </Typography>
                  {debugInfo.valueProcessing.datetime.expression && (
                    <Typography variant="body2">
                      Expression: {debugInfo.valueProcessing.datetime.expression}
                    </Typography>
                  )}
                  {debugInfo.valueProcessing.datetime.value && (
                    <Typography variant="body2">
                      Value: {debugInfo.valueProcessing.datetime.value}
                    </Typography>
                  )}
                  {debugInfo.valueProcessing.datetime.originalValue && (
                    <Typography variant="body2">
                      Original: {debugInfo.valueProcessing.datetime.originalValue}
                    </Typography>
                  )}
                </Box>
              </>
            )}
            
            {debugInfo.valueProcessing.transformations?.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Transformations Applied:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5, mb: 1 }}>
                  {debugInfo.valueProcessing.transformations.map((transform: string, index: number) => (
                    <Chip key={index} label={transform} size="small" color="info" />
                  ))}
                </Stack>
              </>
            )}
            
            {debugInfo.valueProcessing.qualityChecks && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Validation Results:
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    mt: 0.5, 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}
                >
                  {JSON.stringify(debugInfo.valueProcessing.qualityChecks, null, 2)}
                </Box>
              </>
            )}
          </>
        )
        : 'Extracting values from questionnaire response...'
    },
    {
      label: 'Observation Generation',
      description: extractionResult 
        ? `Successfully generated ${extractionResult.contained?.length || 0} observations\n` +
          (debugInfo?.resultGeneration?.warnings?.length 
            ? `Warnings: ${debugInfo.resultGeneration.warnings.join(', ')}`
            : '') +
          (extractionResult.contained?.length 
            ? `\n\nGenerated Observations:\n${JSON.stringify(extractionResult.contained, null, 2)}`
            : '')
        : extractionError || 'Failed to generate observations'
    }
  ];

  return (
    <Box sx={{ maxWidth: 600, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Template Extraction Debug
      </Typography>
      <Stepper orientation="vertical">
        {steps.map((step) => (
          <Step key={step.label} active={true}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              {typeof step.description === 'string' 
                ? <Typography sx={{ whiteSpace: 'pre-line' }}>{step.description}</Typography>
                : step.description}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default TemplateExtractionDebug; 