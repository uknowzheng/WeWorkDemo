<!-- 好友列表 -->
<template>
  <div class="friendlist scrollbar selectNone">
    <ul>
      <li
        v-for="item in searchedFriendlist"
        class="frienditem"
        :key="item.contactId"
      >
        <div
          class="friend-info"
          :class="{ active: item.contactId === selectFriendNo }"
          @click="selectFriend(item.contactId)"
        >
          <img class="avatar" width="36" height="36" :src="item.avatar" />
          <div class="remark">
            {{ item.contactName }}
            <i
              style="margin-left: 5px"
              :style="`color:${item.isOnline === 'online' ? '#2f7dcd' : ''}`"
              class="el-icon-user-solid"
            ></i>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  async mounted() {
    await this.getFriendList();
  },
  computed: {
    ...mapState({
      newfriend: (state) => state.friend.newfriend,
      groupChat: (state) => state.friend.groupChat,
      selectFriendNo: (state) => state.friend.selectFriendNo,
      searchText: (state) => state.system.searchText,
    }),
    ...mapGetters({
      searchedFriendlist: "friend/searchedFriendlist",
    }),
  },
  methods: {
    ...mapActions({
      selectFriend: "friend/selectFriend",
      getFriendList: "friend/getFriendList",
    }),
  },
};
</script>

<style lang="stylus" scoped>
.friendlist {
  height: 570px;

  .frienditem {
    border-top: 1px solid #dadada;

    &:first-child, &.noborder {
      border-top: none;
    }

    .list_title {
      box-sizing: border-box;
      width: 100%;
      font-size: 12px;
      padding: 15px 0 3px 12px;
      color: #999;
    }

    .friend-info {
      display: flex;
      padding: 12px;
      transition: background-color 0.1s;
      font-size: 0;

      &:hover {

      }

      &.active {
        background-color: #C5C5C5;
      }

      .info-avatar {
        position: relative;

        .avatar {
          border-radius: 2px;
        }
      }

      .remark {
        margin-left: 12px;
        font-size: 14px;
        line-height: 36px;
      }
    }
  }
}
</style>
