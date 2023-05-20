import { timeDifference, base64toFile } from "@/libs/tools";

import {
  sendMessage,
  messageHistory,
  dialogBox,
  registerWebSocket,
  setRead,
  uploadAssets,
} from "@/api/chat";

const now = new Date();
// namespaced: true 的方式使其成为带命名空间的模块。保证在变量名一样的时候，添加一个父级名拼接。
// 例： SET_NAME => user/SET_NAME
const state = {
  // 对话好友列表
  chatlist: [],
  // 得知当前选择的是哪个对话
  selectChatId: null,
};
const mutations = {
  // 从localStorage 中获取数据
  initData(state, data) {
    state.chatlist = data;
  },
  // 得知用户当前选择的是哪个对话。便于匹配对应的对话框
  selectSession(state, value) {
    state.selectChatId = value;
    let chat = state.chatlist.find((session) => session.chatId === value);
    chat.noReadNum = 0;
  },
  // 更新聊天信息
  updateChatInfo(state, value) {
    let chat = state.chatlist.find(
      (session) => session.chatId === value.chatId
    );
    if (value.newMsgNum != null) {
      chat.newMsgNum = value.newMsgNum;
    }
    if (value.newMsgNum != null) {
      chat.isShow = value.isShow;
    }
    if (value.info.notDisturb != null) {
      chat.info.notDisturb = value.info.notDisturb;
    }
  },
  deleteChatByChatId(state, value) {
    let index = -1;
    for (let i = 0; i < state.chatlist.length; i++) {
      if (state.chatlist[i].chatId === value) {
        index = i;
      }
    }
    if (index > -1) {
      state.selectChatId = state.chatlist[index + 1].chatId;
      state.chatlist.splice(index, 1);
    }
  },
  // 发送信息
  sendMessage(state, { message }) {
    let result = state.chatlist.find(
      (session) => session.chatId === state.selectChatId
    );
    result.lastMsgTime = message.msgTime;
    result.messages.push(message);
  },
  changeMessageStatus: (state, data) => {
    const { contactId, id, status } = data;
    let chat = state.chatlist.find((session) => session.chatId === contactId);
    let message = chat.messages.find((msg) => msg.id === id);
    message.msgStatus = status;
  },

  // 置顶聊天
  topChat(state, chat) {
    let has = false;
    let index = -1;
    for (let i = 0; i < state.chatlist.length; i++) {
      if (state.chatlist[i].chatId === chat.chatId) {
        state.chatlist[i].id = 1;
        state.chatlist[i].index = 1;
        index = i;
        has = true;
      } else {
        state.chatlist[i].id++;
        state.chatlist[i].index++;
      }
    }
    if (has) {
      state.chatlist.unshift(state.chatlist.splice(index, 1)[0]);
    } else {
      chat.index = 1;
      chat.id = 1;
      state.chatlist.unshift(chat);
    }
  },
};
const actions = {
  selectSession: async ({ commit }, value) => {
    let chat = state.chatlist.find((session) => session.chatId === value);
    chat.messages.forEach(async (msg) => {
      if (msg.senderId !== state.user.info.wxid) {
        if (!msg.isRead) {
          await setRead({
            contactId: msg.contactId,
            id: msg.id,
          });
          msg.isRead = 1;
        }
      }
    });
    commit("selectSession", value);
  },
  initData: async ({ commit }) => {
    // TODO: 这里先是获取聊天室列表，后续要调用messageHistory加载每个聊天窗口的最近一次的历史信息列表，当用户进入窗口后，要遍历所有消息改成已读setRead
    const chatList = await dialogBox();
    let data = chatList.map((item, index) => {
      return {
        id: item.contactId,
        index: index + 1,
        chatId: item.contactId,
        contactId: item.contactId,
        contactName: item.contactName,
        avatar: item.avatar, //头像
        noReadNum: item.noReadNum,
        lastMsgTime: new Date(item.msgTime),
        messages: [],
      };
    });

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const messageList = await messageHistory({
        contactId: item.contactId,
        limit: 50,
        page: 1,
      });

      item.messages =
        messageList.map((item) => {
          return {
            date: now,
            showTime: true,
            contactId: item.contactId,
            id: item.id,
            isRead: item.isRead,
            msgContent: item.msgContent,
            msgExtend: item.msgExtend ? JSON.parse(item.msgExtend) : null,
            msgStatus: item.msgStatus,
            msgTime: item.msgTime,
            msgType: item.msgType,
            senderAvatar: item.senderAvatar,
            senderId: item.senderId,
            senderName: item.senderName,
          };
        }) || [];
    }
    return commit("initData", data);
  },
  initWSServer: ({ commit }) => {
    registerWebSocket(commit);
  },
  receiveMessage: async ({ state, commit }, data) => {
    let result = state.chatlist.find(
      (session) => session.chatId === data.senderId
    );
    let showTime = true;
    if (!result) {
      result = {
        id: data.senderId,
        chatId: data.senderId,
        contactId: data.senderId,
        contactName: data.senderName,
        avatar: data.senderAvatar, //头像
        noReadNum: 1,
        lastMsgTime: new Date(data.msgTime),
        messages: [],
      };
    } else {
      // 对比最后一条消息时间
      let interval = timeDifference(new Date(result.lastMsgTime), now);
      if (interval < 3) {
        showTime = false;
      }
    }
    let isRead = false;
    if (state.selectChatId !== result.chatId) {
      result.noReadNum = result.noReadNum + 1;
    } else {
      await setRead({
        contactId: data.senderId,
        id: data.id,
      });
      isRead = true;
    }
    result.lastMsgTime = new Date(data.msgTime);

    result.messages.push({
      date: new Date(data.msgTime),
      showTime: showTime,
      contactId: data.senderId,
      id: data.id,
      isRead: isRead,
      msgContent: data.msgContent,
      msgExtend: data.msgExtend ? JSON.parse(data.msgExtend) : null,
      msgStatus: data.msgStatus,
      msgTime: data.msgTime,
      msgType: data.msgType,
      senderAvatar: data.senderAvatar,
      senderId: data.senderId,
      senderName: data.senderName,
    });
    commit("topChat", result);
  },
  updateChatInfo: ({ commit }, value) => commit("updateChatInfo", value),
  deleteChatByChatId: ({ commit }, value) =>
    commit("deleteChatByChatId", value),
  uploadAssetsFile: async (_, file) => {
    const rsp = await uploadAssets(file);
    return rsp;
  },
  sendMessage: async ({ commit, state, rootState }, msg) => {
    const selectChatId = state.selectChatId;
    const { content, type } = msg;

    // let img = {
    //   width: 120,
    //   height: 120,
    //     {
    //     "width": 656,
    //     "height": 878,
    //     "src": "http://118.31.43.13:9000/material/20230519223644.png"
    // }
    // };
    // let file = {
    //   filename: 120,
    //   filesize: 120,
    // };
    // let video = {
    //   width: 120,
    //   height: 120,
    //   type: "video/mp4",
    // };
    // let audio = {
    //   width: 120,
    //   height: 120,
    //   type: "audio/mpeg",
    // };

    let reqData = null;
    switch (type) {
      case 2001:
        reqData = {
          contactId: selectChatId,
          msgContent: content,
          msgType: type,
        };
        break;
      case 2002:
      case 2003:
      case 2005:
        reqData = {
          contactId: selectChatId,
          msgContent: content.src,
          msgType: type,
          msgExtend: JSON.stringify(content),
        };
        break;
      default:
        break;
    }

    const { contactId, id, ownerId, status } = await sendMessage(reqData);

    let result = state.chatlist.find(
      (session) => session.chatId === state.selectChatId
    );
    let now = new Date();
    // 获取最后一条消息时间
    let interval = timeDifference(result.lastMsgTime, now);
    let showTime = false;
    if (interval > 3) {
      showTime = true;
    }
    const message = {
      date: now,
      showTime: showTime,
      contactId: reqData.contactId,
      id: id,
      isRead: 0,
      msgContent: reqData.msgContent,
      msgExtend: content,
      msgStatus: status,
      msgTime: new Date(),
      msgType: reqData.msgType,
      senderAvatar: rootState.user.info.avatar,
      senderId: ownerId,
      senderName: rootState.user.info.username,
    };
    commit("sendMessage", {
      message,
    });
  },

  topChat: ({ commit }, chat) => commit("topChat", chat),
};

