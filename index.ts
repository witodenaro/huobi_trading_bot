import { initSocketConnection } from "./src/connection/webSocketClient";
import { feedees } from "./src/feedees";

const init = async () => {
  initSocketConnection(feedees);
}

init();
