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
  created() {
    this.initFriendList();
    this.initGroupChatList();
    // 允许浏览器通知
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
    initFriendList() {
      // listFriendInfo()
      //     .then((res) => {
      //         if (res.code == 0) {
      //             store.commit("friend/addFriendList", res.data);
      //         }
      //     }).catch(err => {
      //         console.log(err);
      //     })
    },
    initGroupChatList() {},
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
