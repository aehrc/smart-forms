import { render } from '@testing-library/react';
import { test } from 'vitest';
import { BaseRenderer } from '@aehrc/smart-forms-renderer';

test('Basic component renders correctly', async () => {
  render(<BaseRenderer />);
});
