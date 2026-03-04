const fs = require('fs')

const src = fs.readFileSync('src/App.tsx', 'utf8')
const importRe = /import\s*{([\s\S]*?)}\s*from\s*['"]([^'"]+)['"]/g

const parseNames = (chunk) =>
  chunk
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+as\s+.*/, '').trim())

const fromPages = []
const fromSupportPages = []
let supportImportStatements = 0

for (const match of src.matchAll(importRe)) {
  const names = parseNames(match[1])
  const modulePath = match[2]

  if (modulePath === './pages/pages') fromPages.push(...names)
  if (modulePath === './pages/supportPages') {
    supportImportStatements += 1
    fromSupportPages.push(...names)
  }
}

const forbiddenInPages = fromPages.filter((n) => n === 'ProfileSupportPage' || n === 'ProfileSupportFaqPage')
if (forbiddenInPages.length) {
  console.error('ProfileSupport pages must not be imported from ./pages/pages')
  process.exit(1)
}

if (supportImportStatements !== 1) {
  console.error('App.tsx must contain exactly one import from ./pages/supportPages')
  process.exit(1)
}

const required = ['ProfileSupportPage', 'ProfileSupportFaqPage']
const missing = required.filter((n) => !fromSupportPages.includes(n))
if (missing.length) {
  console.error('Missing ProfileSupport imports from ./pages/supportPages in App.tsx:', missing.join(', '))
  process.exit(1)
}

const duplicated = required.filter((n) => fromSupportPages.filter((x) => x === n).length > 1)
if (duplicated.length) {
  console.error('Duplicate support page imports detected in App.tsx:', duplicated.join(', '))
  process.exit(1)
}

console.log('App.tsx support page imports are valid')
