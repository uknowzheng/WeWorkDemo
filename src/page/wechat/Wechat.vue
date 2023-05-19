<template>
  <div id="wechat">
    <div class="sidebar">
      <SideBar></SideBar>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
    <HeadMenu class="right-menu" id="friendHeadMenu" :refId="'friendHeadMenu'">
    </HeadMenu>
  </div>
</template>

<script>
import HeadMenu from "@/components/other/menu/HeadMenu";
import SideBar from "@/components/sidebar/SideBar";
import { getCookie, TOKEN_KEY } from "@/libs/util";
import { mapActions, mapMutations } from "vuex";
export default {
  components: {
    SideBar,
    HeadMenu,
  },
  data() {
    return {
      moveDataelse: {
        x: null,
        y: null,
      },
    };
  },
  async created() {
    await this.initUserInfo();
    await this.initFriendList();
    await this.initChatData();
    await this.initWSServer();
    // setInterval(() => {
    //   // 允许浏览器通知
    //   this.$store.dispatch("chat/receiveMessage", {
    //     id: "645371ed27326e26969a63f9",
    //     msgType: 2001,
    //     msgContent: "以上是打招呼的内容,waaaaaa",
    //     msgExtend: "",
    //     msgStatus: 1,
    //     msgTime: 1683190253707,
    //     ownerId: "13800000000",
    //     contactId: "cmo3am4xeGQ2dGYzMjI1@c2locnltZm83NTJmMjI1",
    //     senderId: "cmo3am4xeGQ2dGYzMjI1@c2locnltZm83NTJmMjI1",
    //     senderName: "美美玉mon",
    //     senderAvatar:
    //       "https://wx.qlogo.cn/mmhead/ver_1/zCUzSJm8GhJl0pReqUNkcNNQicOU8f8RG7Z6h0ricRAzXwaCGExPgl7LuThygEEwAJFnDQORt5QicD4pU1kHU8CJhPhEAVnoqJxXXdicmljcySc/0",
    //     isRead: 0,
    //   });
    // }, 2000);
    this.allowNotification();
  },
  beforeMount() {
    if (!getCookie(TOKEN_KEY)) {
      return;
    }
  },
  mounted() {
    const that = this;
    that.updateAppPosition(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    );
    window.onresize = () => {
      return (() => {
        window.fullHeight = document.documentElement.clientHeight;
        window.fullWidth = document.documentElement.clientWidth;
        that.$store.commit("system/setWindowWidth", window.fullWidth);
        that.$store.commit("system/setwindowHeight", window.fullHeight);
        that.updateAppPosition(window.fullWidth, window.fullHeight);
      })();
    };
  },
  methods: {
    ...mapMutations({
      initUserInfo: "user/initUserInfo",
    }),
    ...mapActions({
      initFriendList: "friend/getFriendList",
      initWSServer: "chat/initWSServer",
      initChatData: "chat/initData",
    }),
    //申请浏览器通知权限，具体参见链接 https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
    allowNotification() {
      if (!("Notification" in window)) {
        this.$message.error("浏览器不支持消息通知");
        return;
      }
      const permission = Notification.permission;
      if (permission === "granted") {
        return;
      }
      Notification.requestPermission((permission) => {
        if (permission !== "granted") {
          this.$message.error("无法提示新消息！");
        }
      });
    },
    updateAppPosition(width, height) {
      // 设置窗口位置
      let app = document.getElementById("wechat");
      app.style.left = (width - app.offsetWidth) / 2 + "px";
      app.style.top = (height - app.offsetHeight) / 2 + "px";
    },
  },
};
</script>
<style lang="stylus" scoped>
#wechat {
  position: absolute;
  display: flex;
  border-radius: 50px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 1018px;
  height: 630px;
  background-color: #fff;

  .sidebar {
    width: 55px;
    height: 630px;
    background: #2F7DCD;
  }

  .main {
    flex: 1;
    height: 630px;
    background: #F5F5F5;
  }
}
</style>
