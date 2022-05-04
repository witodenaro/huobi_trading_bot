import { connection } from "websocket";
import { OrderNotificationMessage } from "../../connection/usdt-m/types";
import { ContractCode } from "../../types/order";
import { OrderListener, OrderFeedee, OrderNotification } from "../types";

abstract class BaseOrder implements OrderFeedee {
  abstract contractCode: ContractCode;
  abstract id: string;
  abstract channel: string;
  private _listeners: OrderListener[] = [];

  init(connection: connection) {
    const requestPayload = {
      op: "sub",
      cid: this.id,
      topic: this.channel,
    };

    connection.send(JSON.stringify(requestPayload));
  }

  handleMessage(message: OrderNotificationMessage) {
    const { order_id_str, status, client_order_id, order_source, price } =
      message;

    this._notifyListeners({
      order_id_str,
      status,
      client_order_id,
      order_source,
      price,
    });
  }

  addListener(listener: OrderListener) {
    this._listeners.push(listener);
  }

  removeListener(listener: OrderListener) {
    this._listeners = this._listeners.filter((sub) => listener !== sub);
  }

  private _notifyListeners(notification: OrderNotification) {
    this._listeners.forEach((listener) => {
      listener(notification);
    });
  }
}

export default BaseOrder;
