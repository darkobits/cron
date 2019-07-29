<a href="#top" id="top">
  <a href="https://www.linguee.com/english-french/search?source=auto&query=cron"><img src="https://user-images.githubusercontent.com/441546/61255289-cce51980-a71c-11e9-80c0-32cf4df74821.png" style="max-width: 100%;"></a>
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/cron"><img src="https://img.shields.io/npm/v/@darkobits/cron.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/cron"><img src="https://img.shields.io/travis/darkobits/cron.svg?style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/cron"><img src="https://img.shields.io/codacy/coverage/eb849d4f9f20449aa80058a740b04278.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/cron"><img src="https://img.shields.io/david/darkobits/cron.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
</p>

Cron is a utility that will run a function on an interval or according to a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

# Install

```
npm i -D @darkobits/cron
```

# Use

This package's default export is a factory function that accepts an options object of the following shape:

```ts
interface CronOptions {
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
```

The object returned by Cron has the following shape:

```ts
interface CronInstance {
  /**
   * Registers a listener for an event emitted by Cron.
   */
  on(eventName: CronEvent, listener: (eventData?: any) => any): void;

  /**
   * If the Cron is suspended, starts the Cron, emits the "start" event, and
   * resolves when all "start" event handlers have finished running.
   *
   * If the Cron is already running, resolves with `false`.
   */
  start(): Promise<void | boolean>;

  /**
   * If the Cron is running, suspends the Cron, emits the "suspend" event, and
   * resolves when all "suspend" event handlers have finished running.
   *
   * If the Cron is already suspended, resolves with `false`.
   */
  suspend(): Promise<void | boolean>;

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
    humanized(): string;
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
    humanized(): string;
  };
}
```

## Events

Cron emits the following events:

### `start`

Emitted when the Cron is started.

### `task.start`

Emitted when a task is about to run.

### `task.end`

Emitted after a task finishes running. This callback will receive the return value of the task function.

### `suspend`

Emitted when the Cron is suspended.

### `error`

Emitted when the Cron (or a task) encounters an error. This callback will receive the error thrown.

## Example

Using a simple interval:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Make the world a better place here.
};

const cron = Cron({delay: '10 seconds', task});

cron.start();
```

Using a cron expression:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Save the whales here.
};

// Run at 12:00 on Wednesdays during every third month.
const cron = Cron({delay: '0 12 * */3 3', task});

cron.start();
```

Setting up event handlers:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Prevent forest fires here.
};

const cron = Cron({delay: '10 seconds', task});

cron.on('start', () => {
  console.log('Cron was started.');
});

cron.on('task.start', () => {
  console.log('Task was started');
});

cron.on('task.end', result => {
  console.log('Task finished. Result:', result);
  const nextRun = cron.getTimeToNextRun.humanized();
  console.log(`Next run: ${nextRun}.`);
});

cron.on('error', err => {
  console.log('Suspending Cron due to error:', err);
  cron.suspend();
});

cron.on('suspend', () => {
  console.log('Cron was suspended.');
});

cron.start();
```

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
