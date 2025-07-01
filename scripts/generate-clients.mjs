#!/usr/bin/env zx
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from '@codama/renderers-js';
import { renderVisitor as renderUmiVisitor } from '@codama/renderers-js-umi';
import { renderVisitor as renderRustVisitor } from '@codama/renderers-rust';
import * as c from 'codama';
import 'zx/globals';

const idl = require('../idls/pow_miner.json');
const codama = c.createFromRoot(rootNodeFromAnchor(idl));

// Update programs.
codama.update(
  c.updateProgramsVisitor({
    powMiner: { name: 'powMiner' },
  })
);

// Update accounts.
codama.update(
  c.updateAccountsVisitor({
    config: {
      seeds: [c.constantPdaSeedNodeFromString('utf8', 'config')],
    },
    proof: {
      seeds: [
        c.constantPdaSeedNodeFromString('utf8', 'proof'),
        c.variablePdaSeedNode('user', c.publicKeyTypeNode()),
      ],
    },
  })
);

codama.update(
  c.setInstructionAccountDefaultValuesVisitor([
    {
      account: 'user',
      defaultValue: c.identityValueNode(),
    },
    {
      account: 'config',
      defaultValue: c.pdaValueNode('config'),
    },
    {
      account: 'proof',
      defaultValue: c.pdaValueNode('proof'),
    },
  ])
);

// Update instructions.
codama.update(c.updateInstructionsVisitor({}));

// Render JavaScript.
const jsClient = path.join(__dirname, '..', 'clients', 'js');
codama.accept(
  renderJavaScriptVisitor(path.join(jsClient, 'src', 'generated'), {
    prettierOptions: require(path.join(jsClient, '.prettierrc.json')),
  })
);

// Render JavaScript.
const umiClient = path.join(__dirname, '..', 'clients', 'umi');
codama.accept(
  renderUmiVisitor(path.join(umiClient, 'src', 'generated'), {
    prettierOptions: require(path.join(umiClient, '.prettierrc.json')),
  })
);

// Render Rust.
const rustClient = path.join(__dirname, '..', 'clients', 'rust');
codama.accept(
  renderRustVisitor(path.join(rustClient, 'src', 'generated'), {
    formatCode: true,
    crateFolder: rustClient,
  })
);
