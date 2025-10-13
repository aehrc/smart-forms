import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

/**
 * Styling utility to apply a glowing highlight effect to MUI input fields.
 *
 * - Intended for use **only within MUI's `sx` prop**.
 * - Applies a temporary glow using the `success` color palette from the theme.
 * - Typically used when calculated expressions, dynamic ValueSets, or other evaluated expressions update the field's value
 *   e.g. in response to `calculatedExpression`, `answerExpression`, or `dynamicValueSet` changes.
 *
 * Example usage with a single style object:
 * ```tsx
 * <TextField sx={glowEffect(fadeIn)} />
 * ```
 *
 * Example usage combining with other styles using array syntax:
 * ```tsx
 * <Autocomplete
 *   sx={[
 *     glowEffect(fadeIn),
 *     {
 *       maxWidth: 300,
 *       minWidth: 160,
 *       flexGrow: 1,
 *       // other custom styles here
 *     }
 *   ]}
 * />
 * ```
 *
 * @param fadeIn - Whether the glow effect should be applied.
 * @returns A function that takes the MUI theme and returns the appropriate `sx` style object.
 */
export const expressionUpdateFadingGlow = (fadeIn: boolean) => (theme: Theme) => ({
  '& .MuiInputBase-root': {
    transition: 'all 1s ease',
    ...(fadeIn && {
      boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.5)}`,
      backgroundColor: alpha(theme.palette.success.main, 0.05),
      '& fieldset': {
        border: `2px solid ${alpha(theme.palette.success.main, 0.7)}`
      }
    })
  }
});
