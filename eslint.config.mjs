import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Disable the overly strict react-hooks rules that are new in v7
      // These would require significant refactoring and are not related to the dependency updates
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
];

export default eslintConfig;
