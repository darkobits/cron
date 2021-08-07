import { jest } from '@darkobits/ts';

export default jest({
  // These two options are needed because we have tests that "don't exit
  // properly". Setting these makes Jest behave as expected, but fails to reveal
  // the source of the misbehaving test. This seems to be a common issue.
  // See: https://github.com/facebook/jest/issues/6937
  forceExit: true,
  detectOpenHandles: true,

  setupFiles: ['jest-date-mock'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 85,
      functions: 100,
      lines: 100
    }
  }
});
