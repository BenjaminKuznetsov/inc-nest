export type AccessTokenPayload = {
  userId: string;
  iat: number;
  exp: number;
};

export type RefreshTokenPayload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};
