<!-- 好友信息 -->
<template>
  <div class="Info">
    <FriendInfo></FriendInfo>
  </div>
</template>

<script>
import FriendInfo from "./FriendInfo";
import { mapGetters } from "vuex";
export default {
  components: {
    FriendInfo,
  },
  computed: {
    ...mapGetters({
      selectedFriend: "friend/selectedFriend",
    }),
  },
  methods: {},
};
</script>

<style lang="stylus" scoped></style>
