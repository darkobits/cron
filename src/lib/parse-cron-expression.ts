import cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
import prettyMs from 'pretty-ms';
import ms from 'ms';

import {NextFunction} from 'etc/types';
import {lowercaseFirst} from 'lib/utils';


/**
 * Provided a string representing either (a) a valid crontab expression or (b) a
 * valid parse-able interval (ex: '10 seconds') returns a function that, when
 * invoked, will return a number representing the absolute time when the next
 * task run should begin.
 */
export default function parseCronExpression(exp: string | number): NextFunction {
  let _err: Error;

  // Ensure we were provided a string.
  if (typeof exp !== 'string' && typeof exp !== 'number') {
    throw new Error(`Expected type of first argument to be "string" or "number", got "${typeof exp}".`);
  }

  // ----- [1] Attempt to Parse as Cron Expression -----------------------------

  if (typeof exp === 'string') {
    try {
      const cronInterval = cronParser.parseExpression(exp);

      // @ts-ignore
      const nextFn: NextFunction = () => {
        return cronInterval.next().toDate().valueOf(); // - Date.now();
      };

      nextFn.descriptor = {
        ms: -1,
        humanized: lowercaseFirst(cronstrue.toString(exp))
      };

      nextFn.type = 'cron';

      return nextFn;
    } catch (err) {
      _err = err;
    }
  }


  // ----- [2] Attempt to Parse as Simple Interval -----------------------------

  try {
    const simpleInterval = typeof exp === 'string' ? ms(exp) : exp;

    // @ts-ignore
    const nextFn: NextFunction = () => {
      return Date.now() + simpleInterval;
    };

    nextFn.descriptor = {
      ms: simpleInterval,
      humanized: `every ${prettyMs(simpleInterval, {secondsDecimalDigits: 0, verbose: true})}`
    };

    nextFn.type = 'simple';

    return nextFn;
  } catch (err) {
    _err = err;
  }

  throw new Error(`Invalid expression: "${exp}": ${_err.message}`);
}
