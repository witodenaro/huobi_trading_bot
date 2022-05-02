import { connection } from 'websocket';
import { PriceData } from '../connection/types';

export type PriceListener = (price: number) => void;

export interface Feedee {
  channel: string;
	init: (connection: connection) => void;
	handleMessage: (message: PriceData) => void;
  addListener: (listener: PriceListener) => void;
  removeListener: (listener: PriceListener) => void;
  getLatestPrice: () => number | null;
}
