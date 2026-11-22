/** Runs on `git commit`, only against the staged files. */
export default {
  // --no-warn-ignored: staged files that ESLint ignores (e.g. the generated
  // schema.gen.ts) would otherwise produce a warning and fail --max-warnings=0.
  '*.{ts,tsx,js}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{json,md,yaml,yml,css,html}': 'prettier --write',
};
