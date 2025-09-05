#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing import statements...');

// Fix usePopulate.tsx
const usePopulatePath = 'src/features/prepopulate/hooks/usePopulate.tsx';
let content = fs.readFileSync(usePopulatePath, 'utf8');
content = content.replace(
  "import { populateQuestionnaire, type PopulateQuestionnaireParams } from '@aehrc/sdc-populate';",
  "import { populateQuestionnaire } from '@aehrc/sdc-populate';"
);
fs.writeFileSync(usePopulatePath, content);
console.log('✅ Fixed usePopulate.tsx');

// Fix RepopulateAction.tsx
const repopulateActionPath = 'src/features/renderer/components/RendererActions/RepopulateAction.tsx';
content = fs.readFileSync(repopulateActionPath, 'utf8');
content = content.replace(
  "import { populateQuestionnaire, type PopulateQuestionnaireParams } from '@aehrc/sdc-populate';",
  "import { populateQuestionnaire } from '@aehrc/sdc-populate';"
);
fs.writeFileSync(repopulateActionPath, content);
console.log('✅ Fixed RepopulateAction.tsx');

console.log('🎉 All imports fixed!');
