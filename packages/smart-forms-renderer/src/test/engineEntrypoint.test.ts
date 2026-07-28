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
 * `src/engine.ts` is the published headless entrypoint (`@aehrc/smart-forms-renderer/engine`).
 * Its contract is that it works without a DOM, so no UI library may enter its transitive
 * import graph. These tests walk that graph statically and fail if one does, which is what
 * stops the entrypoint regressing the next time a util reaches for a component or a hook.
 */

const SRC_DIR = path.resolve(__dirname, '..');
const ENGINE_ENTRYPOINT = path.join(SRC_DIR, 'engine.ts');

/** Packages that would make the engine graph DOM-bound or pull in a UI tree. */
const FORBIDDEN_PACKAGES = [
  '@emotion/react',
  '@emotion/styled',
  '@fontsource/inter',
  '@fontsource/material-icons',
  '@fontsource/roboto',
  '@mui/icons-material',
  '@mui/lab',
  '@mui/material',
  '@mui/x-date-pickers',
  '@tanstack/react-query',
  'html-react-parser',
  'react-beautiful-dnd',
  'react-dnd',
  'react-dnd-html5-backend',
  'react-dom',
  'react-markdown',
  'style-to-js',
  'usehooks-ts'
];

const CANDIDATE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Matches the module specifier of any static `import`/`export ... from` declaration, capturing
 * whether the declaration was type-only (`import type` / `export type`).
 */
const SPECIFIER_REGEX = /(?:^|\n)\s*(?:import|export)\s+(type\s+)?[\s\S]*?from\s+['"]([^'"]+)['"]/g;

/** Matches a bare `import 'x'` side effect declaration. */
const BARE_IMPORT_REGEX = /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;

interface Specifier {
  specifier: string;

  /**
   * True for `import type` / `export type` declarations, which TypeScript erases entirely, so
   * they never reach a bundle. They still bind a consumer at typecheck time, which is why they
   * are tracked separately rather than ignored. Inline `import { type Foo }` specifiers are not
   * detected and count as value imports, which errs on the strict side.
   */
  typeOnly: boolean;
}

function readSpecifiers(filePath: string): Specifier[] {
  const source = fs.readFileSync(filePath, 'utf8');
  const specifiers: Specifier[] = [];

  SPECIFIER_REGEX.lastIndex = 0;
  let match = SPECIFIER_REGEX.exec(source);
  while (match !== null) {
    specifiers.push({ specifier: match[2], typeOnly: match[1] !== undefined });
    match = SPECIFIER_REGEX.exec(source);
  }

  BARE_IMPORT_REGEX.lastIndex = 0;
  match = BARE_IMPORT_REGEX.exec(source);
  while (match !== null) {
    specifiers.push({ specifier: match[1], typeOnly: false });
    match = BARE_IMPORT_REGEX.exec(source);
  }

  return specifiers;
}

