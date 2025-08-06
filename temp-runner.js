const { exec } = require('child_process');

exec('npx tsx scripts/analyze-page.ts', { cwd: '/Users/kaancatalkaya/Desktop/projects/elportal-forside-design' }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  console.log(stdout);
});