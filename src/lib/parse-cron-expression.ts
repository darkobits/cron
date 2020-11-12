import cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
import ow from 'ow';
import prettyMs from 'pretty-ms';
import ms from 'ms';

import {ParsedExpression} from 'etc/types';
import {lowercaseFirst} from 'lib/utils';


/**
 * Provided a string representing either (a) a valid cron expression or (b) a
 * valid parse-able interval (ex: '10 seconds') returns a function that, when
 * invoked, will return a number representing the absolute time when the next
 * task run should begin.
 */
export default function parseCronExpression(exp: string | number): ParsedExpression {
  ow(exp, 'first argument', ow.any(ow.number, ow.string));

  /**
   * @private
   *
   * Shared error used across multiple try/catch blocks.
   */
  let commonError: Error;


  // ----- [1] Attempt to Parse as Cron Expression -----------------------------

  if (typeof exp === 'string') {
    try {
      const cronInterval = cronParser.parseExpression(exp);

      return {
        getNextInterval: () => {
          return cronInterval.next().toDate().valueOf();
        },
        type: 'cron',
        ms: -1,
        humanized: lowercaseFirst(cronstrue.toString(exp))
      };
    } catch (err) {
      commonError = err;
    }
  }


  // ----- [2] Attempt to Parse as Simple Interval -----------------------------

  try {
    const simpleInterval = typeof exp === 'string' ? ms(exp) : exp;

    return {
      getNextInterval: () => {
        return Date.now() + simpleInterval;
      },
      type: 'simple',
      ms: simpleInterval,
      humanized: `every ${prettyMs(simpleInterval, {secondsDecimalDigits: 0, verbose: true})}`
    };
  } catch (err) {
    commonError = err;
  }

  throw new Error(`Invalid expression: "${exp}": ${commonError.message}`);
}
