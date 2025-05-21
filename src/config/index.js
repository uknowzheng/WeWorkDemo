module.exports = {
  // 本地开发的时候vue cli proxy代理的地址localhost
  devHost: "http://localhost:8008",
  // 这个是实际代码运行时候，ws连接的地址
  wsHost: "ws://localhost",
  // 这块配置暂时没用到
  publicPath: {
    //  本地环境发布目录
    dev: "/",
    //  生产环境发布目录
    pro: "/",
  },
};
