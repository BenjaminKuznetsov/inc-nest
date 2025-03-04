import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { Trim } from './trim';

/**
 * A decorator that validates a string property.
 *
 * @description
 * This decorator is a composition of built-in class-validator decorators.
 * The following decorators are applied:
 * - `IsString` - validates if the value is a string
 * - `Trim` - trims the string
 * - `IsOptional` - if the `optional` option is true, the validation is skipped if the value is null or undefined
 * - `IsNotEmpty` - if the `optional` option is false, the validation fails if the value is null or undefined
 * - `Length` - if both `min` and `max` options are provided, the length of the string must be in the range [min, max]
 * - `MinLength` - if only the `min` option is provided, the length of the string must be greater than or equal to min
 * - `MaxLength` - if only the `max` option is provided, the length of the string must be less than or equal to max
 *
 * @param {Object} params - An object with options
 * @param {number} [params.min] - The minimum length of the string
 * @param {number} [params.max] - The maximum length of the string
 * @param {RegExp} [params.regex] - A regular expression to validate the string
 * @param {boolean} [params.optional] - Whether the property is optional
 *
 * @returns {Function} A decorator that can be used to validate a property
 */

export function ValidateString(params: { min?: number; max?: number; regex?: RegExp; optional?: boolean } = {}) {
  const { min, max, regex, optional = false } = params;
  const decorators = [IsString(), Trim()];

  if (optional) {
    decorators.push(IsOptional());
  } else {
    decorators.push(IsNotEmpty());
  }

  if (min !== undefined && max !== undefined) {
    decorators.push(Length(min, max));
  } else if (min !== undefined) {
    decorators.push(MinLength(min));
  } else if (max !== undefined) {
    decorators.push(MaxLength(max));
  }

  if (regex) {
    decorators.push(Matches(regex));
  }

  return applyDecorators(...decorators);
}
