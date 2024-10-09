import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import pc from 'picocolors';
import { optimizedCopy } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..', 'templates', 'next');

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
  '_env.local': '.env.local',
};

const excludeDirs = ['node_modules', '.next'];
const excludeFiles = ['.DS_Store', 'Thumbs.db'];

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

async function copyDir(src: string, dest: string) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, renameFiles[entry.name] || entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        await copyDir(srcPath, destPath);
      }
    } else {
      if (!excludeFiles.includes(entry.name)) {
        await optimizedCopy(srcPath, destPath);
      }
    }
  }
}

async function init() {
  const defaultProjectName = 'my-onchainkit-app';

  let result: prompts.Answers<'projectName' | 'packageName'>;

  try {
    result = await prompts([
      {
        type: 'text',
        name: 'projectName',
        message: pc.reset('Project name:'),
        initial: defaultProjectName,
        onState: (state) => {
          state.value = state.value.trim();
        },
        validate: (value) => {
          const targetDir = path.join(process.cwd(), value);
          if (
            fs.existsSync(targetDir) &&
            fs.readdirSync(targetDir).length > 0
          ) {
            return 'Directory already exists and is not empty. Please choose a different name.';
          }
          return true;
        },
      },
      {
        type: (_, { projectName }: { projectName: string }) =>
          isValidPackageName(projectName) ? null : 'text',
        name: 'packageName',
        message: pc.reset('Package name:'),
        initial: (_, { projectName }: { projectName: string }) =>
          toValidPackageName(projectName),
        validate: (dir) =>
          isValidPackageName(dir) || 'Invalid package.json name',
      },
    ]);
  } catch (cancelled: any) {
    console.log(cancelled.message);
    process.exit(1);
  }

  const { projectName, packageName } = result;
  const root = path.join(process.cwd(), projectName);

  console.log(`\nCreating project in ${root}...`);

  await copyDir(sourceDir, root);

  const pkgPath = path.join(root, 'package.json');
  const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
  pkg.name = packageName || toValidPackageName(projectName);
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2));

  console.log(`\nDone. Now run:\n`);
  if (root !== process.cwd()) {
    console.log(`  cd ${path.relative(process.cwd(), root)}`);
  }
  console.log('  npm install');
  console.log('  npm run dev');
}

init().catch((e) => {
  console.error(e);
});
