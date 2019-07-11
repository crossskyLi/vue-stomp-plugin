import SockJS from 'sockjs-client';
// const SockJS = require('sockjs-client');
import { Stomp } from '@stomp/stompjs';
// const { Stomp } = require('@stomp/stompjs')
const SockJSGenerator = (url) => {
  return function () {
    const sock = new SockJS(url);
    return sock
  }
}

const socketClient = (SockJSGenerator) => {
  const client = Stomp.over(SockJSGenerator);
  return client;
}

export default (url) => socketClient(SockJSGenerator(url))