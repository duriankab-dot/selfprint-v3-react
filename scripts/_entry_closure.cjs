// temp debug: transitive static imports from entry + who references vendor-markdown/vendor-misc
const fs = require('fs');
const files = fs.readdirSync('dist/assets').filter((f) => f.endsWith('.js'));
const importsOf = (f) => {
  const t = fs.readFileSync('dist/assets/' + f, 'utf8');
  return [...t.matchAll(/import\s*\{[^}]*\}\s*from\s*["']\.\/([^"']+\.js)["']/g)].map((m) => m[1]);
};
const entry = files.filter((f) => /^index-.*\.js$/.test(f))[0];
// transitive closure of static imports
const seen = new Set();
const stack = [entry];
while (stack.length) {
  const cur = stack.pop();
  if (seen.has(cur)) continue;
  seen.add(cur);
  for (const i of importsOf(cur)) stack.push(i);
}
console.log('=== transitive static closure of entry (preloaded) ===');
console.log([...seen].sort().join('\n'));
console.log('\n=== chunks referencing vendor-markdown / vendor-misc ===');
for (const f of files) {
  const imps = importsOf(f);
  if (imps.some((i) => /vendor-markdown|vendor-misc/.test(i))) {
    console.log(f, '->', imps.filter((i) => /vendor-markdown|vendor-misc/.test(i)).join(', '));
  }
}
