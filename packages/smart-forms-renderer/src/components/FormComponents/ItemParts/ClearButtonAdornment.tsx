import { IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useRendererConfigStore } from '../../../stores';

interface ClearButtonAdornmentProps {
  readOnly: boolean;
  onClear: () => void;
}

export function ClearButtonAdornment(props: ClearButtonAdornmentProps) {
  const { readOnly, onClear } = props;

  const clearLabel = useRendererConfigStore.use.rendererStrings().clear;

  if (readOnly) {
    return null;
  }

  return (
    <IconButton
      aria-hidden="true"
      tabIndex={-1}
      size="small"
      title={clearLabel}
      onClick={(e) => {
        onClear();

        // Manually re-focus the input field
        const input = e.currentTarget.closest('.MuiOutlinedInput-root')?.querySelector('input');
        if (input) {
          input.focus();
        }
      }}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent the button from stealing focus
      }}
      className="StandardTextField-clearIndicator"
      sx={{
        p: 0.5
      }}>
      <ClearIcon fontSize="small" />
    </IconButton>
  );
}
