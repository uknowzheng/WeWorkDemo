<!-- 文本输入框 -->
<template>
  <div class="text">
    <div class="operation">
      <span class="operation-icon">
        <i
          class="icon iconfont icon-emoji"
          ref="emoji"
          @click="showEmojiList"
        ></i>
      </span>
      <span class="operation-icon file-upload">
        <a href="javascript:;" class="icon iconfont icon-img">
          <input
            type="file"
            @change="selectImg($event)"
            ref="selectImg"
            accept="image/png,image/jpeg,image/gif,image/jpg"
          />
        </a>
      </span>
      <span class="operation-icon file-upload">
        <a href="javascript:;" class="icon iconfont icon-file">
          <input type="file" @change="selectFile($event)" ref="selectFile" />
        </a>
      </span>
      <!-- <span class="operation-icon">
        <a href="javascript:;" class="icon el-icon-time"></a>
      </span> -->

      <transition name="showbox">
        <div class="emojiBox" v-show="showEmoji">
          <emoji-picker
            v-model="text_content"
            button
            style="background: #fff"
            height="200px"
          />
        </div>
      </transition>
    </div>
    <div
      id="textarea"
      contenteditable="true"
      ref="text"
      @onpaste="pasteListener($event)"
      @keydown.backspace="backspace($event)"
      @keydown.enter="onkeydown($event)"
      @paste="pasteListener"
    ></div>
    <div class="send" @click="send">
      <span>发送(S)</span>
    </div>
    <transition name="appear">
      <div class="warn" v-show="warn">
        <div class="description">不能发送空白信息</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { getTimestamp, getFileSizeStr } from "@/libs/tools";
