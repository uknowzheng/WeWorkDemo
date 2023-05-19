import { getContacts } from "@/api/contacts";

const state = {
  friendlist: [],
  // 好友请求列表
  newFriendList: [],
  // 得知当前选择的是哪个好友
  selectFriendNo: null,
};
const mutations = {
  // 得知用户当前选择的是哪个好友。
  selectFriend(state, value) {
    state.selectFriendNo = value;
  },
  addFriend(state, value) {
    let friend = state.friendlist.find(
      (friend) => friend.username === value.username
    );
    if (friend == null) {
      state.friendlist.push(value);
    }
  },
  updateFriend(state, value) {
    let tmp = state.friendlist.find((i) => i.username === value.username);
    Object.assign(tmp, value);
  },
  addFriendList(state, value) {
    state.friendlist = state.friendlist.filter((x, index) => {
      if (x.id == -1 || value.find((y) => x.username === y.username)) {
        return x;
      }
    });
    let add = value.filter(
      (x) => !state.friendlist.find((y) => x.username === y.username)
    );
    for (let i = 0; i < add.length; i++) {
      state.friendlist.push(add[i]);
    }
  },
  addNewFriend(state, value) {
    let add = value.filter(
      (x) => !state.newFriendList.find((y) => x.applyId === y.applyId)
    );
    for (let i = 0; i < add.length; i++) {
      state.newFriendList.push(add[i]);
    }
  },
  updateNewFriendStatus(state, value) {
    let newFriend = state.newFriendList.find(
      (msg) => msg.applyId === value.applyId
    );
    newFriend.status = value.status;
  },
  setFriendList(state, value) {
    state.friendlist = value;
  },
};
const actions = {
  selectFriend: ({ commit }, value) => commit("selectFriend", value),
  addFriendList: ({ commit }, value) => commit("addFriendList", value),
  updateFriend: ({ commit }, value) => commit("updateFriend", value),
  addFriend: ({ commit }, value) => commit("addFriend", value),
  addNewFriend: ({ commit }, value) => commit("addNewFriend", value),
  updateNewFriendStatus: ({ commit }, value) =>
    commit("updateNewFriendStatus", value),
  getFriendList: async ({ state, commit }) => {
    const friendList = await getContacts();
    if (friendList) {
      const result = friendList.map((item) => ({
        contactName: item.contactName,
        contactId: item.contactId,
        isOnline: item.onlineStatus,
        avatar: item.avatar,
      }));
      commit("setFriendList", result);
    }
    // commit("setFriendList", state.friendlist);
  },
};
const getters = {
  getNewFriendNums(state) {
    let nums = 0;
    for (let i = 0; i < state.newFriendList.length; i++) {
      if (state.newFriendList[i].status == 0) {
        nums++;
      }
    }
    return nums;
  },
  // 筛选出含有搜索值的好友列表
  searchedFriendlist(state, params, rootState) {
    let friends = state.friendlist;
    // .filter((friends) =>
    //   friends.username.includes(rootState.system.searchText)
    // );
    return friends;
  },
  // 通过当前选择是哪个好友匹配相应的好友
  selectedFriend(state) {
    let friend = state.friendlist.find(
      (friend) => friend.contactId === state.selectFriendNo
    );
    return friend;
  },
  selectedChatFriend(state, getters, rootState) {
    let friend = state.friendlist.find(
      (friend) => friend.username === rootState.chat.selectChatId
    );
    return friend;
  },
  selectedFriendByUsername(state) {
    return function (username) {
      return state.friendlist.find((friend) => friend.username === username);
    };
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
