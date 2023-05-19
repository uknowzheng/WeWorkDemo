import { timeDifference, base64toFile } from "@/libs/tools";

import { sendMessage, dialogBox } from "@/api/chat";
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
    chat.newMsgNum = 0;
    chat.isShow = true;
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
  sendMessage(state, { msg, rootState }) {
    let result = state.chatlist.find(
      (session) => session.chatId === state.selectChatId
    );
    let now = new Date();
    // 获取最后一条消息时间
    let interval = timeDifference(new Date(result.lastMsgTime), now);
    let showTime = false;
    if (interval > 3) {
      showTime = true;
    }
    result.lastMsgTime = new Date();

    result.messages.push({
      content: msg.content,
      date: now,
      type: msg.type,
      username: rootState.user.info.username,
      showTime: showTime,
    });
    if (result.chatId === "99") {
      setTimeout(() => {
        result.messages.push({
          content: "由于资金不足，机器人已经跑路!",
          date: now,
          username: "001",
          type: 1,
          showTime: false,
        });
      }, 200);
    } else {
      if (msg.type == 2) {
        let file = base64toFile(msg.content.src, "file");
        // 上传图片
        return;
      }
      if (msg.type == 3) {
        // 上传文件
        return;
      }
    }
  },
  async ["receiveMessage"](state, { commit, msg, rootGetters }) {
    let result = state.chatlist.find(
      (session) => session.chatId === msg.sendId
    );
    let showTime = true;
    if (!result) {
      let info = {};
      if (msg.msgType == 1) {
        info = rootGetters["friend/selectedFriendByUsername"](msg.username);
        info.chatId = info.username;
      } else {
        let groupChat = rootGetters["groupchat/selectedGroupChatByNo"](
          msg.sendId
        );
        info.nickname = groupChat.groupName;
        info.avatar = groupChat.groupAvatar;
        info.remark = groupChat.remark;
        info.notDisturb = groupChat.notDisturb;
        info.chatId = groupChat.groupNo;
      }
      result = {
        type: msg.msgType,
        chatId: info.chatId,
        info: {
          nickname: info.nickname,
          avatar: info.avatar,
          remark: info.remark,
          notDisturb: info.notDisturb,
        },
        isShow: true,
        newMsgNum: 0,
        messages: [],
      };
    } else {
      // 对比最后一条消息时间
      let interval = timeDifference(new Date(result.lastMsgTime), now);
      if (interval < 3) {
        showTime = false;
      }
    }
    if (state.selectChatId !== result.chatId) {
      result.newMsgNum = result.newMsgNum + 1;
    }
    result.lastMsgTime = new Date(msg.sendTime);

    result.messages.push({
      type: msg.contentType,
      username: msg.username,
      content: msg.msgContent,
      date: new Date(msg.sendTime),
      showTime: showTime,
    });
    commit("topChat", result);
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
      chat.isShow = true;
      state.chatlist.unshift(chat);
    }
  },
};
const actions = {
  selectSession: ({ commit }, value) => commit("selectSession", value),
  initData: async ({ commit }) => {
    // TODO: 这里先是获取聊天室列表，后续要调用messageHistory加载每个聊天窗口的最近一次的历史信息列表，当用户进入窗口后，要遍历所有消息改成已读setRead
    const chatList = await dialogBox();
    let data = chatList.map((item, index) => {
      return {
        id: 1,
        index: index + 1,
        chatId: item.contactId,
        contactId: item.contactId,
        contactName: item.contactName,
        avatar: item.avatar, //头像
        noReadNum: item.noReadNum,
        lastMsgTime: new Date(item.msgTime),
        messages: [
          {
            date: now,
            showTime: true,
            contactId: item.contactId,
            id: "message_id",
            isRead: 0,
            msgContent: "我会跟你聊聊天的哟",
            msgStatus: 0,
            msgTime: 0,
            msgType: 2002,
            senderAvatar: item.avatar,
            senderId: item.contactId,
            senderName: item.contactName,
          },
        ],
      };
    });
    return commit("initData", data);
  },
  updateChatInfo: ({ commit }, value) => commit("updateChatInfo", value),
  deleteChatByChatId: ({ commit }, value) =>
    commit("deleteChatByChatId", value),
  sendMessage: async (
    { commit, dispatch, state, rootState, rootGetters },
    msg
  ) => {
    //TODO:
    // const { content, type } = msg;
    // const selectChatId = state.selectChatId;
    // await sendMessage({
    //   contactId: selectChatId,
    //   msgContent: content,
    //   msgMins: 0,
    //   //消息类型 1000：系统消息 2001：文字消息 2002：图片消息 2003：语音消息 2004：视频消息 2005：图文链接 2006：名片消息 2007：表情消息 2010：文件消息 2013：小程序消息 2015：公众号消息
    //   msgType: type,
    //   ownId: rootState.user.info.wxid,
    // });

    commit("sendMessage", {
      msg,
      rootState,
    });
  },
  async ["receiveMessage"](store, msg) {
    const { commit, dispatch, state, rootState, rootGetters } = store;
    commit("receiveMessage", {
      commit,
      msg,
      rootGetters,
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
