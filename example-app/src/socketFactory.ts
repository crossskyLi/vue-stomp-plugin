// import { factory as SocketFactory } from "vue-stomp-plugin";
// open in development
import { factory as SocketFactory } from "../src/socketPlugin/index.js";

const ip = "10.9.96.148";
const localIp = "127.0.0.1";
const config = {
  url: `http://${ip}:10324/senseface/stomp`,
  localUrl: `http://${localIp}:10221/senseface/stomp`,
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
      // topic: "alarm",
      topic: ["alarm","alarm2"],
      subCallback: noop,
      unsubCallback: noop,
    },
  },
}

export const client = SocketFactory(options);
