/**
 * Provided a value, label, and expected type, throws a TypeError if the value
 * is not of the expected type.
 */
export function validate(value: any, label: string, expected: string | Array<string>) {
  const types = Array.isArray(expected) ? expected : [expected];
  const isValid = types.reduce((result, curType) => result || typeof value === curType, false);

  if (!isValid) {
    throw new TypeError(`Expected type of ${label} to be "${types.join('", or "')}", got "${typeof value}".`);
  }
}


/**
 * Provided a string, returns a new string with the first character lower-cased.
 */
export function lowercaseFirst(str: string) {
  return str.substr(0, 1).toLowerCase() + str.substr(1);
}
