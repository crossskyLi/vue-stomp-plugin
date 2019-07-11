import socketCaller from "./socketCaller";

let Stomp = null;

export const factory = function (options = {}) {
  Stomp = Stomp ? Stomp : new socketCaller(options);
  return Stomp;
}
