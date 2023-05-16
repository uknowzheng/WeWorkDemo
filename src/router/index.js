import Vue from "vue";
import Router from "vue-router";
import routes from "./routers";
import { getCookie, TOKEN_KEY } from "@/libs/util";
import config from "@/config";

Vue.use(Router);

let BASE_URL = "";
switch (process.env.NODE_ENV) {
  case "development":
    BASE_URL = config.publicPath.dev; // 这里是本地的请求url
    break;
  case "production":
    BASE_URL = config.publicPath.pro; // 生产环境url
    break;
}

const router = new Router({
  routes: routes,
  base: BASE_URL,
  linkActiveClass: "active",
});

router.beforeEach((to, from, next) => {
  let token = getCookie(TOKEN_KEY);
  if (to.path == "/login") {
    if (token) {
      next("/");
    } else {
      next();
    }
  } else {
    if (token) {
      if (to.path === "") {
        next("/chat");
      } else {
        next();
      }
    } else {
      next("/login");
    }
  }
});
export default router;
