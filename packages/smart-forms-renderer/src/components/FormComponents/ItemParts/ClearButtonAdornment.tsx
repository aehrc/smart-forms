import { IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

interface ClearButtonAdornmentProps {
  readOnly: boolean;
  onClear: () => void;
}

export function ClearButtonAdornment(props: ClearButtonAdornmentProps) {
  const { readOnly, onClear } = props;

  if (readOnly) {
    return null;
  }

  return (
    <span title="Clear">
      <IconButton
        size="small"
        tabIndex={-1}
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
    </span>
  );
}
