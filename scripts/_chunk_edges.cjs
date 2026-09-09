// temp debug: inspect chunk import edges in dist
const fs = require('fs');
const files = fs.readdirSync('dist/assets');
const pick = (re) => files.filter((f) => re.test(f));

const entry = pick(/^index-.*\.js$/)[0];
const cs = pick(/^chunk-supabase-client-.*\.js$/)[0];
const ci = pick(/^chunk-intelligence-.*\.js$/)[0];
const vm = pick(/^vendor-markdown-.*\.js$/)[0];
const ds = pick(/^decision-services-.*\.js$/)[0];

const importsOf = (f) => {
  const t = fs.readFileSync('dist/assets/' + f, 'utf8');
  return (t.match(/import\{[^}]*\}from"\.\/[^"]+"/g) || []).map((s) => s.slice(0, 120));
};

console.log('ENTRY:', entry);
console.log(importsOf(entry).join('\n'));
console.log('\nCHUNK-SUPABASE-CLIENT:', cs);
console.log(importsOf(cs).join('\n'));
console.log('\nCHUNK-INTELLIGENCE:', ci);
console.log(importsOf(ci).join('\n'));
console.log('\nVENDOR-MARKDOWN:', vm);
console.log(importsOf(vm).join('\n'));
console.log('\nDECISION-SERVICES:', ds);
console.log(importsOf(ds).join('\n'));
