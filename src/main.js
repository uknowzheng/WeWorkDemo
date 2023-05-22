import Vue from "vue";
import App from "./App";
import router from "./router";
import config from "@/config";
import store from "./store/index.js";
import cdire from "./libs/directive/index";
import ElementUI from "element-ui";
// 在这里引入安装包和样式
import WeixinEmojis from "vue-weixin-emojis";
import "vue-weixin-emojis/dist/vue-weixin-emojis.css";
import "element-ui/lib/theme-chalk/index.css";
import "@/assets/icons/iconfont.css";

//自定义全局组件
import CusConfirm from "@/components/other/confirm/CusConfirm";
Vue.prototype.$confirm = CusConfirm.install;

/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config;
Vue.prototype.$store = store;

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(WeixinEmojis, { url: "static/images/wx_emoji.png" });
// 拖拽命令
const directive = {
  drag: cdire.drag,
};

Object.keys(directive).forEach((key) => {
  Vue.directive(key, directive[key]);
});

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
