import {lowercaseFirst} from './utils';


describe('lowercaseFirst', () => {
  it('should lowercase the first character of the provided string', () => {
    const input = 'Foo';
    const expected = 'foo';
    const result = lowercaseFirst(input);
    expect(result).toStrictEqual(expected);
  });
});
