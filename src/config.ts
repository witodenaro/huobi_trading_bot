import dotenv from "dotenv";
dotenv.config();

export const config = {
  ACCESS_KEY: process.env.ACCESS_KEY as string,
  SECRET_KEY: process.env.SECRET_KEY as string,
  BASE_URL: process.env.BASE_URL as string,
  FUTURES_BASE_URL: process.env.FUTURES_BASE_URL as string,
  SIGNATURE_METHOD: process.env.SIGNATURE_METHOD as string,
  REST_SIGNATURE_VERSION: process.env.REST_SIGNATURE_VERSION as string,
  SPOT_SOCKET_SIGNATURE_VERSION: process.env
    .SPOT_SOCKET_SIGNATURE_VERSION as string,
  USDTM_SOCKET_SIGNATURE_VERSION: process.env
    .USDTM_SOCKET_SIGNATURE_VERSION as string,
};
