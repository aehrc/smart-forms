import { Box, IconButton, InputAdornment, Tooltip, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import Iconify from '../../../Misc/Iconify';
import { StyledRoot, StyledSearch } from './QuestionnaireListToolbar.styles';
import type { QuestionnaireListItem } from '../../../../interfaces/Interfaces';
import { StyledAlert } from '../../../StyledComponents/Nav.styles';

interface Props {
  selected: QuestionnaireListItem | undefined;
  searchInput: string;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function QuestionnaireListToolbar(props: Props) {
  const { selected, searchInput, clearSelection, onSearch } = props;

  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <StyledRoot
      sx={{
        ...(selected && {
          color: 'primary.main',
          bgcolor: 'pale.primary'
        })
      }}>
      {selected ? (
        <Typography component="div" variant="subtitle1">
          {selected.title} selected
        </Typography>
      ) : (
        <StyledSearch
          value={searchInput}
          onFocus={() => setAlertVisible(false)}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          placeholder="Search questionnaires..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
          data-test="search-field-questionnaires"
        />
      )}
      {alertVisible && !selected ? (
        <StyledAlert color="info">
          <Box>
            <Typography variant="subtitle2">
              {'Looking for something else? Refine your search in the search bar.'}
            </Typography>
          </Box>
        </StyledAlert>
      ) : null}

      {selected ? (
        <Tooltip title="Clear">
          <IconButton onClick={clearSelection}>
            <Iconify icon="ic:baseline-clear" />
          </IconButton>
        </Tooltip>
      ) : null}
    </StyledRoot>
  );
}

export default QuestionnaireListToolbar;
