export const symbols = [
  { char: '<', combo: 'Ctrl + Alt + ,', code: 'Comma' },
  { char: '>', combo: 'Ctrl + Alt + .', code: 'Period' },
  { char: '&', combo: 'Ctrl + Alt + C', code: 'KeyC' },
  { char: '/', combo: 'Shift + ú', code: 'BracketLeft' },
  { char: '*', combo: 'Ctrl + Alt + -', code: 'Slash' },
  { char: '(', combo: 'Shift + )', code: 'BracketRight' },
  { char: ')', combo: ')', code: 'BracketRight' },
  { char: '+', combo: '+', code: 'Digit1' },
  { char: '-', combo: '-', code: 'Slash' },
  { char: '"', combo: 'Shift + ů', code: 'Semicolon' },
  { char: '=', combo: '=', code: 'Minus' },
  { char: '[', combo: 'Ctrl + Alt + F', code: 'KeyF' },
  { char: ']', combo: 'Ctrl + Alt + G', code: 'KeyG' },
  { char: '@', combo: 'Ctrl + Alt + V', code: 'KeyV' },
  { char: '_', combo: 'Shift + -', code: 'Slash' },
  { char: '\\', combo: 'Ctrl + Alt + Q', code: 'KeyQ' },
  { char: '|', combo: 'Ctrl + Alt + W', code: 'KeyW' },
  { char: ':', combo: 'Shift + .', code: 'Period' },
  { char: ';', combo: '; (vlevo od 1)', code: 'Backquote' },
  { char: '%', combo: 'Shift + =', code: 'Minus' },
];
export const symbolPatterns = [
  'A1<10 B1>5 A1<=B1 A1>=0 A1<>B1',
  '=IF(A1>10,"yes","no") =IF(B1<5,"low","high")',
  '=A1*B1 =(A1+B1)/2 =A1-B1 =C1/100',
  '="A"&"B" ="Hello "&A1 =IF(A1<>"",A1,"empty")',
  '=SUM(A1:A5) =AVERAGE(B1:B5) =COUNT(C1:C9)',
  '=IF(A1>=10;"yes";"no") =SUM(A1;B1;C1)',
  '(12+8)/2 3*4=12 [A1] "text" A1<>""',
];
export function symbolText(char: string, seed = 0) {
  let pool = symbolPatterns.filter((p) => p.includes(char));
  if (!pool.length) pool = [`${char} ${char} ${char}`, `A${char}B ${char} text${char}text`];
  const offset = Math.abs(seed) % pool.length;
  pool = [...pool.slice(offset), ...pool.slice(0, offset)];
  return pool.slice(0, 3).join(' ');
}
