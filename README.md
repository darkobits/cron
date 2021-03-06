<a href="#top" id="top">
  <a href="https://www.linguee.com/english-french/search?source=auto&query=cron"><img src="https://user-images.githubusercontent.com/441546/101615982-a683e600-39c3-11eb-9343-5dabc6b55ca1.png" style="max-width: 100%;"></a>
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/cron"><img src="https://img.shields.io/npm/v/@darkobits/cron.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/cron/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/darkobits/cron/CI/master?style=flat-square"></a>
  <a href="https://app.codecov.io/gh/darkobits/cron/branch/master"><img src="https://img.shields.io/codecov/c/github/darkobits/cron/master?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/cron"><img src="https://img.shields.io/david/darkobits/cron.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
</p>

Cron is a utility that will run a function on an interval or according to a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

# Install

```
npm i @darkobits/cron
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
  start(): Promise<void | false>;

  /**
   * If the Cron is running, suspends the Cron, emits the "suspend" event, and
   * resolves when all "suspend" event handlers have finished running.
   *
   * If the Cron is already suspended, resolves with `false`.
   */
  suspend(): Promise<void | false>;

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

## Simple Intervals vs. Cron Expressions

When using a simple interval with Cron (ex: `10 seconds`), Cron will run its task, and then wait 10 seconds before running its task again. Therefore, if a task takes on average 20 seconds to complete, Cron will _start_ new task runs approximately every 30 seconds. This prevents concurrent task runs that may lead to race conditions or unintended side-effects.

However, when using a cron expression (ex: `0 * * * *`, or every hour), Cron will _always_ begin a new task run at the top of the hour, whether or not the last task run has finished. It is therefore up to the developer to understand approximately how long their tasks take and how often to execute them to avoid concurrent task runs.

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

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/102322726-5e6d4200-3f34-11eb-89f2-c31624ab7488.png" style="max-width: 100%;">
</a>
