import { getTimestamp } from "../auth/utils";

export const log = (...messages: any[]) => {
  console.log(`${getTimestamp()}:`, ...messages);
};
