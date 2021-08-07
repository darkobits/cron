
import sleep from '@darkobits/sleep';
import cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
import Emittery from 'emittery';
import ms from 'ms';
import prettyMs from 'pretty-ms';

import {
  CronEvent,
  CronOptions,
  CronInstance,
  CronTask
} from 'etc/types';


/**
 * @private
 *
 * Provided a string, returns a new string with the first character lower-cased.
 */
function lowercaseFirst(str: string) {
  return str.slice(0, 1).toLowerCase() + str.slice(1);
}


/**
 * @private
 *
 * Provided a CronOptions object, returns a CronInstance.
 */
function Cron(options: CronOptions): CronInstance {
  /**
   * @private
   *
   * Event emitter for the Cron.
   */
  const emitter = new Emittery();


  /**
   * @private
   *
   * Tracks whether we are running or suspended.
   */
  let isRunning = false;


  /**
   * @private
   *
   * Number of milliseconds until the next task run begins.
   */
  let nextRun = Date.now();


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Function that will run the provided task and emit lifecycle events.
   */
  const run = async () => {
    // For 'cron' expressions, compute the time to the next run immediately, and
    // always wait until the next interval period before running the task for
    // the first time.
    if (options.type === 'cron') {
      nextRun = options.getNextInterval();
      await sleep(nextRun - Date.now());
    }

    try {
      await emitter.emit('task.start');
      const result = await options.task();
      await emitter.emit('task.end', result);
    } catch (err) {
      await emitter.emit('error', err);
    } finally {
      // Check that we are still running before scheduling the next task.
      // Something may have called suspend() while the task was running or in an
      // event handler.
      if (isRunning) {
        // For 'simple' intervals, wait after running the task for the first
        // time to compute the time until the next run, then wait.
        if (options.type === 'interval') {
          // eslint-disable-next-line require-atomic-updates
          nextRun = options.getNextInterval();
          await sleep(nextRun - Date.now());
        }

        // Schedule the next task.
        void run();
      }
    }
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * Registers a listener for an event emitted by Cron.
   */
  const on = (eventName: CronEvent, listener: (eventData?: any) => any) => {
    emitter.on(eventName, listener);
  };


  /**
   * Starts or re-starts the Cron. Returns a Promise that resolves when all
   * handlers for the 'start' event have finished.
   */
  const start = async (eventData: any) => {
    if (!isRunning) {
      isRunning = true;
      await emitter.emit('start', eventData);
      void run();
    }

    return false;
  };


  /**
   * Suspends the Cron. Returns a Promise that resolves when all handlers for
   * the 'suspend' event have finished.
   */
  const suspend = async (eventData: any) => {
    if (isRunning) {
      isRunning = false;
      return emitter.emit('suspend', eventData); // tslint:disable-line no-floating-promises
    }

    return false;
  };


  /**
   * When using a simple interval, returns the number of milliseconds between
   * intervals.
   *
   * When using a cron expression, returns -1, as intervals between runs may be
   * variable.
   */
  const getInterval = () => options.ms;


  /**
   * Returns a string describing when tasks will run in humanized form.
   *
   * @example
   *
   * 'Every 30 minutes on Wednesdays.'
   */
  getInterval.humanized = () => options.humanized;


  /**
   * Returns the time remaining until the next task run begins in milliseconds.
   */
  const getTimeToNextRun = () => {
    const ms = nextRun - Date.now();
    return ms < 0 ? 0 : ms;
  };


  /**
   * Returns a string describing when the next task will run in humanized
   * form.
   *
   * @example
   *
   * 'In 10 minutes.'
   */
  getTimeToNextRun.humanized = () => {
    const ms = getTimeToNextRun();
    return ms < 0 ? 'now' : `in ${prettyMs(ms, {secondsDecimalDigits: 0, verbose: true})}`;
  };


  return {
    on,
    start,
    suspend,
    getInterval,
    getTimeToNextRun
  };
}


/**
 * Accepts a cron expression and a task function. Returns a Cron instance that
 * will invoke the task according to the provided expression.
 */
export default function expression(expression: string, task: CronTask) {
  if (typeof expression !== 'string') {
    throw new TypeError(`Expected expression to be of type "string", got "${typeof expression}".`);
  }

  if (typeof task !== 'function') {
    throw new TypeError(`Expected task to be of type "function", got "${typeof task}".`);
  }

  const cronInterval = cronParser.parseExpression(expression);

  return Cron({
    type: 'cron',
    getNextInterval: () => cronInterval.next().toDate().valueOf(),
    ms: -1,
    humanized: lowercaseFirst(cronstrue.toString(expression)),
    task
  });
}


/**
 * Accepts a string describing an interval or a number in milliseconds and a
 * task function. Returns a Cron instance that will invoke the task at the
 * indicated interval.
 */
expression.interval = (delay: string | number, task: CronTask) => {
  if (!['string', 'number'].includes(typeof delay)) {
    throw new TypeError(`Expected delay to be of type "string" or "number", got "${typeof delay}".`);
  }

  if (typeof task !== 'function') {
    throw new TypeError(`Expected task to be of type "function", got "${typeof task}".`);
  }

  const simpleInterval = typeof delay === 'string' ? ms(delay) : delay;

  return Cron({
    type: 'interval',
    getNextInterval: () => Date.now() + simpleInterval,
    ms: simpleInterval,
    humanized: `every ${prettyMs(simpleInterval, {secondsDecimalDigits: 0, verbose: true})}`,
    task
  });
};
