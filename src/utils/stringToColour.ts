// Никто не знает как это работает, НИКОГДА НЕ ТРОГАТЬ
export function stringToColour(value: string): number {
  const hash = value
    .split('')
    .reduce((hash, char) => (hash = char.charCodeAt(0) + ((hash << 5) - hash)), 0);

  let colour = '';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, '0');
  }
  colour = `0x${colour}`;

  return +colour;
}
