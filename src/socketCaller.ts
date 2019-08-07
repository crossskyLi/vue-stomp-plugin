import factory from './factory';
import { hook } from './hook';
interface Option {
  topic?: string;
  subscribeMap: object;
  url: string;
  tokenObj: any;
  requestBody?: any;
  topicKey: string;
  topicsKey: string;
  idKey: string;
  tokenKey: string;
  destinationKey: string;
  unsubdestinationKey: string;
}
class socketCaller {
  option: Option;
  subscribeTopicMap = {};
  client = null;
  destination: string = 'subscribe';
  clientStatus: boolean = false;

  constructor(option) {
    this.option = option;
    const { topicNotFoundCallback } = option;

    this.topicNotFoundCallback =
      topicNotFoundCallback || this.topicNotFoundCallback;

    this.makeKeys(option);
  }
  makeKeys(option) {
    const {
      topicKey,
      topicsKey,
      idKey,
      tokenKey,
      destinationKey,
      unsubdestinationKey
    } = option;
    this.option.topicKey = topicKey || 'topic';
    this.option.topicsKey = topicsKey || 'topics';
    this.option.idKey = idKey || '_uid';
    this.option.tokenKey = tokenKey || 'accessToken';
    this.option.destinationKey = destinationKey || 'destination';
    this.option.unsubdestinationKey = unsubdestinationKey || 'unsubdestination';
  }
  // 默认激活
  init(activate = true) {
    const { url } = this.option;
    this.client = factory(url);

    if (activate) {
      this.activate();
    }

    setTimeout(() => {
      this.onopen();
    });
  }

  onopen() {
    const { tokenObj, requestBody } = this.option;
    const destinationKey = this.getOption('destinationKey');
    const destination = this.option[destinationKey];

    this.client.ws.onopen = () => {
      this.clientStatus = true;
      this.send(destination, { tokenObj, requestBody });
      this.onmessage();
    };
  }

  getClientStatus() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.clientStatus);
      }, 100);
    });
  }

  send(destination, opts) {
    if (!this.client) {
      throw new TypeError(`client didn't activated`);
    }
    const { tokenObj, requestBody } = opts;
    const tokenKey = this.getOption('tokenKey');
    requestBody[tokenKey] = tokenObj[tokenKey];

    this.client.send(destination, tokenObj, JSON.stringify(requestBody));
  }

  onmessage() {
    this.client.ws.onmessage = event => {
      const resData = JSON.parse(event.data);
      let responseData = resData;
      const topicKey = this.getOption('topicKey');
      try {
        if (resData[topicKey]) {
          responseData[topicKey] = resData[topicKey];
        } else if (resData.data && resData.data[topicKey]) {
          responseData[topicKey] = resData.data[topicKey];
        } else {
          console.warn(
            `The "${topicKey}" Topic not found in message,please check`
          );
        }
      } catch (error) {
        console.error(error);
        responseData = JSON.parse(event.data);
        this.topicNotFoundCallback(topicKey, responseData);
      }

      // responseData.topic = "alarm"

      const topic = responseData[topicKey];
      if (this.subscribeTopicMap[topic]) {
        this.subscribeTopicMap[topic].forEach(m => {
          m.callback(responseData);
        });
      }
    };
  }

  subscribe(topic, vm, callback, hookName = '$destroy', requestBody = {}) {
    if (!topic) {
      throw new Error('topic is required');
    }

    const idKey = this.getOption('idKey');
    if (!vm[idKey]) {
      throw new Error('id is required');
    }
    const sub = topic => {
      this.subscribeTopicMap[topic] = this.subscribeTopicMap[topic] || [];
      this.subscribeTopicMap[topic].push({
        instance: vm,
        [idKey]: vm[idKey],
        callback
      });

      const funchook = () => {
        console.info(`hook vm _uid ${vm[idKey]} ${hookName} to unsubscribe`);
        return this.unsubscribe(topic, vm);
      };

      if (vm[hookName] && typeof vm[hookName] === 'function') {
        hook(vm, hookName, funchook);
      }
    };

    if (Array.isArray(topic)) {
      // if topic is a array send topics
      const topicsKey = this.getOption('topicsKey');
      requestBody[topicsKey] = topic;

      topic.forEach(t => {
        sub(t);
      });
    } else {
      sub(topic);
    }

    const destinationKey = this.getOption('destinationKey');
    const tokenObj = this.getOption('tokenObj');
    const topicKey = this.getOption('topicKey');
    const destination = this.option[destinationKey];
    
    requestBody[topicKey] = topic;
    const reqBody = { tokenObj, requestBody };
    this.send(destination, reqBody);
  }

  unsubscribe(topic, vm, requestBody = {}, callback?) {
    const idKey = this.getOption('idKey');
    const tokenObj = this.getOption('tokenObj');
    const unsubdestinationKey = this.getOption('unsubdestinationKey');
    const unsubdestination = this.option[unsubdestinationKey];
    const unsub = unsubtopic => {
      this.subscribeTopicMap[unsubtopic] = this.subscribeTopicMap[
        unsubtopic
      ].filter(_ => {
        if (_[idKey] === vm[idKey]) {
          const topicKey = this.getOption('topicKey');
          requestBody[topicKey] = unsubtopic;
          const opts = { tokenObj, requestBody };
          this.send(unsubdestination, opts);
        }
        return _[idKey] !== vm[idKey];
      });
    };

    if (Array.isArray(topic)) {
      topic.forEach(unsub);
    }

    if (typeof topic === 'string') {
      if (!this.subscribeTopicMap[topic]) {
        throw new Error(
          `the ${topic} Topic is missed OR Client is destroy, please check the Topic OR the Client is existed`
        );
      }
      unsub(topic);
    }

    if (callback) callback(topic);
  }

  getOption(key) {
    return this.option[key];
  }

  topicNotFoundCallback(topicKey, data) {
    console.warn(
      `The "${topicKey}" Topic not found in message,please check`,
      JSON.stringify(data)
    );
  }

  unsubscribeAll(requestBody = {}, callback?) {
    const { tokenObj } = this.option;
    const unsubdestinationKey = this.getOption('unsubdestinationKey');
    const unsubdestination = this.option[unsubdestinationKey];
    const topics: string[] = [];
    Object.keys(this.subscribeTopicMap).forEach(topic => {
      const topicKey = this.getOption('topicKey');
      requestBody[topicKey] = topic;

      const opts = { tokenObj, requestBody };

      topics.push(topic);

      this.send(unsubdestination, opts);

      this.removeSubscribeStoreByKey(topic);
    });
    if (callback) {
      callback(topics);
    }
  }

  removeSubscribeStoreByKey(key) {
    if (this.subscribeTopicMap[key]) {
      this.subscribeTopicMap[key].length = 0;
      delete this.subscribeTopicMap[key];
    }
  }

  activate() {
    if (this.client.active === true) {
      console.info('Client is already activated');
      return;
    }
    this.client.activate();
  }
  deactivate() {
    this.client && this.client.deactivate();
  }

  destroy(requestBody = {}) {
    this.unsubscribeAll(requestBody);
    this.deactivate();
    this.client = null;
  }
}
export default socketCaller;
