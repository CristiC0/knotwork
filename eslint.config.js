// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/',
    '**/coverage/',
    // Generated code: regenerate it, never lint or hand-edit it.
    '**/*.gen.ts',
  ]),

  // Base rules for every file, with full type information (the strictest presets).
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Root config files aren't part of any app tsconfig.
          allowDefaultProject: ['*.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // API (NestJS, Node)
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      // Nest modules are empty classes configured by decorators.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // Do NOT enforce `import type` here: with emitDecoratorMetadata, a type-only
      // import of an injected class erases it at runtime and breaks DI.
      '@typescript-eslint/consistent-type-imports': 'off',
      // Nest types many option objects as classes but documents passing plain
      // object literals (e.g. NestFactory.create(AppModule, { logger: false })).
      '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
    },
  },
  {
    // Scripts that print to the terminal on purpose.
    files: ['apps/api/src/openapi.ts'],
    rules: { 'no-console': 'off' },
  },

  // Web (React, browser). Type-only imports are enforced by verbatimModuleSyntax.
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest']],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: { globals: globals.browser },
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    // The entry file only mounts the app; it intentionally exports nothing.
    files: ['apps/web/src/main.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['apps/web/vite.config.ts'],
    languageOptions: { globals: globals.node },
  },

  // Test files: mocks and partial objects are normal there.
  {
    files: ['**/*.spec.ts', '**/*.int-spec.ts', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // Plain JS config files: no type information available.
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  // Must be last: turns off rules that would fight with Prettier.
  prettier,
);
