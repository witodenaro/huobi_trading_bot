import axios from "axios";
import { log } from "../utils/logger";

export const requester = axios.create();

requester.interceptors.request.use((config) => {
  log(" --- REQUEST --- ");
  log(`${config.method?.toUpperCase()}: ${config.url}`);
  log("Body: ", config.data);
  log("Params: ", config.params);
  log(" --- END ---");

  return config;
});
