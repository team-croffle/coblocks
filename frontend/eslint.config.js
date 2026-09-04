import { globalIgnores } from 'eslint/config';
import globals from 'globals';

// Plugins for React linting
import pluginQuery from '@tanstack/eslint-plugin-query';
import pluginImport from 'eslint-plugin-import';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import pluginTailwind from 'eslint-plugin-tailwindcss';

// TypeScript support
import tseslint from '@typescript-eslint/eslint-plugin';

// Prettier configuration for ESLint
import prettierConfig from 'eslint-config-prettier';

export default [
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginJsxA11y,
      import: pluginImport,
      'react-refresh': pluginReactRefresh,
      '@tanstack/query': pluginQuery,
      tailwindcss: pluginTailwind,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
      pluginReactHooks.configs.recommended,
      pluginJsxA11y.configs.recommended,
      pluginImport.configs.recommended,
      ...pluginQuery.configs.recommended,
      ...pluginTailwind.configs.recommended,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-file-name-extension': ['warn', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],

      'jsx-a11y/anchor-is-valid': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'dot-notation': 'error',

      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  prettierConfig,
];
