import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform {
  transform(value: any): any {
    if (!isValidObjectId(value)) {
      throw new NotFoundException('Not Found');
    }
    return value;
  }
}
