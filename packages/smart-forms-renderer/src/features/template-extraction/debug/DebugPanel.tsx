import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { DebugStep } from './types';

interface DebugPanelProps {
  steps: DebugStep[];
  questionnaireId: string;
}

export default function DebugPanel({ steps, questionnaireId }: DebugPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Template Extraction Debug Info
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Questionnaire ID: {questionnaireId}
      </Typography>
      {steps.map((step, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={step.status}
                color={getStatusColor(step.status)}
                size="small"
              />
              <Typography>{step.step}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(step.timestamp)}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {step.data && (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(step.data, null, 2)}
              </pre>
            )}
            {step.message && (
              <Typography color={step.status === 'error' ? 'error' : 'text.primary'}>
                {step.message}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
} 