<a href="#top" id="top">
  <a href="https://www.linguee.com/english-french/search?source=auto&query=cron"><img src="https://user-images.githubusercontent.com/441546/101615982-a683e600-39c3-11eb-9343-5dabc6b55ca1.png" style="max-width: 100%;"></a>
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/cron"><img src="https://img.shields.io/npm/v/@darkobits/cron.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/cron/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/darkobits/cron/CI/master?style=flat-square"></a>
  <a href="https://app.codecov.io/gh/darkobits/cron/branch/master"><img src="https://img.shields.io/codecov/c/github/darkobits/cron/master?style=flat-square"></a>
  <a href="https://depfu.com/github/darkobits/cron"><img src="https://img.shields.io/depfu/darkobits/cron?style=flat-square"></a>
  <a href="https://bundlephobia.com/package/@darkobits/cron"><img src="https://img.shields.io/bundlephobia/minzip/@darkobits/cron?label=size&style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/static/v1?label=commits&message=conventional&style=flat-square&color=398AFB"></a>
</p>

Cron is a utility that will run a function on an interval or according to a [cron expression](https://en.wikipedia.org/wiki/Cron#CRON_expression).

# Install

```
npm i @darkobits/cron
```

# Use

This package's default export is a function that may be used to create a `Cron`
instance that executes a function according to a cron expression. Additionally,
the `.interval` function may be used to create a Cron instance that executes a
function at a fixed interval.

## `cron()`

This function accepts a cron expression and a function. It returns a `Cron`
instance that will invoke the provided function according to the cron
expression.

**Example:**

```ts
import cron from '@darkobits/cron';

// Run at 12:00 on Wednesdays every third month.
cron('0 12 * */3 3', async () => {
  // Save the whales here.
});
```

## `cron.interval()`

This function accepts a number (milliseconds) or a string (parsed by `ms`)
describing an interval and a function. It returns a `Cron` instance that calls
the provided function according to the provided interval.

**Example:**

The following two invocations are functionally equivalent:

```ts
import cron from '@darkobits/cron';

cron.interval(5000, async () => {
  // Make the world a better place here.
});

Cron.interval('5 seconds', async () => {
  // Solve climate change here.
});
```

## `Cron` Instance

The object returned by either of these functions has the following shape:

```ts
interface Cron {
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
  start(eventData?: any): Promise<void | false>;

  /**
   * If the Cron is running, suspends the Cron, emits the "suspend" event, and
   * resolves when all "suspend" event handlers have finished running.
   *
   * If the Cron is already suspended, resolves with `false`.
   */
  suspend(eventData?: any): Promise<void | false>;

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

A `Cron` instance emits the following lifecycle events:

### `start`

Emitted when the Cron is started.

### `task.start`

Emitted when a task is about to run.

### `task.end`

Emitted after a task finishes running. This callback will receive the return
value of the task function.

### `suspend`

Emitted when the Cron is suspended.

### `error`

Emitted when the `Cron` (or a task) encounters an error. This callback will
receive the error thrown.

**Example:**

```ts
import cron from '@darkobits/cron';

const myCron = cron('10 seconds', async () => {
  // Prevent California wildfires here.
  return 'done';
});

myCron.on('start', () => {
  console.log('Cron was started.');
});

myCron.on('task.start', () => {
  console.log('Task was started');
});

myCron.on('task.end', result => {
  console.log('Task finished. Result:', result); // => result == 'done'
  const nextRun = cron.getTimeToNextRun.humanized();
  console.log(`Next run: ${nextRun}.`);
});

// Here, we use the 'error' event to suspend the Cron and pass the error to the
// 'suspend' handler.
myCron.on('error', err => {
  console.log('Suspending Cron due to error:', err);
  cron.suspend(err);
});

myCron.on('suspend', (eventData) => {
  console.log('Cron was suspended.');

  if (eventData instanceof Error) {
    // We suspended due to an error.
  } else {
    // We suspended normally.
  }
});

myCron.start();
```

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/102322726-5e6d4200-3f34-11eb-89f2-c31624ab7488.png" style="max-width: 100%;">
</a>
