/**
 * Provided a string, returns a new string with the first character lower-cased.
 */
export function lowercaseFirst(str: string) {
  return str.substr(0, 1).toLowerCase() + str.substr(1);
}
