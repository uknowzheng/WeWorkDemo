import { post } from "../libs/request";

export function getContacts() {
  return post("/banana/im/friends/getContacts", {});
}
