import { post } from "../libs/request";
import CustomSocketIO from "../libs/websocket";
import { getCookie, TOKEN_KEY } from "../libs/util";

export function dialogBox() {
  return post("/banana/im/chat/dialogBox");
}

export function messageHistory(
  params = {
    contactId: "",
    limit: "",
    ownerId: "",
    page: "",
  }
) {
  return post("/banana/im/chat/messageHistory", params);
}

export function sendMessage(
  params = {
    contactId: "",
    msgContent: "",
    msgExtend: "",
    msgMins: 0,
    msgType: 0,
    ownId: "",
  }
) {
  return post("/banana/im/chat/sendMessage", params);
}

export function setRead(
  params = {
    contactId: "",
    id: "",
    ownerId: "",
  }
) {
  return post("/banana/im/chat/setRead", params);
}

export function registerWebSocket() {
  const token = getCookie(TOKEN_KEY);
  const socket = new CustomSocketIO(`/banana/websocket/msg/${token}`);

  // 建立连接
  socket.connect();

  // 设置不同类型响应的处理函数
  socket.setResponseHandler("success", (data) => {
    console.log("处理类型为 success 的响应:", data);
  });

  socket.setResponseHandler("error", (data) => {
    console.log("处理类型为 error 的响应:", data);
  });

  // 发送事件
  socket.emit("request", { id: 1 }, (response) => {
    console.log("收到响应:", response);
  });

  // 断开连接
  // socket.disconnect();
}
