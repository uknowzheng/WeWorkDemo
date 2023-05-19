<!-- 好友信息 -->
<template>
  <div class="Info-wrapper" v-if="selectedFriend">
    <div class="info-head" v-drag></div>
    <div class="friendInfo">
      <div class="esInfo">
        <div class="left">
          <div class="people">
            <div class="nickname">{{ selectedFriend.contactName }}</div>
            <i
              style="margin-left: 5px"
              :class="
                selectedFriend.isOnline === 'online'
                  ? 'el-icon-success'
                  : 'el-icon-error'
              "
            ></i>
          </div>
        </div>
        <div class="right">
          <img
            class="avatar"
            width="60"
            height="60"
            :src="selectedFriend.avatar"
          />
        </div>
      </div>
      <div class="detInfo">
        <div class="remark">
          <span>备&emsp;注</span>这个人很懒！什么也没备注什么！
        </div>
        <div class="area"><span>地&emsp;区</span>安道尔</div>
        <div class="origin"><span>来&emsp;源</span>号码搜索</div>
        <div class="wxid"><span>微信号</span>-</div>
      </div>
      <div class="send" @click="send">
        <span>发消息</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters({
      selectedFriend: "friend/selectedFriend",
      getChatByChatId: "chat/getChatByChatId",
    }),
  },
  methods: {
    // 选择好友后，点击发送信息。判断在聊天列表中是否有该好友，有的话跳到该好友对话。没有的话
    // 添加该好友的对话 并置顶
    send() {
      let friend = this.selectedFriend;
      debugger;
      let msg = this.getChatByChatId(friend.contactId);
      if (!msg) {
        this.$store.dispatch("friend/selectFriend", friend.contactId);
        let chat = {
          type: 1,
          chatId: friend.contactId,
          info: {
            username: friend.contactName,
            nickname: friend.contactName,
            avatar: friend.avatar,
            remark: friend.contactName,
            notDisturb: false,
          },
          newMsgNum: 0,
          lastMsgTime: new Date(),
          messages: [
            {
              type: 1,
              content: "已经置顶聊天，可以给我发信息啦！",
              date: new Date(),
            },
          ],
        };
        this.$store.dispatch("chat/topChat", chat);
        this.$store.dispatch("chat/selectSession", friend.contactId);
      } else {
        this.$store.dispatch("chat/selectSession", msg.contactId);
        this.$store.dispatch("friend/selectFriend", msg.contactId);
      }
      this.$router.push({ path: "/chat" });
    },
  },
};
</script>

<style lang="stylus" scoped>
.info-head {
  height: 60px;
  padding: 28px 0 0 30px;
  box-sizing: border-box;
  border-bottom: 1px solid #e7e7e7;
}

.friendInfo {
  width: 70%;
  margin: 0 auto;
  padding: 0 90px;
}

.esInfo {
  display: flex;
  align-items: center;
  padding: 40px 0 45px 0;

  .left {
    flex: 1;

    .people {
      .nickname {
        display: inline-block;
        font-size: 20px;
        margin-bottom: 16px;
      }

      .gender-male, .gender-female {
        display: inline-block;
        width: 18px;
        height: 18px;
        vertical-align: top;
        margin-top: 2px;
        margin-left: 5px;
      }

      .gender-male {
        background-image: url('man.png');
        background-size: cover;
      }

      .gender-female {
        background-image: url('woman.png');
        background-size: cover;
      }
    }

    .signature {
      font-size: 14px;
      color: rgba(153, 153, 153, 0.8);
    }
  }

  .right {
    .avatar {
      border-radius: 3px;
    }
  }
}

.detInfo {
  padding: 40px 0;
  border-top: 1px solid #e7e7e7;
  border-bottom: 1px solid #e7e7e7;

  .remark, .area, .wxid, .origin {
    font-size: 14px;
    margin-top: 20px;

    span {
      font-size: 14px;
      color: rgba(153, 153, 153, 0.8);
      margin-right: 40px;
    }
  }

  .remark {
    margin-top: 0;
  }
}

.send {
  margin: 35px auto;
  text-align: center;
  width: 140px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #fff;
  background-color: #2F7DCD;
  cursor: pointer;
  border-radius: 2px;

  &:hover {
    background: #E5E5E5;
  }
}
</style>