const getters = {
  getTotalNewMsgs(state) {
    let nums = 0;
    for (let i = 0; i < state.chatlist.length; i++) {
      if (state.chatlist[i].noReadNum > 0) {
        nums += state.chatlist[i].noReadNum;
      }
    }
    return nums;
  },
  // 筛选出含有搜索值的聊天列表
  searchedChatlist(state, getters, rootState) {
    let sessions = state.chatlist.filter((sessions) =>
      sessions.contactName.includes(rootState.system.searchText)
    );
    return sessions;
  },
  getChatIndex: (state) => (chatId) => {
    for (let i = 0; i < state.chatlist.length; i++) {
      if (state.chatlist[i].chatId == chatId) {
        return i;
      }
    }
    return -1;
  },
  // 筛选出含有搜索值的聊天列表
  getChatByChatId(state, getters, rootState) {
    return function (chatId) {
      return state.chatlist.find((session) => session.chatId === chatId);
    };
  },
  // 通过当前选择是哪个对话匹配相应的对话
  selectedChat(state) {
    let session = state.chatlist.find(
      (session) => session.chatId === state.selectChatId
    );
    return session;
  },
  messages(state) {
    let session = state.chatlist.find(
      (session) => session.chatId === state.selectChatId
    );
    return session.messages;
  },
  getChatSize(state) {
    return (state.chatlist && state.chatlist.size) || 0;
  },
};

export default {
  namespaced: true,
  // namespaced: true 的方式使其成为带命名空间的模块。保证在变量名一样的时候，添加一个父级名拼接。
  // 例： SET_NAME => user/SET_NAME
  state,
  mutations,
  actions,
  getters,
};
