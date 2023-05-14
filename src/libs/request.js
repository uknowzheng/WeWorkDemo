import axios from "axios";
import Vue from "vue";

import { getTokenFromCookie } from "./util";

// 创建一个自定义的axios实例
const instance = axios.create({
  // 在此处可以设置自定义的配置，例如基本URL、超时时间等
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从cookie获取token
    const token = getTokenFromCookie();
    // 添加请求头部Bearer
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器...
// 封装的请求方法...

// 封装的通用请求函数
function request(method, url, data) {
  const config = {
    method: method,
    url: url,
  };

  // 根据请求类型设置数据位置
  if (method.toLowerCase() === "get" || method.toLowerCase() === "delete") {
    config.params = data;
  } else {
    config.data = data;
  }

  return instance(config)
    .then((response) => {
      // 对响应数据做一些处理，例如解析数据
      if (!~response.data.code) {
        Vue.$message.error(response.data.msg);
        return null;
      }
      return response.data;
    })
    .catch((error) => {
      // 处理错误
      if (error.response) {
        // 根据不同的状态码执行不同的操作
        switch (error.response.status) {
          case 201:
            // 处理400错误
            Vue.prototype.$message.error("Created");
            break;
          case 401:
            // 处理400错误
            Vue.prototype.$message.error("Unauthorized");
            break;
          case 403:
            // 处理401错误
            Vue.prototype.$message.error("Forbidden");
            break;
          case 404:
            // 处理404错误
            Vue.prototype.$message.error("Not Found");
            break;
          case 500:
            // 处理500错误
            Vue.prototype.$message.error(
              `Internal Server Error:${error.response.data}`
            );
            break;
          // 其他错误码的处理...
          default:
          // 处理其他错误
        }
      } else {
        // 处理其他错误
      }
      // 抛出错误，使得调用者可以在外部通过.catch()捕获错误
      throw error;
    });
}

// 导出封装后的请求方法
export const get = (url, data) => request("get", url, data);
export const post = (url, data) => request("post", url, data);
// export const put = (url, data) => request("put", url, data);
// export const delete=(url, data) => request("delete", url, data);
