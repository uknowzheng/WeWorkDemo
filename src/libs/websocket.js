let reconnectInterval = 2000; // 重连间隔时间，单位为毫秒

class CustomSocketIO {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.responseHandlers = {};
    this.isConnected = false; // 记录连接状态
    this.timeout = null;
  }

  connect() {
    // 创建 WebSocket 连接
    this.socket = new WebSocket(this.url);

    // 监听连接建立事件
    this.socket.onopen = () => {
      console.log("WebSocket 连接已建立");
      this.isConnected = true;
    };

    // 监听消息接收事件
    this.socket.onmessage = (event) => {
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
      this.isConnected = false;
      console.log("尝试2s后重连");
      this.timeout = setTimeout(() => {
        this.connect();
      }, reconnectInterval);
    };

    // 监听连接错误事件
    this.socket.onerror = (error) => {
      console.error("WebSocket 错误:", error);
      this.isConnected = false;
      console.log("尝试2s后重连");
      this.timeout = setTimeout(() => {
        this.connect();
      }, reconnectInterval);
    };
  }

  disconnect() {
    if (this.socket) {
      this.timeout && clearTimeout(this.timeout);
      this.socket.close();
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
