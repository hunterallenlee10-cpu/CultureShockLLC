import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  { ignores: ['.next/**', 'node_modules/**', 'assets-raw/**', 'media-full/**', 'public/**', 'qa/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];
