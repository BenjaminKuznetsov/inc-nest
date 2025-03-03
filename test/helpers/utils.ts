export const isValidIsoDate = (date: string): boolean => {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  return isoDateRegex.test(date) && !isNaN(Date.parse(date));
};

export const getStringWithLength = (length: number) => {
  return 'a'.repeat(length);
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
