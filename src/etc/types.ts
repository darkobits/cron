/**
 * Names of the events emitted by Cron.
 */
export type CronEvent = 'start' | 'suspend' | 'task.start' | 'task.end' | 'error';


/**
 * Function returned by `parseCronExpression`.
 */
export interface NextFunction {
  (): number;
  type: 'cron' | 'simple';
  descriptor: {
    ms: number;
    humanized: string;
  };
}


/**
 * Options accepted by Cron.
 */
export interface CronOptions {
  /**
   * Accepts either a simple interval expressed in milliseconds or as a string
   * (ex: '10 minutes') or a cron expression (ex: '0 22 * * 1-5').
   */
  delay: string | number;

  /**
   * Function that will be called for each task run.
   */
  task: Function;
}


/**
 * Object returned by Cron.
 */
export interface CronInstance {
  /**
   * Registers a listener for an event emitted by Cron.
   */
  on(eventName: CronEvent, listener: (eventData?: any) => any): void;

  /**
   * Starts or re-starts the Cron. Returns a Promise that resolves when all
   * handlers for the 'start' event have finished.
   */
  start(): Promise<void | boolean>;

  /**
   * Suspends the Cron. Returns a Promise that resolves when all handlers for
   * the 'suspend' event have finished.
   */
  suspend(): Promise<void | boolean>;

  /**
   * When using a simple interval, returns the number of milliseconds between
   * intervals. When using cron expressions, returns -1.
   */
  getInterval: {
    (): number;

    /**
     * Returns a string describing when tasks will run.
     */
    humanized(): string;
  };

  /**
   * Returns the time remaining until the next task run begins in milliseconds.
   */
  timeToNextRun: {
    (): number;

    /**
     * Returns a string describing when the next task will run.
     */
    humanized(): string;
  };
}
