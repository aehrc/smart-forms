import React, { useState } from 'react';
import resources from '../data/resources.json';
import { Button, Divider, FormControl, MenuItem, Select, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { slugify } from './qform/functions/StringFunctions';

function ResourcePicker() {
  const resourceList = resources.resourceList;
  const [resource, setResource] = useState(resourceList[0].questionnaire);
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <Typography variant="h1" fontWeight="bold" fontSize={36} color="#8fc9f9">
        Select a Questionnaire
      </Typography>
      <Divider sx={{ mt: 2, mb: 4 }} />
      <FormControl>
        <Select
          name="Resource Picker"
          value={resource}
          sx={{ borderRadius: 2 }}
          onChange={(event) => setResource(event.target.value)}>
          {resourceList.map((resource) => (
            <MenuItem key={resource.questionnaire} value={resource.questionnaire}>
              {resource.questionnaire}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={() => navigate(`/form/${slugify(resource)}`)}
        sx={{ borderRadius: 20, py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
        Go to Questionnaire
        <ArticleIcon sx={{ ml: 1.5 }} />
      </Button>
    </React.Fragment>
  );
}

export default ResourcePicker;
