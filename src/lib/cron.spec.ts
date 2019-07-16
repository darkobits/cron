import sleep from '@darkobits/sleep';
import MockDate from 'mockdate';
import Cron from './cron';

// const cron = Cron({delay: 10, task: jest.fn(() => {
//   console.warn('TASK');
// }});

// jest.useFakeTimers();


describe('Cron', () => {
  const task = jest.fn(() => {
    // console.warn('TASK');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // MockDate.set(0);
  });

  describe('when provided invalid options', () => {
    it('should throw an error', () => {
      expect(() => {
        // @ts-ignore
        Cron({delay: false, task});
      }).toThrow();

      expect(() => {
        // @ts-ignore
        Cron({delay: 10, task: false});
      }).toThrow();
    });
  });

  describe('#on', () => {
    it('should register the provided handler with the provided event', async () => {
      const cron = Cron({delay: 10, task});
      const cb = jest.fn();
      cron.on('start', cb);
      await cron.start();
      expect(cb).toHaveBeenCalledTimes(1);
      await cron.suspend();
    });
  });

  describe('#start', () => {
    describe('when the Cron is not running', () => {
      it('should start the Cron and emit the "start" event', async () => {
        const cb = jest.fn();
        const cron = Cron({delay: 10, task});
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

          const cron = Cron({delay: 10, task: badTask});
          cron.on('error', cb);

          await cron.start();

          await cron.suspend();

          expect(cb).toHaveBeenCalledWith(err);
        });
      });
    });

    describe('when the Cron is running', () => {
      it('should return false', async () => {
        const cron = Cron({delay: 10, task: jest.fn()});

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

        const cron = Cron({delay: 10, task: jest.fn()});
        cron.on('suspend', cb);

        await cron.start();
        await cron.suspend();

        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the Cron is not running', () => {
      it('should return false', async () => {
        const cron = Cron({delay: 10, task: jest.fn()});
        const result = await cron.suspend();

        expect(result).toBe(false);
      });
    });
  });

  describe('#getInterval', () => {
    describe('when using a crontab expression', () => {
      it('should return -1', () => {
        const cron = Cron({delay: '* * * * *', task});
        const result = cron.getInterval();
        expect(result).toBe(-1);
      });
    });

    describe('when using a simple interval', () => {
      it('should return the number of milliseconds between intervals', () => {
        const cron = Cron({delay: '10 seconds', task});
        const result = cron.getInterval();
        expect(result).toBe(10000);
      });
    });
  });

  describe('#getInterval.humanized', () => {
    it('should return a description of the length of time between intervals', () => {
      const cron = Cron({delay: '0 22 * * 1-5', task});
      const result = cron.getInterval.humanized();
      expect(result).toBe('at 10:00 PM, Monday through Friday');

      const cron2 = Cron({delay: '10 seconds', task});
      const result2 = cron2.getInterval.humanized();
      expect(result2).toBe('every 10 seconds');
    });
  });

  describe('#getTimeToNextRun', () => {
    beforeEach(() => {
      MockDate.set(0);
    });

    it('should return the number of milliseconds until the next task run begins', async () => {
      const cron = Cron({delay: 500, task});

      const result = cron.getTimeToNextRun();

      expect(result).toBe(0);

      await cron.start();

      await sleep(750);

      await cron.suspend();

      const result2 = cron.getTimeToNextRun();

      expect(result2).toBe(500);
    });
  });

  describe('#getTimeToNextRun.humanized', () => {
    beforeEach(() => {
      MockDate.set(0);
      jest.useFakeTimers();
    });

    it('should return a string describing the amount of time until the next task run begins', async () => {
      // Every 4 hours.
      const cron = Cron({delay: '0 */4 * * *', task});

      const result = cron.getTimeToNextRun.humanized();

      expect(result).toBe('in 0 milliseconds');

      await cron.start();

      // Advance time by 3.5 hours.
      jest.advanceTimersByTime(1000 * 60 * 60 * 3.5);
      MockDate.set(1000 * 60 * 60 * 3.5);

      await cron.suspend();

      const result2 = cron.getTimeToNextRun.humanized();

      expect(result2).toBe('in 30 minutes');
    });
  });
});
