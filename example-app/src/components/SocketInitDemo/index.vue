<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="init">init</button>
    <button @click="activate">activate</button>
    <button @click="handleDeactivate">deactivate</button>
    <button @click="subscribe">subscribe</button>
    <button @click="unsubscribe">unsubscribe</button>
    <button @click="unsubscribeAll">unsubscribeAll</button>
    <button @click="destroy">destroy</button>
    <!-- <button @click="handleUnsubscribeByMap">unsubscribeByMap</button> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { client, options, tokenObj, requestBody } from "../../socketFactory";

@Component
export default class SocketDemo extends Vue {
  @Prop() private msg!: string;
  // list: any[] = [];
  mounted() {
    // const length = 1000000;
    // setTimeout(() => {
    //   this.list = new Array(length).fill({ a: Math.random() });
    // }, 10000);
    // this.init();
    // this.activate();
    // this.subscribe();
  }

  init() {
    client.init();
  }

  activate() {
    client.activate();
  }

  subscribe() {
    // const topic = "alarm";
    const topic = ["alarm", "alarms2"];
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
    client.getClientStatus().then(status => {
      if (status) {
        client.subscribe(topic, this, callback, hookName, reqBody);
      }
    });
  }

  subscribeCallback(msg) {
    console.log(msg, "订阅成功 客户端收到服务端的消息了");
  }

  unsubscribe() {
    // const topic = "alarm";
    const topic = ["alarm", "alarms2"];
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
  // handleSubscribeByMap() {
  //   const keyMap = {};
  //   Object.keys(options.subscribeMap).forEach(key => {
  //     keyMap[key] = keyMap[key] || {};
  //     Object.keys(options.subscribeMap[key]).forEach(k => {
  //       keyMap[key][k] = options.subscribeMap[key][k];
  //     });
  //     keyMap[key].subCallback = this.subCallback;
  //   });
  //   let subscribeMap = Object.assign(options.subscribeMap, keyMap);
  //   client.subscribeByMap({
  //     subscribeMap: options.subscribeMap,
  //     tokenObj
  //   });
  // }

  // subCallback(msg) {
  //   console.log("数据来了么", msg);
  // }

  // handleUnsubscribeByMap() {
  //   const requestBody = {
  //     ...tokenObj,
  //     msg: "我不要链接了"
  //   };
  //   const keyMap = {};
  //   Object.keys(options.subscribeMap).forEach(key => {
  //     keyMap[key] = keyMap[key] || {};
  //     keyMap[key].unsubCallback = this.unsubCallback;
  //   });
  //   client.unsubscribeByMap({
  //     subscribeMap: options.subscribeMap,
  //     requestBody
  //   });
  // }
  // unsubCallback() {
  //   debugger;
  // }
  destroy() {
    client.destroy();
  }

  beforeDestroy() {
    client && client.destroy();
  }

  handleDeactivate() {
    client.deactivate();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
