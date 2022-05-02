import dotenv from 'dotenv';
dotenv.config();

export const config = {
	ACCESS_KEY: process.env.ACCESS_KEY as string,
	SECRET_KEY: process.env.SECRET_KEY as string,
	BASE_URL: process.env.BASE_URL as string,
	FUTURES_BASE_URL: process.env.FUTURES_BASE_URL as string,
	SIGNATURE_METHOD: process.env.SIGNATURE_METHOD as string,
	SIGNATURE_VERSION: process.env.SIGNATURE_VERSION as string,
	SOCKET_SIGNATURE_VERSION: process.env.SOCKET_SIGNATURE_VERSION as string,
};