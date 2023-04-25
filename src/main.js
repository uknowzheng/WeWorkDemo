import Vue from "vue";
import App from "./App";
import router from "./router";
import config from "@/config";
import store from "./store/index.js";
import cdire from "./libs/directive/index";
import VueMaterial from "vue-material";
import "@/assets/icons/iconfont.css";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";

//自定义全局组件
import CusConfirm from "@/components/other/confirm/CusConfirm";
Vue.prototype.$confirm = CusConfirm.install;

import Message from "@/components/other/message";
Vue.prototype.$message = Message.install;

/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config;

Vue.config.productionTip = false;

Vue.use(VueMaterial);

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
