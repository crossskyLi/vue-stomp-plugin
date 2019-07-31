(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('sockjs-client'), require('@stomp/stompjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'sockjs-client', '@stomp/stompjs'], factory) :
  (global = global || self, factory(global.socketPlugin = {}, global.SockJS, global.stompjs));
}(this, function (exports, SockJS, stompjs) { 'use strict';

  SockJS = SockJS && SockJS.hasOwnProperty('default') ? SockJS['default'] : SockJS;

  // const { Stomp } = require('@stomp/stompjs')
  var SockJSGenerator = function (url) {
      return function () {
          var sock = new SockJS(url);
          return sock;
      };
  };
  var socketClient = function (SockJSGenerator) {
      var client = stompjs.Stomp.over(SockJSGenerator);
      return client;
  };
  var factory = (function (url) { return socketClient(SockJSGenerator(url)); });

  var hook = function (vm, target, func) {
      var _hookTarget = vm[target];
      var hookFunc = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          func.apply(void 0, [vm].concat(args));
          return _hookTarget.apply(vm, args);
      };
      vm[target] = hookFunc;
  };

  var socketCaller = /** @class */ (function () {
      function socketCaller(option) {
          this.subscribeTopicMap = {};
          this.client = null;
          this.destination = "subscribe";
          this.clientStatus = false;
          this.option = option;
          this.makeKeys(option);
      }
      socketCaller.prototype.makeKeys = function (option) {
          var topicKey = option.topicKey, idKey = option.idKey, tokenKey = option.tokenKey, destinationKey = option.destinationKey, unsubdestinationKey = option.unsubdestinationKey;
          this.option.topicKey = topicKey || "topic";
          this.option.idKey = idKey || "_uid";
          this.option.tokenKey = tokenKey || "accessToken";
          this.option.destinationKey = destinationKey || "destination";
          this.option.unsubdestinationKey = unsubdestinationKey || "unsubdestination";
      };
      // 默认激活
      socketCaller.prototype.init = function (activate) {
          var _this = this;
          if (activate === void 0) { activate = true; }
          var url = this.option.url;
          this.client = factory(url);
          if (activate) {
              this.activate();
          }
          setTimeout(function () {
              _this.onopen();
          });
      };
      socketCaller.prototype.onopen = function () {
          var _this = this;
          var _a = this.option, tokenObj = _a.tokenObj, requestBody = _a.requestBody;
          var destinationKey = this.getOption("destinationKey");
          var destination = this.option[destinationKey];
          this.client.ws.onopen = function () {
              _this.clientStatus = true;
              _this.send(destination, { tokenObj: tokenObj, requestBody: requestBody });
              _this.onmessage();
          };
      };
      socketCaller.prototype.getClientStatus = function () {
          var _this = this;
          return new Promise(function (resolve, reject) {
              setTimeout(function () {
                  resolve(_this.clientStatus);
              }, 100);
          });
      };
      socketCaller.prototype.send = function (destination, opts) {
          if (!this.client) {
              throw new TypeError("client didn't activated");
          }
          var tokenObj = opts.tokenObj, requestBody = opts.requestBody;
          var tokenKey = this.getOption("tokenKey");
          requestBody[tokenKey] = tokenObj[tokenKey];
          this.client.send(destination, tokenObj, JSON.stringify(requestBody));
      };
      socketCaller.prototype.onmessage = function () {
          var _this = this;
          this.client.ws.onmessage = function (event) {
              var resData = JSON.parse(event.data);
              var responseData = resData;
              var topicKey = _this.getOption("topicKey");
              try {
                  if (resData[topicKey]) {
                      responseData[topicKey] = resData[topicKey];
                  }
                  else if (resData.data && resData.data[topicKey]) {
                      responseData[topicKey] = resData.data[topicKey];
                  }
                  else {
                      throw new Error("The \"" + topicKey + "\" Topic not found in message,please check");
                  }
              }
              catch (error) {
                  console.error(error);
                  responseData = JSON.parse(event.data);
              }
              // responseData.topic = "alarm"
              var topic = responseData[topicKey];
              if (_this.subscribeTopicMap[topic]) {
                  _this.subscribeTopicMap[topic].forEach(function (m) {
                      m.callback(responseData);
                  });
              }
          };
      };
      socketCaller.prototype.subscribe = function (topic, vm, callback, hookName, requestBody) {
          var _this = this;
          if (hookName === void 0) { hookName = "$destroy"; }
          if (requestBody === void 0) { requestBody = {}; }
          if (!topic) {
              throw new Error("topic is required");
          }
          var idKey = this.getOption("idKey");
          if (!vm[idKey]) {
              throw new Error("id is required");
          }
          var sub = function (topic) {
              var _a;
              _this.subscribeTopicMap[topic] = _this.subscribeTopicMap[topic] || [];
              _this.subscribeTopicMap[topic].push((_a = {
                      instance: vm
                  },
                  _a[idKey] = vm[idKey],
                  _a.callback = callback,
                  _a));
              var funchook = function () {
                  console.info("hook vm _uid " + vm[idKey] + " " + hookName + " to unsubscribe");
                  return _this.unsubscribe(topic, vm);
              };
              if (vm[hookName] && typeof vm[hookName] === "function") {
                  hook(vm, hookName, funchook);
              }
          };
          if (Array.isArray(topic)) {
              topic.forEach(function (t) {
                  sub(t);
              });
          }
          else {
              sub(topic);
          }
          var destinationKey = this.getOption("destinationKey");
          var destination = this.option[destinationKey];
          var tokenObj = this.getOption("tokenObj");
          var topicKey = this.getOption("topicKey");
          requestBody[topicKey] = topic;
          var reqBody = { tokenObj: tokenObj, requestBody: requestBody };
          this.send(destination, reqBody);
      };
      socketCaller.prototype.unsubscribe = function (topic, vm, requestBody, callback) {
          var _this = this;
          if (requestBody === void 0) { requestBody = {}; }
          var idKey = this.getOption("idKey");
          var tokenObj = this.getOption("tokenObj");
          var unsubdestinationKey = this.getOption("unsubdestinationKey");
          var unsubdestination = this.option[unsubdestinationKey];
          var unsub = function (unsubtopic) {
              _this.subscribeTopicMap[unsubtopic] = _this.subscribeTopicMap[unsubtopic].filter(function (_) {
                  if (_[idKey] === vm[idKey]) {
                      var topicKey = _this.getOption("topicKey");
                      requestBody[topicKey] = unsubtopic;
                      var opts = { tokenObj: tokenObj, requestBody: requestBody };
                      _this.send(unsubdestination, opts);
                  }
                  return _[idKey] !== vm[idKey];
              });
          };
          if (Array.isArray(topic)) {
              topic.forEach(unsub);
          }
          if (typeof topic === "string") {
              if (!this.subscribeTopicMap[topic]) {
                  throw new Error("the " + topic + " Topic is missed OR Client is destroy, please check the Topic OR the Client is existed");
              }
              unsub(topic);
          }
          if (callback)
              callback(topic);
      };
      socketCaller.prototype.getOption = function (key) {
          return this.option[key];
      };
      socketCaller.prototype.unsubscribeAll = function (requestBody, callback) {
          var _this = this;
          if (requestBody === void 0) { requestBody = {}; }
          var tokenObj = this.option.tokenObj;
          var unsubdestinationKey = this.getOption("unsubdestinationKey");
          var unsubdestination = this.option[unsubdestinationKey];
          var topics = [];
          Object.keys(this.subscribeTopicMap).forEach(function (topic) {
              var topicKey = _this.getOption("topicKey");
              requestBody[topicKey] = topic;
              var opts = { tokenObj: tokenObj, requestBody: requestBody };
              topics.push(topic);
              _this.send(unsubdestination, opts);
              _this.removeSubscribeStoreByKey(topic);
          });
          if (callback) {
              callback(topics);
          }
      };
      socketCaller.prototype.removeSubscribeStoreByKey = function (key) {
          if (this.subscribeTopicMap[key]) {
              this.subscribeTopicMap[key].length = 0;
              delete this.subscribeTopicMap[key];
          }
      };
      socketCaller.prototype.activate = function () {
          if (this.client.active === true) {
              console.info("Client is already activated");
              return;
          }
          this.client.activate();
      };
      socketCaller.prototype.deactivate = function () {
          this.client && this.client.deactivate();
      };
      socketCaller.prototype.destroy = function (requestBody) {
          if (requestBody === void 0) { requestBody = {}; }
          this.unsubscribeAll(requestBody);
          this.deactivate();
          this.client = null;
      };
      return socketCaller;
  }());

  var Stomp = null;
  var factory$1 = function (options) {
      if (options === void 0) { options = {}; }
      Stomp = Stomp ? Stomp : new socketCaller(options);
      return Stomp;
  };

  exports.factory = factory$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
