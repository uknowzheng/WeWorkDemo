import io from "socket.io-client";

class CustomSocketIO {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.socket = null;
    this.responseHandlers = {};
  }

  connect() {
    this.socket = io(this.url, this.options);

    this.socket.on("connect", () => {
      console.log("Socket.IO连接已建立");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket.IO连接已断开");
    });

    this.socket.on("response", (response) => {
      const { type, data } = response;
      if (this.responseHandlers[type]) {
        this.responseHandlers[type](data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(event, data, onResponse) {
    if (this.socket) {
      this.socket.emit(event, data, onResponse);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  setResponseHandler(type, handler) {
    this.responseHandlers[type] = handler;
  }
}

export default CustomSocketIO;
