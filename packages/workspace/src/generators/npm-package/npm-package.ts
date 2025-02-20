import {
  addProjectConfiguration,
  convertNxGenerator,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  readWorkspaceConfiguration,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { join } from 'path';

export interface ProjectOptions {
  name: string;
}

function normalizeOptions(options: ProjectOptions): ProjectOptions {
  options.name = names(options.name).fileName;
  return options;
}

function addFiles(
  projectRoot: string,
  tree: Tree,
  npmScope: string,
  options: ProjectOptions
) {
  const packageJsonPath = join(projectRoot, 'package.json');
  writeJson(tree, packageJsonPath, {
    name: join(`@${npmScope}`, options.name),
    scripts: {
      test: 'node index.js',
    },
  });

  generateFiles(tree, join(__dirname, './files'), projectRoot, {});
}

export async function npmPackageGenerator(tree: Tree, options: ProjectOptions) {
  options = normalizeOptions(options);

  const { libsDir, npmScope } = getWorkspaceLayout(tree);
  const projectRoot = join(libsDir, options.name);

  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
  });

  const isEmpty = tree.children(projectRoot).length === 0;

  if (isEmpty) {
    addFiles(projectRoot, tree, npmScope, options);
  }

  await formatFiles(tree);
}

export const npmPackageSchematic = convertNxGenerator(npmPackageGenerator);
