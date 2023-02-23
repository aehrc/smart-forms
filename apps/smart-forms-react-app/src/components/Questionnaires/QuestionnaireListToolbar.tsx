import { IconButton, InputAdornment, Tooltip, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import Iconify from '../Iconify';
import { StyledRoot, StyledSearch } from './QuestionnaireListToolbar.styles';
import { QuestionnaireListItem } from '../../interfaces/Interfaces';

interface Props {
  selected: QuestionnaireListItem | undefined;
  searchInput: string;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function QuestionnaireListToolbar(props: Props) {
  const { selected, searchInput, clearSelection, onSearch } = props;
  return (
    <StyledRoot
      sx={{
        ...(selected && {
          color: 'primary.main',
          bgcolor: 'primary.lighter'
        })
      }}>
      {selected ? (
        <Typography component="div" variant="subtitle1">
          {selected.title} selected
        </Typography>
      ) : (
        <StyledSearch
          value={searchInput}
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
        />
      )}

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
