## A Stomp plugin for web app

## usage
npm i vue-stomp-plugin @stomp/stompjs sockjs-client

yarn add @stomp/stompjs sockjs-client vue-stomp-plugin


### a nodejs client to mock
if you need a nodejs client to mock , you can go to ([nodejs repo'](https://github.com/crossskyLi/node-socket-demo))

### use as a factory
```JavaScript
import { factory as SocketFactory } from "vue-stomp-plugin";

const ip = "10.9.96.148";
const localIp = "127.0.0.1";
const config = {
  url: `http://${ip}:10324/senseface/stomp`,
};

export const tokenObj = {
  // accessToken: "e50979c95cf643ada926aabc312a9934"
  accessToken: "a65f903a47574424967ad9e595dd1fdb"
};

export const requestBody = {
  allTag: true,
  videoList: [],
  taskList: [],
  subscribeDetect: true,
  topic:"alarm"
};
function noop() {

}
export const options = {
  url: config.localUrl,
  destination: "/subscribe",
  unsubdestination: "/unsubscribe",
  tokenObj,
  requestBody,
  subscribeMap: {
    alarms: {
      topic: "alarm",
      subCallback: noop,
      unsubCallback: noop,
    },
  },
}

export const client = SocketFactory(options);

```

### import the factory and use in vue
```javascript
import { client, options, tokenObj, requestBody } from "./socketFactory";

export default {
  mounted() { }
  methods:{
    init() {
      client.init();
    }

    activate() {
      client.activate();
    }

    subscribe() {
      const topic = "alarm";
      const vm = this;
      const callback = this.subscribeCallback;
      const hookName = "$destroy";
      // const reqBody = {
      //   allTag: true,
      //   videoList: [],
      //   taskList: [],
      //   subscribeDetect: true,
      //   topic: "alarm",
      //   msg: "我来了"
      // };
      const reqBody = {
        allTag: true,
        videoList: [],
        taskList: [],
        subscribeDetect: true,
        // topic: "alarm",
        msg: "我来了"
      };
      client.subscribe(topic, this, callback, hookName, reqBody);
    }

    subscribeCallback(msg) {
      console.log(msg, "订阅成功 客户端收到服务端的消息了");
    }

    unsubscribe() {
      const topic = "alarm";
      const requestBody = {
        msg: "我不要订阅了"
      };
      const callback = this.unsubscribeCallback;

      client.unsubscribe(topic, this, requestBody, callback);
    }

    unsubscribeCallback(topic) {
      console.log("取消订阅成功", topic);
    }

    unsubscribeAll() {
      const reqBody = {};
      client.unsubscribeAll(reqBody, this.unsubscribeAllCallback);
    }
    unsubscribeAllCallback(topics) {
      console.log("取消订阅全部 topic", topics);
    }
    destroy() {
      client.destroy();
    }
    handleActivate() {
      client.activate();
    }
  }
}
```


### development
```code
yarn add rollup global

yarn 
```
### run
yarn dev

### run demo 
cd example-app
yarn 
yarn dev
