export class CreateUserDto {
  login: string;
  email: string;
  password: string;
}

export class CreateUserOptions {
  isCreatedByAdmin: boolean = false;
}
