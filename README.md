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
   * Accepts either a simple interval expressed in milliseconds or as a string
   * (ex: '10 minutes') or a cron expression (ex: '0 22 * * 1-5').
   */
  delay: string | number;

  /**
   * Function that will be called for each task run.
   */
  task: Function;
}
```

The object returned by Cron has the following shape:

```ts
interface CronInstance {
  /**
   * Registers a listener for an event emitted by Cron.
   */
  on(eventName: string, listener: (eventData?: any) => any): void;

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
```

## Example

Using a simple interval:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Make the world a better place here.
};

const cron = Cron({delay: '10 seconds' task});

cron.start();
```

Using a cron expression:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Save the whales here.
};

// Run at 12:00 on Wednesdays during every third month.
const cron = Cron({delay: '0 12 * */3 3' task});

cron.start();
```

Setting up event handlers:

```ts
import Cron from '@darkobits/cron';

const task = async () => {
  // Prevent forest fires here.
};

const cron = Cron({delay: '10 seconds' task});

cron.on('start', () => {
  console.log('Cron was started.');
});

cron.on('task.start', () => {
  console.log('Task was started');
});

cron.on('task.end', result => {
  console.log('Task finished. Result:', result);
  const nextRun = cron.timeToNextRun.humanized();
  console.log(`Next run: ${nextRun}.`);
});

cron.on('suspend', () => {
  console.log('Cron was suspended.');
});

cron.on('error', err => {
  console.log('Cron encountered an error:', err);
});

cron.start();
```

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
