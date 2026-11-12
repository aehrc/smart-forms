/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';

/**
 * The package's `exports` map has no directory-index fallback: `./lib/*` mapping to
 * `./lib/*.js` cannot resolve a directory barrel like `lib/stores` via its `index.js`, so
 * every directory barrel must be enumerated explicitly. Nothing else keeps that enumeration
 * in sync with the source tree: add a new directory with an `index.ts` and its barrel
 * silently stops resolving for consumers. This test is the sync guard.
 */

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const SRC_DIR = path.resolve(__dirname, '..');

/** Directories tsconfig/.npmignore keep out of `lib/`, so they need no exports entry. */
const UNPUBLISHED_DIRECTORIES = new Set(['stories', 'test', 'tests']);

/** Every directory under `src/` (as a relative path) that has an `index.ts`/`index.tsx` barrel. */
function collectBarrelDirectories(directory: string): string[] {
  const barrels: string[] = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (UNPUBLISHED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      barrels.push(...collectBarrelDirectories(path.join(directory, entry.name)));
      continue;
    }

    if (entry.name === 'index.ts' || entry.name === 'index.tsx') {
      barrels.push(path.relative(SRC_DIR, directory));
    }
  }

  return barrels.sort();
}

describe('package.json exports map', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  const exportsMap: Record<string, unknown> = packageJson.exports;

  it('declares the root, lib and engine entrypoints', () => {
    expect(exportsMap['.']).toBeDefined();
    expect(exportsMap['./lib']).toBeDefined();
    expect(exportsMap['./engine']).toBeDefined();
  });

  it('enumerates every published directory barrel under lib/', () => {
    // The root barrel is `src/index.ts` itself, covered by the "." and "./lib" entries above.
    const barrelDirectories = collectBarrelDirectories(SRC_DIR).filter(
      (directory) => directory !== ''
    );

    const missing = barrelDirectories.filter(
      (directory) => exportsMap[`./lib/${directory}`] === undefined
    );

    expect(missing).toEqual([]);
  });
});
