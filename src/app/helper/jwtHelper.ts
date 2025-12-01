import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const createAccessToken = (
  payload: Record<string, unknown>,
  secret: string,
  expireTime: string
): string => {
  const options: SignOptions = {
    expiresIn: expireTime as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

const createRefreshToken = (
  payload: Record<string, unknown>,
  secret: string,
  expireTime: string
): string => {
  const options: SignOptions = {
    expiresIn: expireTime as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

const createTokens = (
  payload: Record<string, unknown>,
  accessSecret: string,
  refreshSecret: string,
  accessExpire: string,
  refreshExpire: string
) => {
  const accessToken = createAccessToken(payload, accessSecret, accessExpire);
  const refreshToken = createRefreshToken(payload, refreshSecret, refreshExpire);
  
  return {
    accessToken,
    refreshToken,
  };
};

export const jwtHelpers = {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  createTokens,
};