<!-- 最左边的选择框 -->
<template>
  <div class="mycard selectNone" v-drag>
    <header>
      <img
        id="headMenu"
        @click.prevent="openMenu($event)"
        :src="getUser.avatar"
        class="avatar"
      />
    </header>
    <div class="navbar" @click="clearSearch">
      <router-link to="/chat" class="icon iconfont icon-msg">
        <Badge
          v-if="getTotalNewMsgs > 0"
          :count="getTotalNewMsgs"
          :overflowCount="99"
          :width="16"
          :height="16"
        ></Badge>
      </router-link>
      <router-link to="/friend" class="icon iconfont icon-friend">
      </router-link>
    </div>
    <footer>
      <el-dropdown @command="handleCommand">
        <span>
          <i class="icon iconfont icon-san" slot="reference"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item icon="el-icon-exit" command="exit"
            ><span>退出登陆</span></el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </footer>
  </div>
</template>

<script>
import Badge from "@/components/other/Badge";
import { mapActions, mapGetters } from "vuex";
export default {
  components: {
    Badge,
  },
  computed: {
    ...mapGetters({
      getTotalNewMsgs: "chat/getTotalNewMsgs",
      getUser: "user/getUser",
    }),
  },
  data() {
    return {};
  },
  methods: {
    ...mapActions({
      handleLogout: "user/handleLogout",
    }),
    async handleCommand(command) {
      if (command === "exit") {
        await this.logout();
      }
    },
    async logout() {
      await this.handleLogout();
      await this.$router.push("/login");
    },
    clearSearch() {
      this.$store.dispatch("system/search", "");
    },
    openMenu(e) {
      let info = {
        clientX: e.clientX,
        clientY: e.clientY,
        self: true,
        visible: true,
        visibleIng: true,
        info: this.getUser,
      };
      this.$store.commit("system/setHeadMenu", info);
    },
  },
};
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css';

.mycard {
  position: relative;
  width: 100%;
  height: 100%;

  .avatar {
    cursor: pointer;
    width: 37px;
    height: 37px;
    margin: 25px 9px 0px 9px;
    background: #FFF;
    border-radius: 5px;
  }

  .navbar {
    width: 100%;
    text-align: center;
  }

  .icon {
    display: inline-block;
    font-size: 19px;
    margin-top: 28px;
    padding: 0 18px;
    box-sizing: border-box;
    color: #E6E6E6;
    cursor: pointer;

    &.active {
      color: #FFFFFF;
    }

    &:hover {
      opacity: 1;
      color: #E6E6E6;
    }
  }

  .icon-msg, .icon-more, .icon-friend {
    font-size: 18px;
  }

  .icon-msg, .icon-friend {
    position: relative;
    padding: 0 19px;
  }

  .badge {
    right: 8px !important;
  }
}

footer {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}
</style>
