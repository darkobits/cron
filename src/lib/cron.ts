import sleep from '@darkobits/sleep';
import Emittery from 'emittery';
import prettyMs from 'pretty-ms';

import {CronEvent, CronOptions, CronInstance} from 'etc/types';
import parseCronExpression from 'lib/parse-cron-expression';
import {validate} from 'lib/utils';


/**
 * Provided a CronOptions object, returns a Cron object.
 */
export default function Cron(options: CronOptions): CronInstance {
  // Validate options.
  validate(options.task, '"task"', 'function');
  validate(options.delay, '"delay"', ['string', 'number']);


  /**
   * @private
   *
   * Tracks whether we are running or suspended.
   */
  let _isRunning = false;


  /**
   * @private
   *
   * Number of milliseconds until the next task run begins.
   */
  let _nextRun = Date.now();


  /**
   * @private
   *
   * Event emitter for the Cron.
   */
  const _emitter = new Emittery();


  /**
   * @private
   *
   * Function that will return the delay (in milliseconds) until we should run
   * our task again.
   */
  const _getNextRun = parseCronExpression(options.delay);


  // ----- Private Methods -----------------------------------------------------

  /**
   * @private
   *
   * Function that will run the Cron's task and emit related events.
   */
  const _run = async () => {
    // For 'cron' expressions, compute the time to the next run immediately, and
    // always wait until the next interval period before running the task for
    // the first time.
    if (_getNextRun.type === 'cron') {
      _nextRun = _getNextRun();
      await sleep(_nextRun - Date.now());
    }

    try {
      await _emitter.emit('task.start');
      const result = await options.task();
      await _emitter.emit('task.end', result);
    } catch (err) {
      await _emitter.emit('error', err);
    } finally {
      // Check that we are still running before scheduling the next task.
      // Something may have called suspend() while the task was running or in an
      // event handler.
      if (_isRunning) {
        // For 'simple' intervals, wait after running the task for the first
        // time to compute the time until the next run, then wait.
        if (_getNextRun.type === 'simple') {
          _nextRun = _getNextRun();
          await sleep(_nextRun - Date.now());
        }

        // Schedule the next task.
        _run(); // tslint:disable-line no-floating-promises
      }
    }
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * Registers a listener for an event emitted by Cron.
   */
  const on = (eventName: CronEvent, listener: (eventData?: any) => any) => {
    _emitter.on(eventName, listener);
  };


  /**
   * Starts or re-starts the Cron. Returns a Promise that resolves when all
   * handlers for the 'start' event have finished.
   */
  const start = async () => {
    if (!_isRunning) {
      _isRunning = true;
      await _emitter.emit('start');
      _run(); // tslint:disable-line no-floating-promises
    }

    return false;
  };


  /**
   * Suspends the Cron. Returns a Promise that resolves when all handlers for
   * the 'suspend' event have finished.
   */
  const suspend = async () => {
    if (_isRunning) {
      _isRunning = false;
      return _emitter.emit('suspend'); // tslint:disable-line no-floating-promises
    }

    return false;
  };


  /**
   * Returns a string describing approximately how often
   */
  const getInterval = () => {
    return _getNextRun.descriptor.ms;
  };


  /**
   * Returns a description of the time between intervals in humanized form.
   */
  getInterval.humanized = () => {
    return _getNextRun.descriptor.humanized;
  };


  /**
   * Returns the time remaining until the next task run in milliseconds.
   */
  const timeToNextRun = () => {
    const ms = _nextRun - Date.now();
    return ms < 0 ? 0 : ms;
  };


  /**
   * Returns the time remaining until the next task run in humanized form.
   */
  timeToNextRun.humanized = () => {
    const ms = timeToNextRun();
    return ms < 0 ? 'now' : `in ${prettyMs(ms, {secondsDecimalDigits: 0, verbose: true})}`;
  };


  return {
    on,
    start,
    suspend,
    getInterval,
    timeToNextRun
  };
}
