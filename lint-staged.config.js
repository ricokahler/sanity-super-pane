module.exports = {
  '**/*.{js,jsx}': ['prettier --write', 'eslint'],
  '**/*.{ts,tsx}': ['prettier --write', 'eslint', () => 'tsc --noEmit'],
}
