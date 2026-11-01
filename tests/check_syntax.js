const fs = require('fs');
const content = fs.readFileSync('Main.dc.html', 'utf8');
const scriptStart = content.indexOf('<script type="text/x-dc" data-dc-script');
const codeStart = content.indexOf('>', scriptStart) + 1;
const codeEnd = content.indexOf('</script>', codeStart);
const code = content.slice(codeStart, codeEnd);

console.log('Script length:', code.length);
try {
  new Function('DCLogic', 'StreamableLogic', 'React', code);
  console.log('Syntax check PASSED! No syntax errors in Component script.');
} catch (e) {
  console.error('Syntax check FAILED:', e);
  process.exit(1);
}

