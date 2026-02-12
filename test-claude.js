import { spawn } from 'node:child_process'

// Try running claude code via npx (JS version, not native binary)
const proc = spawn('npx', ['@anthropic-ai/claude-code', '-p', 'say hello'], {
  shell: true,
  env: { ...process.env, CLAUDE_CODE_GIT_BASH_PATH: 'C:\\Program Files\\Git\\bin\\bash.exe' },
})

let stdout = '', stderr = ''
proc.stdout.on('data', c => { stdout += c; process.stdout.write('[o] ' + c) })
proc.stderr.on('data', c => { stderr += c; process.stderr.write('[e] ' + c) })
proc.on('close', code => console.log('\n[exit]', code, '[olen]', stdout.length, '[elen]', stderr.length))
proc.on('error', e => console.log('[err]', e.message))
