#!/usr/bin/env zx
import { readFileSync, writeFileSync } from 'fs';
import 'zx/globals';
import { workingDirectory } from '../utils.mjs';

const mode = process.argv[3] || 'publish'; // 'publish' or 'workspace'

// Helper to update package.json dependencies
function updateDependencies(packagePath, updates) {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

  Object.keys(updates).forEach((dep) => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      pkg.dependencies[dep] = updates[dep];
    }
    if (pkg.devDependencies && pkg.devDependencies[dep]) {
      pkg.devDependencies[dep] = updates[dep];
    }
  });

  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
}

const jsPackagePath = path.join(
  workingDirectory,
  'clients',
  'js',
  'package.json'
);
const umiPackagePath = path.join(
  workingDirectory,
  'clients',
  'umi',
  'package.json'
);
const corePackagePath = path.join(
  workingDirectory,
  'clients',
  'core',
  'package.json'
);

const clientPackages = [
  { name: 'JS', path: jsPackagePath },
  { name: 'UMI', path: umiPackagePath },
];

if (mode === 'publish') {
  // Get the core package version
  const corePackage = JSON.parse(readFileSync(corePackagePath, 'utf8'));
  const coreVersion = corePackage.version;

  console.log(
    `Updating client packages to use @pow-miner-sdk/core@${coreVersion}`
  );
  clientPackages.forEach(({ name, path: packagePath }) => {
    console.log(`  - Updating ${name} client`);
    updateDependencies(packagePath, {
      '@pow-miner-sdk/core': `^${coreVersion}`,
    });
  });
} else if (mode === 'workspace') {
  console.log('Restoring workspace dependencies for development');
  clientPackages.forEach(({ name, path: packagePath }) => {
    console.log(`  - Restoring ${name} client workspace dependencies`);
    updateDependencies(packagePath, {
      '@pow-miner-sdk/core': 'workspace:*',
    });
  });
}

console.log(`Dependencies updated for ${mode} mode`);
