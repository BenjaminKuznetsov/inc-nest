import { validateSync } from 'class-validator';

export function validateConfig(configInstance: any) {
  const errors = validateSync(configInstance);
  if (errors.length > 0) {
    const sortedMessages = errors
      .map((error) => {
        const currentValue = error.value;
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${constraints} (current value: ${currentValue})`;
      })
      .join('; ');
    throw new Error('Validation failed: ' + sortedMessages);
  }
}

export function convertToBoolean(value: string): boolean | null {
  const trimmedValue = value?.trim();
  if (trimmedValue === 'true') return true;
  if (trimmedValue === '1') return true;
  if (trimmedValue === 'false') return false;
  if (trimmedValue === '0') return false;

  return null;
}
