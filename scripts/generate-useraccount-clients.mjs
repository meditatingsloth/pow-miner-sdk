#!/usr/bin/env zx
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from '@codama/renderers-js';
import { renderVisitor as renderUmiVisitor } from '@codama/renderers-js-umi';
import { renderVisitor as renderRustVisitor } from '@codama/renderers-rust';
import * as c from 'codama';
import 'zx/globals';

const idl = require('../idls/useraccount.json');
const codama = c.createFromRoot(rootNodeFromAnchor(idl));

// Update programs.
codama.update(
  c.updateProgramsVisitor({
    useraccount: { name: 'useraccount' },
  })
);

// Update accounts.
codama.update(
  c.updateAccountsVisitor({
    user: {
      seeds: [
        c.constantPdaSeedNodeFromString('utf8', 'user'),
        c.variablePdaSeedNode('authority', c.publicKeyTypeNode()),
      ],
    },
    programState: {
      seeds: [c.constantPdaSeedNodeFromString('utf8', 'program_state')],
    },
  })
);

codama.update(
  c.setInstructionAccountDefaultValuesVisitor([
    {
      account: 'authority',
      defaultValue: c.identityValueNode(),
    },
    {
      account: 'user',
      defaultValue: c.pdaValueNode('user', [
        c.constantPdaSeedNodeFromString('utf8', 'user'),
        c.variablePdaSeedNode('authority', c.publicKeyValueNode('authority')),
      ]),
    },
    {
      account: 'programState',
      defaultValue: c.pdaValueNode('programState'),
    },
  ])
);

// Update instructions.
codama.update(c.updateInstructionsVisitor({}));

// Render JavaScript.
const jsClient = path.join(__dirname, '..', 'clients', 'useraccount', 'js');
codama.accept(
  renderJavaScriptVisitor(path.join(jsClient, 'src', 'generated'), {
    prettierOptions: require(path.join(jsClient, '.prettierrc.json')),
  })
);

// Render JavaScript.
const umiClient = path.join(__dirname, '..', 'clients', 'useraccount', 'umi');
codama.accept(
  renderUmiVisitor(path.join(umiClient, 'src', 'generated'), {
    prettierOptions: require(path.join(umiClient, '.prettierrc.json')),
  })
);

// Render Rust.
const rustClient = path.join(__dirname, '..', 'clients', 'useraccount', 'rust');
codama.accept(
  renderRustVisitor(path.join(rustClient, 'src', 'generated'), {
    formatCode: true,
    crateFolder: rustClient,
  })
);
