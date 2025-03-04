export const userConstraints = {
  login: {
    minLength: 3,
    maxLength: 10,
    regex: /^[a-zA-Z0-9_-]*$/,
  },
  passwordLength: {
    minLength: 6,
    maxLength: 20,
  },
  emailLength: {
    regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
} as const;
