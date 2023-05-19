import { post, uploadFile } from "../libs/request";
import CustomSocketIO from "../libs/websocket";
import { getCookie, TOKEN_KEY } from "../libs/util";
import Vue from "vue";

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
export function uploadAssets(filePath) {
  const formData = new FormData();
  formData.append("file", filePath);
  return uploadFile("/banana/im/file/upload", formData);
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
  const socket = new CustomSocketIO(
    `ws://118.31.43.13:8008/banana/websocket/msg/${token}`
  );

  // 建立连接
  socket.connect();
  // 设置不同类型响应的处理函数
  socket.setResponseHandler("heartBeat", () => {
    console.log("处理类型为heartBeat的响应!");
    socket.sendMessage({
      type: "heartBeat",
      data: "1",
    });
  });

  socket.setResponseHandler("chatSendStatus", (data) => {
    console.log("收到chatSendStatus消息:", data);
    Vue.prototype.$store.dispatch("chat/", data);
  });

  socket.setResponseHandler("singleChat", (data) => {
    console.log("收到singleChat消息:", data);
    Vue.prototype.$store.dispatch("chat/receiveMessage", data);
  });
  socket.setResponseHandler("onlineStatus", (data) => {
    console.log("收到onlineStatus消息:", data);
    Vue.prototype.$store.commit("friend/onlineStatusChange", data);
  });

  // 断开连接
  // socket.disconnect();
}
