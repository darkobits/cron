import MockDate from 'mockdate';
import parseCronExpression from './parse-cron-expression';


describe('parseCronExpression', () => {
  beforeEach(() => {
    MockDate.set(0);
    // jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  describe('when provided an invalid expression', () => {
    it('should throw an error', () => {
      expect(() => {
        // @ts-ignore
        parseCronExpression({});
      }).toThrow('Expected type of first argument to be');

      expect(() => {
        // @ts-ignore
        parseCronExpression('foo');
      }).toThrow('Invalid expression');
    });
  });

  describe('when provided a simple interval', () => {
    describe('as a string', () => {
      it('should parse the string and return a function that returns the current time plus the interval', () => {
        const nextFn = parseCronExpression('10 seconds');

        // Expect the first call to return a timestamp 10 seconds from now.
        expect(nextFn()).toStrictEqual(10000);

        // Advance time by 12 seconds.
        MockDate.set(12000);

        // Expect the second call to also return a timestamp 10 seconds from now.
        expect(nextFn()).toStrictEqual(22000);
      });
    });

    describe('as a number', () => {
      it('should return a function that always returns the current time plus the interval', () => {
        const nextFn = parseCronExpression(10000);

        // Expect the first call to return a timestamp 10 seconds from now.
        expect(nextFn()).toStrictEqual(10000);

        // Advance time by 12 seconds.
        MockDate.set(12000);

        // Expect the second call to also return a timestamp 10 seconds from now.
        expect(nextFn()).toStrictEqual(22000);
      });
    });

    it('should have a `descriptor` property describing the interval', () => {
      const nextFn = parseCronExpression('10 seconds');
      expect(nextFn.descriptor.ms).toBe(10000);
      expect(nextFn.descriptor.humanized).toBe('every 10 seconds');
    });
  });

  describe('when provided a crontab expression', () => {
    it('should parse the expression and return a function that returns the absolute start time of the next interval', () => {
      // Every other minute.
      const nextFn = parseCronExpression('*/2 * * * *');

      // Expect the first call to return 0 + 2 minutes.
      expect(nextFn()).toStrictEqual(120000);

      // Advance time by 140 seconds.
      MockDate.set(140000);

      // Expect the first call to return 0 + 4 minutes.
      expect(nextFn()).toStrictEqual(240000);

      // Advance time by 120 seconds.
      MockDate.set(260000);

      // Expect the first call to return 0 + 6 minutes.
      expect(nextFn()).toStrictEqual(360000);
    });

    it('should have a `descriptor` property describing the interval', () => {
      const nextFn = parseCronExpression('0 22 * * 1-5');
      expect(nextFn.descriptor.ms).toBe(-1);
      expect(nextFn.descriptor.humanized).toBe('at 10:00 PM, Monday through Friday');
    });
  });
});
