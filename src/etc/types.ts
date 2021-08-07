/**
 * Names of the events emitted by Cron.
 */
export type CronEvent = 'start' | 'suspend' | 'task.start' | 'task.end' | 'error';


export type CronTask = (...args: Array<any>) => Promise<any> | any;


export interface CronOptions {
  type: 'cron' | 'interval';
  getNextInterval: () => number;
  ms: number;
  humanized: string;
  task: CronTask;
}


/**
 * Object returned by Cron.interval and Cron.expression.
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
  start: (eventData?: any) => Promise<void | boolean>;

  /**
   * If the Cron is running, suspends the Cron, emits the "suspend" event, and
   * resolves when all "suspend" event handlers have finished running.
   *
   * If the Cron is already suspended, resolves with `false`.
   */
  suspend: (eventData?: any) => Promise<void | boolean>;

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
