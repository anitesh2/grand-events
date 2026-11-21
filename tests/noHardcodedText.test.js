/**
 * Architecture rule (fitness function): UI components contain no
 * user-visible literal text — every JSX text node and every user-facing
 * attribute (placeholder, aria-label, title, alt) must come from t().
 * This is what makes "add a language" a data-only change.
 */
import { it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '@babel/parser';

const roots = ['../src/components', '../src'];
const files = roots.flatMap((d) =>
  readdirSync(join(__dirname, d)).filter((f) => f.endsWith('.jsx')).map((f) => join(__dirname, d, f)));
const LETTERS = /\p{L}/u;
const TEXT_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];

function findLiterals(node, out = []) {
  if (!node || typeof node.type !== 'string') return out;
  if (node.type === 'JSXText' && LETTERS.test(node.value)) out.push(node.value.trim());
  if (node.type === 'JSXAttribute' && TEXT_ATTRS.includes(node.name.name)
      && node.value?.type === 'StringLiteral' && LETTERS.test(node.value.value)) {
    out.push(`${node.name.name}="${node.value.value}"`);
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const child = node[key];
    if (Array.isArray(child)) child.forEach((c) => findLiterals(c, out));
    else if (child && typeof child === 'object') findLiterals(child, out);
  }
  return out;
}

it.each(files)('%s has no hard-coded user-visible text', (file) => {
  const ast = parse(readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  expect(findLiterals(ast.program)).toEqual([]);
});

it('components never import locale files or construct Intl formatters', () => {
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    expect(src, f).not.toMatch(/locales\/\w+\.json/);
    expect(src, f).not.toMatch(/new Intl\./);
  }
});
