import { IconButton, InputAdornment, Tooltip, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import Iconify from '../Iconify';
import { StyledRoot, StyledSearch } from './QuestionnaireListToolbar.styles';

interface Props {
  numSelected: number;
  searchInput: string;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
}

function QuestionnaireListToolbar(props: Props) {
  const { numSelected, searchInput, onSearch } = props;
  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter'
        })
      }}>
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <StyledSearch
          value={searchInput}
          onChange={onSearch}
          placeholder="Search questionnaires..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </StyledRoot>
  );
}

export default QuestionnaireListToolbar;
