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

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

/**
 * `src/engine.ts` is the published headless entrypoint (`@aehrc/smart-forms-renderer/engine`).
 * Its contract is that it works without a DOM, so no UI library may enter its transitive
 * runtime import graph. These tests cruise that graph with dependency-cruiser and fail if one
 * does, which is what stops the entrypoint regressing the next time a util reaches for a
 * component or a hook.
 *
 * dependency-cruiser ships as ESM only, and this jest setup is CommonJS, so the tests drive
 * its CLI (JSON reporter) instead of importing its API.
 */

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

/**
 * dependency-cruiser's exports map does not expose its bin scripts to `require.resolve`, so
 * locate the `depcruise` shim npm links into `node_modules/.bin`, walking up from the package
 * to wherever the workspace hoisted it.
 */
function resolveDepcruiseBin(): string {
  let directory = PACKAGE_ROOT;
  for (;;) {
    const candidate = path.join(directory, 'node_modules', '.bin', 'depcruise');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error('Could not find the depcruise binary in any node_modules/.bin.');
    }
    directory = parent;
  }
}

const DEPCRUISE_BIN = resolveDepcruiseBin();

/** The slice of dependency-cruiser's JSON output these tests read. */
interface CruisedModule {
  source: string;
  dependencies: { module: string }[];
}
const SRC_DIR = path.resolve(__dirname, '..');
const ENGINE_ENTRYPOINT = path.join(SRC_DIR, 'engine.ts');
const ROOT_BARREL = path.join(SRC_DIR, 'index.ts');

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

const isForbidden = (specifier: string) =>
  FORBIDDEN_PACKAGES.some(
    (forbidden) => specifier === forbidden || specifier.startsWith(forbidden + '/')
  );

/**
 * Cruises the engine entrypoint's import graph. Two graphs matter, and they answer different
 * questions:
 *
 * - `tsPreCompilationDeps: false` is the **runtime** graph: what actually loads, and therefore
 *   what can reach a bundle. TypeScript erases type-only imports, so they are excluded.
 * - `tsPreCompilationDeps: true` is the **type surface**: what a consumer must be able to
 *   resolve in order to typecheck against the entrypoint, because the published `.d.ts`
 *   closure still refers through type-only edges.
 */
function cruiseEngine(tsPreCompilationDeps: boolean): CruisedModule[] {
  const args = [
    '--no-config',
    '--output-type',
    'json',
    '--do-not-follow',
    'node_modules',
    ...(tsPreCompilationDeps ? ['--ts-pre-compilation-deps'] : []),
    path.relative(PACKAGE_ROOT, ENGINE_ENTRYPOINT)
  ];

  const stdout = execFileSync(DEPCRUISE_BIN, args, {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });

  return (JSON.parse(stdout) as { modules: CruisedModule[] }).modules;
}

/** The bare (non-relative) specifiers imported by the cruised source files. */
function packageImports(modules: CruisedModule[]): string[] {
  const specifiers = modules
    .filter((module) => !module.source.includes('node_modules'))
    .flatMap((module) => module.dependencies.map((dependency) => dependency.module))
    .filter((specifier) => !specifier.startsWith('.'));

  return [...new Set(specifiers)].sort();
}

describe('headless engine entrypoint', () => {
  let runtimeModules: CruisedModule[];
  let typeSurfaceModules: CruisedModule[];

  beforeAll(() => {
    runtimeModules = cruiseEngine(false);
    typeSurfaceModules = cruiseEngine(true);
  });

  it('reaches at least the stores and utils it re-exports', () => {
    const sources = runtimeModules.map((module) => module.source);

    expect(sources).toContain('src/engine.ts');
    expect(sources).toContain('src/stores/questionnaireStore.ts');
    expect(sources).toContain('src/utils/manageForm.ts');
    expect(sources).toContain('src/utils/extractObservation.ts');
  });

  it('does not import any UI library at runtime', () => {
    const offenders = packageImports(runtimeModules).filter(isForbidden);

    expect(offenders).toEqual([]);
  });

  /**
   * The entrypoint's **type surface** is wider than its runtime graph: Material UI must be
   * resolvable to typecheck against `/engine`, even though none of it loads at runtime. The
   * cause is deliberate. `RendererConfig` (exported here, because `BuildFormParams` accepts
   * it) keys its breakpoint values by Material UI's `Breakpoint`, which is augmentable through
   * `BreakpointOverrides` so a consumer can pass a custom breakpoint, which `useResponsive`
   * documents as supported. Narrowing it to a fixed union would remove that.
   *
   * Pinned rather than banned so the set cannot grow unnoticed. Anything added here is a
   * decision, not something a consumer should discover.
   */
  it('pins the UI packages a consumer needs in order to typecheck', () => {
    const offenders = packageImports(typeSurfaceModules).filter(isForbidden);

    expect(offenders).toEqual([
      '@mui/material',
      '@mui/material/styles',
      '@mui/material/useMediaQuery'
    ]);
  });

  it('does not reach any component or theme module', () => {
    const offenders = runtimeModules
      .map((module) => module.source)
      .filter((source) => source.startsWith('src/components/') || source.startsWith('src/theme/'));

    expect(offenders).toEqual([]);
  });
});

/**
 * Collects the exported names (values and types) of a barrel that consists of named re-export
 * declarations. Star re-exports are rejected because their names cannot be read off the file,
 * which would make the subset comparison below silently unsound.
 */
function namedExports(filePath: string): Set<string> {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );

  const names = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) {
      continue;
    }

    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      throw new Error(
        `${path.relative(SRC_DIR, filePath)} contains a star re-export. This test can only ` +
          'compare named exports; list the names explicitly or rework the comparison.'
      );
    }

    for (const element of statement.exportClause.elements) {
      names.add(element.name.text);
    }
  }

  return names;
}

describe('engine entrypoint surface', () => {
  /**
   * The engine barrel is a subset of the root barrel by design: appearing in `/engine` must
   * never be what makes a symbol public. This catches the drift where an export is added to
   * one barrel and not the other.
   */
  it('exports nothing the root barrel does not export', () => {
    const engineExports = namedExports(ENGINE_ENTRYPOINT);
    const rootExports = namedExports(ROOT_BARREL);

    const onlyInEngine = [...engineExports].filter((name) => !rootExports.has(name)).sort();

    expect(onlyInEngine).toEqual([]);
  });
});
