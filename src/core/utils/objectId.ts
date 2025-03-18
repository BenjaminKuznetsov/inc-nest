import { ObjectId } from 'mongodb';

export function isValidObjectId(id: string | ObjectId): boolean {
  return ObjectId.isValid(id);
}