export default {
  data() {
    return {
      reply: "未找到",
      frequency: 0,
      warn: false,
      showEmoji: false,
      file: null,
      text_content: "",
      imgReg:
        /\<img cct=\"1\" style=\"max-width: 140px;max-height: 160px;\" id=\"[0-9]{13}\"/g,
      fileReg:
        /\<img cct=\"2\" style=\"width: 250px;border: 1px solid #D0D0D0\" id=\"[0-9]{13}\"/g,
    };
  },
  computed: {
    ...mapState({
      selectChatId: (state) => state.chat.selectChatId,
      systemFileIcon: (state) => state.system.systemFileIcon,
    }),
    ...mapGetters({ selectedChat: "chat/selectedChat" }),
  },
  created() {
    document.addEventListener("click", (e) => {
      if (this.$refs.emoji == null) {
        return;
      }
      if (!this.$refs.emoji.contains(e.target)) {
        if (this.showEmoji) {
          this.showEmoji = false;
        }
      }
    });
  },
  methods: {
    ...mapActions({
      uploadAssetsFile: "chat/uploadAssetsFile",
    }),
    pasteListener(e) {
      let items = e.clipboardData && e.clipboardData.items;
      if (items && items.length) {
        // 检索剪切板items
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            this.showImgText(items[i].getAsFile());
            break;
          } else {
            this.showFileText(items[i].getAsFile());
          }
        }
      }
      e.stopPropagation();
      e.preventDefault();
      let text = "",
        event = e.originalEvent || e;
      if (event.clipboardData && event.clipboardData.getData) {
        text = event.clipboardData.getData("text/plain");
      } else if (window.clipboardData && window.clipboardData.getData) {
        text = window.clipboardData.getData("Text");
      }
      if (document.queryCommandSupported("insertText")) {
        document.execCommand("insertText", false, text);
      } else {
        document.execCommand("paste", false, text);
      }
    },
    showEmojiList() {
      this.showEmoji = true;
    },
    // 选中图片
    selectImg(e) {
      let file = e.target.files[0];
      if (file.type.split("/")[0] !== "image") {
        alert("请选择图片！");
        return false;
      }
      this.showImgText(file);
    },
    // 选择文件
    selectFile(e) {
      let file = e.target.files[0];
      this.showFileText(file);
    },
    // 显示文件对应的图片
    async showFileText(file) {
      if (file) {
        let size = Math.floor(file.size / 1024);
        if (size > 10 * 1024) {
          alert("请选择10M以内的文件！");
          return false;
        }
        let textarea = this.$refs.text;

        const fileUrl = await this.uploadAssetsFile(file);
        this.getFileHtml(file, (dataURL, fileType, fileSize) => {
          let id = getTimestamp();
          let content =
            '<img cct="2" style="width: 250px;border: 1px solid #D0D0D0" id="' +
            id +
            '" file-type="' +
            fileType +
            '" file-size="' +
            fileSize +
            '"file-name="' +
            file.name +
            '" />&nbsp';
          textarea.innerHTML = content;
          let img = document.getElementById(id);
          img.src = dataURL;
          this.file = fileUrl;
        });
      }
    },
    // 根据文件生成对应的图标
    getFileHtml(file, callback) {
      let extension = file.name.substring(
        file.name.lastIndexOf("."),
        file.name.length
      );
      let img = new Image();
      img.crossOrigin = "Anonymous";
      let icon = this.systemFileIcon[extension];
      if (icon == null) {
        img.src = "static/images/file.png";
      } else {
        img.src = icon;
      }
      let canvas = document.createElement("canvas");
      canvas.height = 50;
      canvas.width = 250;
      let ctx = canvas.getContext("2d");
      //要先确保图片完整获取到，这是个异步事件
      img.onload = function () {
        ctx.drawImage(img, 5, 10, 30, 30); //将图片绘制到canvas中
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(file.name, 40, 20);
        let fileSize = getFileSizeStr(file.size);
        ctx.fillText(fileSize, 40, 35);
        let dataURL = canvas.toDataURL("image/png");
        callback(dataURL, extension, fileSize); //调用回调函数
        canvas = null;
      };
    },
    async showImgText(file) {
      if (file) {
        let size = Math.floor(file.size / 1024);
        if (size > 2 * 1024) {
          alert("请选择2M以内的图片！");
          return false;
        }
        let textarea = this.$refs.text;

        const fileUrl = await this.uploadAssetsFile(file);

        let image = new Image();
        image.onload = function () {
          let width = image.width;
          let height = image.height;
          let content = textarea.innerHTML;
          let id = getTimestamp();
          content =
            '<img cct="1" style="max-width: 140px;max-height: 160px;" id="' +
            id +
            '" c-width="' +
            width +
            '" c-height="' +
            height +
            '" />';
          textarea.innerHTML = content;
          let img = document.getElementById(id);
          img.src = fileUrl;
          image = null;
        };
        image.src = fileUrl;
        // 将转换结果赋值给img标签
      }
    },
    // 监听回退按键
    backspace(e) {
      let textarea = this.$refs.text;
      if (!this.fileReg.test(textarea.innerHTML)) {
        this.file = null;
        return;
      }
    },
    // 按回车发送信息
    onkeydown(e) {
      if (e.ctrlKey && e.keyCode == 13) {
      } else {
        this.send();
        e.preventDefault();
      }
    },
    // 点击发送按钮发送信息
    send() {
      let textarea = this.$refs.text;
      let text = textarea.innerHTML;
      let content = "";
      if (this.imgReg.test(text)) {
        content = this.replaceImgToMsg(text);
        this.sendMsg(content, 2002);
        textarea.innerHTML = "";
        return;
      }
      if (this.fileReg.test(text)) {
        content = this.replaceFileToMsg(text);
        this.sendMsg(content, 2005);
        textarea.innerHTML = "";
        return;
      }

      // 替换表情
      content = text;
      if (content.length < 1) {
        this.warn = true;
        setTimeout(() => {
          this.warn = false;
        }, 1000);
        return;
      }
      this.sendMsg(content, 2001);
      textarea.innerHTML = "";
    },
    sendMsg(content, type) {
      let msg = {
        content: content,
        type: type,
      };
      this.$store.dispatch("chat/sendMessage", msg);
    },
    // 将图片替换成消息内容
    replaceImgToMsg(content) {
      let currentId = "";
      content.replace(this.imgReg, function (match, index, originText) {
        let id = content.substring(index + 61, index + 61 + 13);
        currentId = id;
      });
      if (currentId !== "") {
        let result = {};
        let img = document.getElementById(currentId);
        result.width = parseInt(img.getAttribute("c-width"));
        result.height = parseInt(img.getAttribute("c-height"));
        result.src = img.src;
        // 将转换结果赋值给img标签
        content = result;
      }
      return content;
    },
    // 将文件替换成消息内容
    replaceFileToMsg(content) {
      let currentId = "";
      content.replace(this.fileReg, function (match, index, originText) {
        let id = content.substring(index + 64, index + 64 + 13);
        currentId = id;
      });
      if (currentId !== "") {
        let result = {};
        let img = document.getElementById(currentId);
        result.fileName = img.getAttribute("file-name");
        result.fileType = img.getAttribute("file-type");
        result.fileSize = img.getAttribute("file-size");
        result.src = this.file;
        // 将转换结果赋值给img标签
        content = result;
      }
      return content;
    },
  },
  // 在进入的时候 聚焦输入框
  mounted() {
    this.$refs.text.focus();
  },
  watch: {
    // 在选择其它对话的时候 聚焦输入框
    selectChatId() {
      setTimeout(() => {
        this.$refs.text.focus();
      }, 0);
    },
    text_content(newVal, oldVal) {
      const add = newVal.substring(oldVal.length, newVal.length);
      const textarea = this.$refs.text;
      textarea.innerText = textarea.innerText + add;
    },
    // 当输入框中的值为空时 弹出提示  并在一秒后消失
    content() {
      if (this.content === "") {
        if (this.frequency === 0) {
          this.warn = true;
          this.frequency++;
          setTimeout(() => {
            this.warn = false;
          }, 1000);
        }
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
#textarea {
  box-sizing: border-box;
  padding-left: 30px;
  height: 110px;
  width: 690px;
  border: none;
  outline: none;
  overflow-y: scroll;
  font-family: 'Micrsofot Yahei';
  resize: none;

  .img-view {
    width: 200px;
  }
}

.text {
  position: relative;
  background: #fff;

  .operation {
    width: 100%;
    height: 40px;
    font-size: 12px;
    padding: 0 30px;
    box-sizing: border-box;
    color: #7c7c7c;

    .operation-icon {
      line-height: 40px;

      .icon-emoji {
        font-size: 18px;
      }

      .icon {
        font-size: 18px;
        color: #4C4C4C;
        cursor: pointer !important;
        margin-right: 15px;

        &:hover {
          color: #2F7DCD !important;
        }
      }
    }

    .file-upload {
      overflow: hidden;

      .icon {
        position: relative;
        text-decoration: none;
        line-height: 20px;
        font-size: 19px;
        cursor: pointer;
        overflow: hidden;

        input {
          position: absolute;
          width: 100%;
          height: 20px;
          right: 0;
          top: 0;
          opacity: 0;
          // 解决cursor: pointer失效
          font-size: 0;
          cursor: pointer !important;
        }
      }
    }

    .emojiBox {
      position: absolute;
      display: flex;
      flex-wrap: wrap;
      top: -210px;
      left: -100px;
      width: 500px;
      height: 200px;
      padding: 5px;
      background-color: #fff;
      border: 1px solid #d1d1d1;
      border-radius: 2px;
      box-shadow: 0 1px 2px 1px #d1d1d1;

      &.showbox-enter-active, &.showbox-leave-active {
        transition: all 0.5s;
      }

      &.showbox-enter, &.showbox-leave-active {
        opacity: 0;
      }

      img {
        cursor: pointer;
      }
    }
  }

  .send {
    position: absolute;
    cursor: pointer;
    bottom: 10px;
    right: 30px;
    width: 75px;
    height: 28px;
    line-height: 28px;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid #e5e5e5;
    border-radius: 3px;
    background: #f5f5f5;
    font-size: 14px;
    color: #7c7c7c;

    &:hover {
      background: #E5E5E5;
      color: #fff;
    }
  }

  .warn {
    position: absolute;
    bottom: 50px;
    right: 10px;
    width: 110px;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    text-align: center;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    box-shadow: 0 1px 5px 1px #bdbdbd;

    &.appear-enter-active, &.appear-leave-active {
      transition: all 1s;
    }

    &.appear-enter, &.appear-leave-active {
      opacity: 0;
    }

    &:before {
      content: ' ';
      position: absolute;
      top: 100%;
      right: 20px;
      border: 7px solid transparent;
      border-top-color: #fff;
      filter: drop-shadow(1px 3px 2px #bdbdbd);
    }
  }
}
</style>
