import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  getFhirPatchParametersDisplays,
  getMethodLabel,
  getResourceDisplay
} from '../utils/extractedBundleSelector.ts';
import type { Bundle, FhirResource } from 'fhir/r4';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';

interface WriteBackBundleSelectorProps {
  bundle: Bundle;
}
export default function WriteBackBundleSelector(props: WriteBackBundleSelectorProps) {
  const { bundle } = props;

  const bundleEntries = bundle.entry || [];

  const [open, setOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<number[]>(
    // Initially select all entries
    Array.from({ length: bundleEntries.length }, (_, i) => i)
  );

  const handleToggle = (index: number) => {
    const currentIndex = selectedEntries.indexOf(index);
    const newSelected = [...selectedEntries];

    if (currentIndex === -1) {
      newSelected.push(index);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedEntries(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === bundleEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(Array.from({ length: bundleEntries.length }, (_, i) => i));
    }
  };

  const handleGenerateBundle = () => {
    const modifiedBundle = {
      ...bundle,
      entry: bundleEntries.filter((_, index) => selectedEntries.includes(index))
    };

    console.log('Modified FHIR Bundle:', JSON.stringify(modifiedBundle, null, 2));
    console.log(`Selected ${selectedEntries.length} out of ${bundleEntries.length} entries`);
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} size="small">
        Configure FHIR Bundle ({bundleEntries.length} entries)
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Select Bundle Entries (WIP)</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box mb={2}>
            <Button onClick={handleSelectAll} variant="outlined" size="small">
              {selectedEntries.length === bundleEntries.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedEntries.length} of {bundleEntries.length} entries selected
            </Typography>
          </Box>

          <List>
            {bundleEntries.map((bundleEntry, index) => {
              const isSelected = selectedEntries.includes(index);
              const resource = bundleEntry.resource;
              const request = bundleEntry.request;

              if (!resource || !resource.resourceType || !request) {
                return null; // Skip entries without resource or request
              }

              // Get resourceType
              let resourceType = resource.resourceType;
              if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
                resourceType = request.url.split('/')[0] as FhirResource['resourceType'];
              }

              // Get resource displays based on whether it's a FHIRPatch or not
              const resourceDisplays: string[] = [];
              if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
                const resourceTypeFromRequest = request.url.split('/')[0];
                resourceDisplays.push(
                  ...getFhirPatchParametersDisplays(
                    resource,
                    resourceTypeFromRequest as FhirResource['resourceType']
                  )
                );
              } else {
                resourceDisplays.push(getResourceDisplay(resource));
              }

              return (
                <React.Fragment key={index}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleToggle(index)} dense>
                      <ListItemIcon>
                        <Checkbox edge="start" checked={isSelected} tabIndex={-1} disableRipple />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" component="span">
                              {resourceType}
                            </Typography>
                            <Chip
                              label={getMethodLabel(request.method)}
                              size="small"
                              sx={{
                                textTransform: 'lowercase',
                                height: '20px',
                                fontSize: '0.75rem'
                              }}
                              color="primary"
                            />
                            {resource.id && (
                              <Chip label={`ID: ${resource.id}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box py={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>URL:</strong> {request.url} // Change to actual name?
                            </Typography>
                            {resourceDisplays.map((resourceDisplay) => (
                              <Typography
                                key={resourceDisplay}
                                variant="body2"
                                color="text.secondary">
                                <strong>{resourceDisplay}</strong>
                              </Typography>
                            ))}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < bundleEntries.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateBundle}
            variant="contained"
            disabled={selectedEntries.length === 0}>
            Generate Bundle ({selectedEntries.length} entries)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
