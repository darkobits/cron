/**
 * Names of the events emitted by Cron.
 */
export type CronEvent = 'start' | 'suspend' | 'task.start' | 'task.end' | 'error';


/**
 * Function returned by `parseCronExpression`.
 */
export interface ParsedExpression {
  getNextInterval: () => number;
  type: 'cron' | 'simple';
  ms: number;
  humanized: string;
}


/**
 * Options accepted by Cron.
 */
export interface CronOptions {
  /**
   * Accepts either a simple interval expressed in milliseconds (ex: 10000) or a
   * string describing an interval (ex: '10 seconds') or a cron expression
   * (ex: '0 22 * * 1-5').
   */
  delay: string | number;

  /**
   * Function that will be called for each task run.
   */
  task: (...args: Array<any>) => Promise<any> | any;
}


/**
 * Object returned by Cron.
 */
export interface CronInstance {
  /**
   * Registers a listener for an event emitted by Cron.
   */
  on: (eventName: CronEvent, listener: (eventData?: any) => any) => void;

  /**
   * If the Cron is suspended, starts the Cron, emits the "start" event, and
   * resolves when all "start" event handlers have finished running.
   *
   * If the Cron is already running, resolves with `false`.
   */
  start: () => Promise<void | boolean>;

  /**
   * If the Cron is running, suspends the Cron, emits the "suspend" event, and
   * resolves when all "suspend" event handlers have finished running.
   *
   * If the Cron is already suspended, resolves with `false`.
   */
  suspend: () => Promise<void | boolean>;

  /**
   * When using a simple interval, returns the number of milliseconds between
   * intervals.
   *
   * When using a cron expression, returns -1, as intervals between runs may be
   * variable.
   */
  getInterval: {
    (): number;

    /**
     * Returns a string describing when tasks will run in humanized form.
     *
     * @example
     *
     * 'Every 30 minutes on Wednesdays.'
     */
    humanized: () => string;
  };

  /**
   * Returns the time remaining until the next task run begins in milliseconds.
   */
  getTimeToNextRun: {
    (): number;

    /**
     * Returns a string describing when the next task will run in humanized
     * form.
     *
     * @example
     *
     * 'In 10 minutes.'
     */
    humanized: () => string;
  };
}
