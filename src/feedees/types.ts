import { connection } from 'websocket';
import { PriceData } from '../connection/types';

export interface Feedee {
  _channel: string;
	init: (connection: connection) => void;
	handle: (message: PriceData) => void;
}