function resolveRelative(fromFile: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(fromFile), specifier);

  for (const extension of CANDIDATE_EXTENSIONS) {
    const candidate = base + extension;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  for (const extension of CANDIDATE_EXTENSIONS) {
    const candidate = path.join(base, 'index' + extension);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

interface EngineGraph {
  /** Every source file reachable from `src/engine.ts`, as a path relative to `src`. */
  files: string[];

  /** Every bare (non-relative) specifier reachable from `src/engine.ts`, with its importer. */
  packageImports: { specifier: string; importer: string; typeOnly: boolean }[];
}

/**
 * Two graphs matter, and they answer different questions.
 *
 * - `followTypeOnly: false` is the **runtime** graph: what actually loads, and therefore what
 *   can reach a bundle. Type-only edges are erased by TypeScript, so following one would report
 *   a module as loaded when only its types are used.
 * - `followTypeOnly: true` is the **type surface**: what a consumer must be able to resolve in
 *   order to typecheck against the entrypoint. A type-only edge is load-bearing here, because
 *   the published `.d.ts` closure still refers through it.
 *
 * Asserting only the first is how a type-only barrel import can silently couple the engine's
 * public types to a UI library without any test noticing.
 */
function collectEngineGraph(followTypeOnly: boolean): EngineGraph {
  const visited = new Set<string>([ENGINE_ENTRYPOINT]);
  const queue = [ENGINE_ENTRYPOINT];
  const packageImports: { specifier: string; importer: string; typeOnly: boolean }[] = [];
  const unresolved: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    const importer = path.relative(SRC_DIR, current);

    for (const { specifier, typeOnly } of readSpecifiers(current)) {
      if (specifier.startsWith('.')) {
        const resolved = resolveRelative(current, specifier);
        if (resolved === null) {
          unresolved.push(importer + ' -> ' + specifier);
          continue;
        }

        if (typeOnly && !followTypeOnly) {
          continue;
        }

        if (!visited.has(resolved)) {
          visited.add(resolved);
          queue.push(resolved);
        }
        continue;
      }

      packageImports.push({ specifier, importer, typeOnly });
    }
  }

  // A specifier this walk cannot resolve is a hole in the check, so surface it rather than pass.
  expect(unresolved).toEqual([]);

  return {
    files: [...visited].map((file) => path.relative(SRC_DIR, file)).sort(),
    packageImports
  };
}

describe('headless engine entrypoint', () => {
  const graph = collectEngineGraph(false);
  const typeSurface = collectEngineGraph(true);

  it('reaches at least the stores and utils it re-exports', () => {
    expect(graph.files).toContain('engine.ts');
    expect(graph.files).toContain('stores/questionnaireStore.ts');
    expect(graph.files).toContain('utils/manageForm.ts');
    expect(graph.files).toContain('utils/extractObservation.ts');
  });

  const isForbidden = (specifier: string) =>
    FORBIDDEN_PACKAGES.some(
      (forbidden) => specifier === forbidden || specifier.startsWith(forbidden + '/')
    );

  it('does not import any UI library at runtime', () => {
    const offenders = graph.packageImports
      .filter(({ specifier, typeOnly }) => !typeOnly && isForbidden(specifier))
      .map(({ specifier, importer }) => importer + ' imports ' + specifier);

    expect([...new Set(offenders)].sort()).toEqual([]);
  });

  /**
   * The entrypoint's **type surface** is wider than its runtime graph, and a consumer feels the
   * difference: these packages must be resolvable to typecheck against `/engine`, even though
   * none of them load at runtime.
   *
   * The root cause is one type-only edge. `RendererConfig` (exported here, because
   * `BuildFormParams` accepts it) keys its breakpoint values by Material UI's `Breakpoint`, and
   * reaches `UseResponsiveProps` through the `../hooks` barrel, which pulls the rest of that
   * barrel's type closure with it.
   *
   * Keeping the Material UI breakpoint types is deliberate: `Breakpoint` is augmentable through
   * `BreakpointOverrides` so a consumer can pass a custom breakpoint, which `useResponsive`
   * documents as supported. Narrowing it to a fixed union would remove that.
   *
   * The rest is incidental, and narrowing the `../hooks` barrel import to the specific module
   * would shrink this list. That is worth doing and is not done here.
   *
   * Pinned rather than banned so the set cannot grow unnoticed. Anything added here is a
   * decision, not something a consumer should discover.
   */
  it('pins the UI packages a consumer needs in order to typecheck', () => {
    const offenders = typeSurface.packageImports
      .filter(({ specifier }) => isForbidden(specifier))
      .map(({ specifier }) => specifier);

    expect([...new Set(offenders)].sort()).toEqual([
      '@mui/material',
      '@mui/material/styles',
      '@mui/material/useMediaQuery',
      '@tanstack/react-query',
      'html-react-parser',
      'html-react-parser/lib/attributes-to-props'
    ]);
  });

  it('does not reach any component or theme module', () => {
    const offenders = graph.files.filter(
      (file) => file.startsWith('components/') || file.startsWith('theme/')
    );

    expect(offenders).toEqual([]);
  });
});
