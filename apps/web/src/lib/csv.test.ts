import { escapeCell, toCsv } from './csv';

describe('escapeCell — RFC-4180 quoting', () => {
  it.each([
    ['plain', 'plain'],
    ['with, comma', '"with, comma"'],
    ['with "quotes"', '"with ""quotes"""'],
    ['line\nbreak', '"line\nbreak"'],
  ])('escapes %p', (input, expected) => {
    expect(escapeCell(input)).toBe(expected);
  });

  it.each([
    [null, ''],
    [0, '0'],
    [false, 'false'],
    [142, '142'],
  ])('renders %p as %p', (input, expected) => {
    expect(escapeCell(input)).toBe(expected);
  });
});

// These exports are opened in Excel and Sheets and handed to a physician, so a
// note the user typed must never be evaluated as a formula.
describe('escapeCell — formula injection', () => {
  it.each([
    ['=1+1', "'=1+1"],
    ['=HYPERLINK("http://evil.test","click")', '"\'=HYPERLINK(""http://evil.test"",""click"")"'],
    ['+1234', "'+1234"],
    ['-1+2', "'-1+2"],
    ['@SUM(A1:A9)', "'@SUM(A1:A9)"],
    ['\tcmd', "'\tcmd"],
  ])('neutralises %p', (input, expected) => {
    expect(escapeCell(input)).toBe(expected);
  });

  it('leaves a leading character alone when it appears mid-value', () => {
    expect(escapeCell('BG was =120 today')).toBe('BG was =120 today');
  });

  it('still quotes a neutralised cell that also contains a comma', () => {
    expect(escapeCell('=A1,B2')).toBe('"\'=A1,B2"');
  });
});

describe('toCsv', () => {
  it('writes a header row followed by one line per record', () => {
    const csv = toCsv(
      ['value', 'notes'],
      [
        [120, 'after lunch'],
        [98, null],
      ]
    );

    expect(csv).toBe('value,notes\n120,after lunch\n98,');
  });

  it('escapes every cell it writes', () => {
    expect(toCsv(['notes'], [['=cmd|"/c calc"!A1']])).toContain('"\'=cmd|""/c calc""!A1"');
  });
});
