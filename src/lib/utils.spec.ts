import {
  validate,
  lowercaseFirst
} from './utils';


describe('validate', () => {
  describe('when the provided value matches one of the provided types', () => {
    it('should now throw an error', () => {
      const value = 1;
      const types = 'number';

      expect(() => {
        validate(value, 'value', types);
      }).not.toThrow();

      const value2 = {};
      const types2 = ['object', 'function'];

      expect(() => {
        validate(value2, 'value2', types2);
      }).not.toThrow();
    });
  });

  describe('when the provided value does not match any of the provided types', () => {
    it('should throw an error', () => {
      const value = 1;
      const types = 'string';

      expect(() => {
        validate(value, 'value', types);
      }).toThrow('Expected type of value to be "string", got "number".');

      const value2 = {};
      const types2 = ['number', 'boolean'];

      expect(() => {
        validate(value2, 'value2', types2);
      }).toThrow('Expected type of value2 to be "number", or "boolean", got "object".');
    });
  });
});

describe('lowercaseFirst', () => {
  it('should lowercase the first character of the provided string', () => {
    const input = 'Foo';
    const expected = 'foo';
    const result = lowercaseFirst(input);
    expect(result).toStrictEqual(expected);
  });
});
