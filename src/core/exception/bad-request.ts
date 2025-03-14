import { BadRequestException } from '@nestjs/common';

type FieldError = {
  field: string;
  message: string;
};

export class CustomBadRequestException extends BadRequestException {
  constructor({ field, message }: FieldError) {
    super({
      errorsMessages: [
        {
          field,
          message,
        },
      ],
    });
  }
}
