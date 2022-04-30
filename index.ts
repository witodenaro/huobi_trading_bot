import { getAccountValuation } from "./src/api/v2/account/valuation";
import { initSocketConnection } from "./src/connection/webSocketClient";

const init = async () => {
  initSocketConnection()
  const { data } = await getAccountValuation();

  console.log(data.data.totalBalance);
}

init();
