import { post } from "@/libs/request";

//{ password: "", username: "" }
export function login(params) {
  return post("/banana/im/doLogin", params);
}

export function logout(params) {
  return post("/banana/im/logout", params);
}
