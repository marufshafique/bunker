import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // Base recommended rules
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // Vue recommended (flat config)
  ...pluginVue.configs['flat/recommended'],

  // Prettier — must be last to override conflicting rules
  prettierConfig,

  // Global settings for all files
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        FileList: 'readonly',
        File: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        DragEvent: 'readonly',
        Event: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },

  // Vue SFC-specific
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Don't enforce default prop values on shadcn-vue generated components
  {
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/require-default-prop': 'off',
    },
  },

  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
