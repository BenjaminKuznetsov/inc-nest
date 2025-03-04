export function encodeToBase64(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64');
}
