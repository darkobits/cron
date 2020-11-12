import sleep from '@darkobits/sleep';
import Emittery from 'emittery';
import ow from 'ow';
import prettyMs from 'pretty-ms';

import {CronEvent, CronOptions, CronInstance, ParsedExpression} from 'etc/types';
import parseCronExpression from 'lib/parse-cron-expression';


/**
 * Provided a CronOptions object, returns a Cron object.
 */
export default function Cron(options: CronOptions): CronInstance {
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


  /**
   * Object describing the cron/interval expression provided by the user.
   */
  // eslint-disable-next-line prefer-const -- Variable is re-defined below.
  let parsedExpression: ParsedExpression;


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Function that will run the Cron's task and emit related events.
   */
  const run = async () => {
    // For 'cron' expressions, compute the time to the next run immediately, and
    // always wait until the next interval period before running the task for
    // the first time.
    if (parsedExpression.type === 'cron') {
      nextRun = parsedExpression.getNextInterval();
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
        if (parsedExpression.type === 'simple') {
          // eslint-disable-next-line require-atomic-updates
          nextRun = parsedExpression.getNextInterval();
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
  const start = async () => {
    if (!isRunning) {
      isRunning = true;
      await emitter.emit('start');
      void run();
    }

    return false;
  };


  /**
   * Suspends the Cron. Returns a Promise that resolves when all handlers for
   * the 'suspend' event have finished.
   */
  const suspend = async () => {
    if (isRunning) {
      isRunning = false;
      return emitter.emit('suspend'); // tslint:disable-line no-floating-promises
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
  const getInterval = () => {
    return parsedExpression.ms;
  };


  /**
   * Returns a string describing when tasks will run in humanized form.
   *
   * @example
   *
   * 'Every 30 minutes on Wednesdays.'
   */
  getInterval.humanized = () => {
    return parsedExpression.humanized;
  };


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


  // ----- Init ----------------------------------------------------------------

  // Validate options.
  ow(options.task, 'task', ow.function);
  ow(options.delay, 'delay', ow.any(ow.string, ow.number));

  // Parse expression and generate function that will compute intervals.
  parsedExpression = parseCronExpression(options.delay);


  return {
    on,
    start,
    suspend,
    getInterval,
    getTimeToNextRun
  };
}
