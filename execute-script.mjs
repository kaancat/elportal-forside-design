import { exec } from 'child_process'

console.log('🚀 Executing page population script...')

exec('npx tsx scripts/fetch-and-populate-page.ts', { 
  cwd: '/Users/kaancatalkaya/Desktop/projects/elportal-forside-design',
  env: { ...process.env }
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Execution Error:', error.message)
    return
  }
  
  if (stderr) {
    console.error('⚠️ Warning:', stderr)
  }
  
  console.log('📋 Output:')
  console.log(stdout)
})