import { getAvatar } from "@/libs/tools";
import { removeToken, setToken, getToken } from "@/libs/util";
import { login, logout } from "@/api/user";
const state = {
  token: getToken(),
  // 当前登录用户
  info: {
    signature: "",
    sex: 1,
    wxid: "",
    area: "广州",
    nickname: "房东的Tom",
    avatar: null,
    username: "",
  },
};
const mutations = {
  saveToken(state, { token, auto }) {
    if (token == null) {
      removeToken();
    } else {
      state.token = token;
      setToken(token, auto);
    }
  },
  setUserInfo(state, info) {
    state.info = info;
  },
};

const actions = {
  setUserInfo: ({ commit }, info) => commit("setUserInfo", info),
  // 登录
  async handleLogin({ state, commit }, { username, password, auto }) {
    // {
    //   headImg="",
    //   phone="",
    //   token="",
    //   username="",
    // }
    const userInfo = await login({
      username,
      password,
    });
    await commit("saveToken", {
      token: userInfo.token,
      auto,
    });

    state.info.signature = "";
    state.info.sex = 1;
    state.info.wxid = userInfo.phone;
    state.info.area = "安道尔";
    state.info.nickname = userInfo.username;
    state.info.avatar = userInfo.headImg;
    state.info.username = userInfo.username;

    return state.info;
  },
  // 退出登录
  handleLogout({ commit }) {
    commit("saveToken", {
      token: null,
      auto: true,
    });
  },
};
const getters = {
  getUser(state, mutations, rootState) {
    if (state.info.avatar == null || state.info.avatar === "") {
      state.info.avatar = getAvatar(state.info.nickname);
    }
    return state.info;
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
