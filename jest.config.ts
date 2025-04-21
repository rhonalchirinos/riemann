import { type Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import * as tsconfig from './tsconfig.json';

const { compilerOptions } = tsconfig;

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  coverageDirectory: './coverage',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

export default config;
