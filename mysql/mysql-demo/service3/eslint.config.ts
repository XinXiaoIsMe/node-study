// eslint.config.mjs
import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  rules: {
    'pnpm/json-enforce-catalog': 'off',
    'unicorn/throw-new-error': 'off',
  },
});
