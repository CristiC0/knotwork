// Conventional Commits, with the scopes listed in .agents/skills/commit/SKILL.md.
/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['api', 'web', 'db', 'docker', 'ci', 'agents', 'deps', 'repo']],
  },
};
