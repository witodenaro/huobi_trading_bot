import Pako from 'pako';
import { Message } from 'websocket';

export const parseWebsocketMessage = (message: Message) => {
	if (message.type === 'binary') {
		const uncompressedMessage = Pako.ungzip(message.binaryData).buffer;
		const bufferedMessage = Buffer.from(uncompressedMessage);

		return JSON.parse(bufferedMessage.toString());
	} else if (message.type === 'utf8') {
    return JSON.parse(message.utf8Data);
  }
};
