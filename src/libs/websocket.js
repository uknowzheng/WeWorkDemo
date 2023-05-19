class CustomSocketIO {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.responseHandlers = {};
  }

  connect() {
    // 创建 WebSocket 连接
    this.socket = new WebSocket(this.url);

    // 监听连接建立事件
    this.socket.onopen = () => {
      console.log("WebSocket 连接已建立");
    };

    // 监听消息接收事件
    this.socket.onmessage = (event) => {
      console.log("收到服务器消息:", event);
      const { data } = event;
      if (data) {
        const { type, data: body } = JSON.parse(data);
        if (this.responseHandlers[type]) {
          this.responseHandlers[type](body);
        }
      }
    };

    // 监听连接关闭事件
    this.socket.onclose = () => {
      console.log("WebSocket 连接已关闭");
    };

    // 监听连接错误事件
    this.socket.onerror = (error) => {
      console.error("WebSocket 错误:", error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setResponseHandler(type, handler) {
    this.responseHandlers[type] = handler;
  }

  sendMessage(data) {
    // 发送数据到服务器
    this.socket.send(JSON.stringify(data));
  }
}

export default CustomSocketIO;
