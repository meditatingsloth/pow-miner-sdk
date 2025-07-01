#!/usr/bin/env zx
import 'zx/globals';
import { cliArguments, workingDirectory } from '../utils.mjs';

const [level, tag = 'latest', otp] = cliArguments();
if (!level) {
  throw new Error('A version level — e.g. "patch" — must be provided.');
}

// Go to the client directory and install the dependencies.
cd(path.join(workingDirectory, 'clients', 'js'));
await $`pnpm install`;

// Define version args first
const versionArgs = [
  '--no-git-tag-version',
  ...(level.startsWith('pre') ? [`--preid ${tag}`] : []),
];

// Publish the core package first if it has changes
cd(path.join(workingDirectory, 'clients', 'core'));
await $`pnpm install`;
let { stdout: coreStdout } = await $`pnpm version ${level} ${versionArgs}`;
const newCoreVersion = coreStdout.slice(1).trim();
await $`pnpm publish --no-git-checks --tag ${tag}${otp ? ` --otp ${otp}` : ''}`;

// Go back to JS client and update its dependencies
cd(path.join(workingDirectory, 'clients', 'js'));

// Replace workspace dependency with actual version
await $`pnpm add @pow-miner-sdk/core@${newCoreVersion}`;

// Update the version.
let { stdout } = await $`pnpm version ${level} ${versionArgs}`;
const newVersion = stdout.slice(1).trim();

// Expose the new version to CI if needed.
if (process.env.CI) {
  await $`echo "new_version=${newVersion}" >> $GITHUB_OUTPUT`;
}

// Publish the package.
// This will also build the package before publishing (see prepublishOnly script).
await $`pnpm publish --no-git-checks --tag ${tag}${otp ? ` --otp ${otp}` : ''}`;

// Restore workspace dependency for development
await $`pnpm add @pow-miner-sdk/core@workspace:*`;

// Commit the new version.
await $`git commit -am "Publish JS client v${newVersion}"`;

// Tag the new version.
await $`git tag -a js@v${newVersion} -m "JS client v${newVersion}"`;
