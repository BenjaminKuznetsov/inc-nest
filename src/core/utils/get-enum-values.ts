export function getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
  return Object.values(enumObj);
}
