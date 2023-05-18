import { getAvatar } from "@/libs/tools";
import { setCookie, getCookie, TOKEN_KEY, USER_INFO_KEY } from "@/libs/util";
import { login, logout } from "@/api/user";
const state = {
  token: getCookie(TOKEN_KEY),
  // 当前登录用户
  info: {},
};
const mutations = {
  saveToken(state, { token }) {
    if (token == null) {
      setCookie(TOKEN_KEY, null);
      return;
    } else {
      state.token = token;
      setCookie(TOKEN_KEY, token, 0.4);
    }
  },
  setUserInfo(state, info) {
    setCookie(USER_INFO_KEY, JSON.stringify(info));
    state.info = info;
  },
  initUserInfo(state) {
    const userInfoStr = getCookie(USER_INFO_KEY);
    const userInfo = JSON.parse(userInfoStr);
    state.info = userInfo;
  },
};

const actions = {
  // 登录
  handleLogin: async ({ state, commit }, { username, password }) => {
    const userInfo = await login({
      username,
      password,
    });

    await commit("saveToken", {
      token: userInfo.token,
    });

    const info = {
      signature: "",
      sex: "",
      wxid: userInfo.phone,
      area: "安道尔",
      nickname: userInfo.username,
      avatar: userInfo.headImg,
      username: userInfo.username,
    };
    commit("setUserInfo", info);
    return state.info;
  },
  // 退出登录
  handleLogout: async ({ commit }) => {
    await logout();
    await commit("saveToken", {
      token: null,
    });
    await commit("setUserInfo", {});
  },
};
const getters = {
  getUser(state) {
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
