import sleep from '@darkobits/sleep';
import { advanceTo } from 'jest-date-mock';

import Cron from './cron';

describe('Cron', () => {
  const task = jest.fn();

  describe('when provided invalid options', () => {
    it('should throw an error', () => {
      expect(() => {
        // @ts-expect-error
        Cron.interval(false, task);
      }).toThrow('Expected delay to be of type "string" or "number", got "boolean".');

      expect(() => {
        // @ts-expect-error
        Cron.interval(10, false);
      }).toThrow('Expected task to be of type "function", got "boolean".');

      expect(() => {
        // @ts-expect-error
        Cron(false, task);
      }).toThrow('Expected expression to be of type "string", got "boolean".');

      expect(() => {
        // @ts-expect-error
        Cron('0 0 0 0', false);
      }).toThrow('Expected task to be of type "function", got "boolean".');
    });
  });

  describe('#on', () => {
    it('should register the provided handler with the provided event', async () => {
      const cron = Cron.interval(10, task);
      const cb = jest.fn();
      cron.on('start', cb);
      await cron.start();
      expect(cb).toHaveBeenCalledTimes(1);
      await cron.suspend();
    });
  });

  describe('#start', () => {
    describe('when the Cron is not running', () => {
      // Bad teardown.
      it('should start the Cron and emit the "start" event', async () => {
        const cb = jest.fn();
        const cron = Cron.interval(10, task);
        cron.on('start', cb);

        await cron.start();
        await cron.suspend();

        expect(cb).toHaveBeenCalledTimes(1);
        expect(task).toHaveBeenCalledTimes(1);
      });

      describe('when the task throws an error', () => {
        it('should emit the "error" event', async () => {
          const err = new Error('oops');

          const badTask = jest.fn(() => {
            throw err;
          });

          const cb = jest.fn();

          const cron = Cron.interval(10, badTask);
          cron.on('error', cb);

          await cron.start();

          await cron.suspend();

          expect(cb).toHaveBeenCalledWith(err);
        });
      });
    });

    describe('when the Cron is running', () => {
      it('should return false', async () => {
        const cron = Cron.interval(10, jest.fn());

        await cron.start();
        const result = await cron.start();

        expect(result).toBe(false);
      });
    });
  });

  describe('#suspend', () => {
    describe('when the Cron is running', () => {
      it('should suspend the Cron and emit the "suspend" event', async () => {
        const cb = jest.fn();

        const cron = Cron.interval(10, jest.fn());
        cron.on('suspend', cb);

        await cron.start();
        await cron.suspend();

        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the Cron is not running', () => {
      it('should return false', async () => {
        const cron = Cron.interval(10, jest.fn());
        const result = await cron.suspend();

        expect(result).toBe(false);
      });
    });
  });

  describe('#getInterval', () => {
    describe('when using a cron expression', () => {
      it('should return -1', () => {
        const cron = Cron('* * * * *', task);
        const result = cron.getInterval();
        expect(result).toBe(-1);
      });
    });

    describe('when using a simple interval', () => {
      it('should return the number of milliseconds between intervals', () => {
        const cron = Cron.interval('10 seconds', task);
        const result = cron.getInterval();
        expect(result).toBe(10_000);
      });
    });
  });

  describe('#getInterval.humanized', () => {
    it('should return a description of the length of time between intervals', () => {
      const cron = Cron('0 22 * * 1-5', task);
      const result = cron.getInterval.humanized();
      expect(result).toBe('at 10:00 PM, Monday through Friday');

      const cron2 = Cron.interval('10 seconds', task);
      const result2 = cron2.getInterval.humanized();
      expect(result2).toBe('every 10 seconds');
    });
  });

  describe('#getTimeToNextRun', () => {
    it('should return the number of milliseconds until the next task run begins', async () => {
      advanceTo(0);

      const cron = Cron.interval(500, task);

      const result = cron.getTimeToNextRun();

      expect(result).toBe(0);

      await cron.start();

      await sleep(750);

      await cron.suspend();

      const result2 = cron.getTimeToNextRun();

      expect(result2).toBe(500);
    });
  });

  // Bad teardown.
  describe('#getTimeToNextRun.humanized', () => {
    it('should return a string describing the amount of time until the next task run begins', async () => {
      advanceTo(0);

      // Every 4 hours.
      const cron = Cron('0 */4 * * *', task);

      const result = cron.getTimeToNextRun.humanized();

      expect(result).toBe('in 0 milliseconds');

      await cron.start();

      // Advance time by 3.5 hours.
      advanceTo(1000 * 60 * 60 * 3.5);

      await cron.suspend();

      const result2 = cron.getTimeToNextRun.humanized();

      expect(result2).toBe('in 30 minutes');
    });
  });
});
