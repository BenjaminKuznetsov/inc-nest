export const encodeToBase64 = (value: string): string =>
  Buffer.from(value, 'utf8').toString('base64');
