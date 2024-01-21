"use strict";
const require$$0 = require("electron");
const fs = require("fs");
const promises = require("fs/promises");
const path = require("path");
var serializeError_1;
var hasRequiredSerializeError;
function requireSerializeError() {
  if (hasRequiredSerializeError)
    return serializeError_1;
  hasRequiredSerializeError = 1;
  class NonError extends Error {
    constructor(message) {
      super(NonError._prepareSuperMessage(message));
      Object.defineProperty(this, "name", {
        value: "NonError",
        configurable: true,
        writable: true
      });
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, NonError);
      }
    }
    static _prepareSuperMessage(message) {
      try {
        return JSON.stringify(message);
      } catch {
        return String(message);
      }
    }
  }
  const commonProperties = [
    { property: "name", enumerable: false },
    { property: "message", enumerable: false },
    { property: "stack", enumerable: false },
    { property: "code", enumerable: true }
  ];
  const isCalled = Symbol(".toJSON called");
  const toJSON = (from) => {
    from[isCalled] = true;
    const json = from.toJSON();
    delete from[isCalled];
    return json;
  };
  const destroyCircular = ({
    from,
    seen,
    to_,
    forceEnumerable,
    maxDepth,
    depth
  }) => {
    const to = to_ || (Array.isArray(from) ? [] : {});
    seen.push(from);
    if (depth >= maxDepth) {
      return to;
    }
    if (typeof from.toJSON === "function" && from[isCalled] !== true) {
      return toJSON(from);
    }
    for (const [key, value] of Object.entries(from)) {
      if (typeof Buffer === "function" && Buffer.isBuffer(value)) {
        to[key] = "[object Buffer]";
        continue;
      }
      if (typeof value === "function") {
        continue;
      }
      if (!value || typeof value !== "object") {
        to[key] = value;
        continue;
      }
      if (!seen.includes(from[key])) {
        depth++;
        to[key] = destroyCircular({
          from: from[key],
          seen: seen.slice(),
          forceEnumerable,
          maxDepth,
          depth
        });
        continue;
      }
      to[key] = "[Circular]";
    }
    for (const { property, enumerable } of commonProperties) {
      if (typeof from[property] === "string") {
        Object.defineProperty(to, property, {
          value: from[property],
          enumerable: forceEnumerable ? true : enumerable,
          configurable: true,
          writable: true
        });
      }
    }
    return to;
  };
  const serializeError = (value, options = {}) => {
    const { maxDepth = Number.POSITIVE_INFINITY } = options;
    if (typeof value === "object" && value !== null) {
      return destroyCircular({
        from: value,
        seen: [],
        forceEnumerable: true,
        maxDepth,
        depth: 0
      });
    }
    if (typeof value === "function") {
      return `[Function: ${value.name || "anonymous"}]`;
    }
    return value;
  };
  const deserializeError = (value, options = {}) => {
    const { maxDepth = Number.POSITIVE_INFINITY } = options;
    if (value instanceof Error) {
      return value;
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const newError = new Error();
      destroyCircular({
        from: value,
        seen: [],
        to_: newError,
        maxDepth,
        depth: 0
      });
      return newError;
    }
    return new NonError(value);
  };
  serializeError_1 = {
    serializeError,
    deserializeError
  };
  return serializeError_1;
}
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil)
    return util;
  hasRequiredUtil = 1;
  const getUniqueId = () => `${Date.now()}-${Math.random()}`;
  const getSendChannel = (channel) => `%better-ipc-send-channel-${channel}`;
  const getRendererSendChannel = (channel) => `%better-ipc-send-channel-${channel}`;
  util.currentWindowChannel = "%better-ipc-current-window";
  util.getSendChannel = getSendChannel;
  util.getRendererSendChannel = getRendererSendChannel;
  util.getResponseChannels = (channel) => {
    const id = getUniqueId();
    return {
      sendChannel: getSendChannel(channel),
      dataChannel: `%better-ipc-response-data-channel-${channel}-${id}`,
      errorChannel: `%better-ipc-response-error-channel-${channel}-${id}`
    };
  };
  util.getRendererResponseChannels = (channel) => {
    const id = getUniqueId();
    return {
      sendChannel: getRendererSendChannel(channel),
      dataChannel: `%better-ipc-response-data-channel-${channel}-${id}`,
      errorChannel: `%better-ipc-response-error-channel-${channel}-${id}`
    };
  };
  return util;
}
var renderer;
var hasRequiredRenderer;
function requireRenderer() {
  if (hasRequiredRenderer)
    return renderer;
  hasRequiredRenderer = 1;
  const electron = require$$0;
  const { serializeError, deserializeError } = requireSerializeError();
  const util2 = requireUtil();
  const { ipcRenderer: ipcRenderer2 } = electron;
  const ipc = Object.create(ipcRenderer2 || {});
  ipc.callMain = (channel, data) => new Promise((resolve, reject) => {
    const { sendChannel, dataChannel, errorChannel } = util2.getResponseChannels(channel);
    const cleanup = () => {
      ipcRenderer2.off(dataChannel, onData);
      ipcRenderer2.off(errorChannel, onError);
    };
    const onData = (_event, result) => {
      cleanup();
      resolve(result);
    };
    const onError = (_event, error) => {
      cleanup();
      reject(deserializeError(error));
    };
    ipcRenderer2.once(dataChannel, onData);
    ipcRenderer2.once(errorChannel, onError);
    const completeData = {
      dataChannel,
      errorChannel,
      userData: data
    };
    ipcRenderer2.send(sendChannel, completeData);
  });
  ipc.answerMain = (channel, callback) => {
    const sendChannel = util2.getRendererSendChannel(channel);
    const listener = async (_event, data) => {
      const { dataChannel, errorChannel, userData } = data;
      try {
        ipcRenderer2.send(dataChannel, await callback(userData));
      } catch (error) {
        ipcRenderer2.send(errorChannel, serializeError(error));
      }
    };
    ipcRenderer2.on(sendChannel, listener);
    return () => {
      ipcRenderer2.off(sendChannel, listener);
    };
  };
  renderer = ipc;
  return renderer;
}
var main;
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain)
    return main;
  hasRequiredMain = 1;
  const electron = require$$0;
  const { serializeError, deserializeError } = requireSerializeError();
  const util2 = requireUtil();
  const { ipcMain, BrowserWindow } = electron;
  const ipc = Object.create(ipcMain || {});
  ipc.callRenderer = (browserWindow, channel, data) => new Promise((resolve, reject) => {
    if (!browserWindow) {
      throw new Error("Browser window required");
    }
    const { sendChannel, dataChannel, errorChannel } = util2.getRendererResponseChannels(channel);
    const cleanup = () => {
      ipcMain.off(dataChannel, onData);
      ipcMain.off(errorChannel, onError);
    };
    const onData = (event, result) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window.id === browserWindow.id) {
        cleanup();
        resolve(result);
      }
    };
    const onError = (event, error) => {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window.id === browserWindow.id) {
        cleanup();
        reject(deserializeError(error));
      }
    };
    ipcMain.on(dataChannel, onData);
    ipcMain.on(errorChannel, onError);
    const completeData = {
      dataChannel,
      errorChannel,
      userData: data
    };
    if (browserWindow.webContents) {
      browserWindow.webContents.send(sendChannel, completeData);
    }
  });
  ipc.callFocusedRenderer = async (...args) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) {
      throw new Error("No browser window in focus");
    }
    return ipc.callRenderer(focusedWindow, ...args);
  };
  ipc.answerRenderer = (browserWindowOrChannel, channelOrCallback, callbackOrNothing) => {
    let window;
    let channel;
    let callback;
    if (callbackOrNothing === void 0) {
      channel = browserWindowOrChannel;
      callback = channelOrCallback;
    } else {
      window = browserWindowOrChannel;
      channel = channelOrCallback;
      callback = callbackOrNothing;
      if (!window) {
        throw new Error("Browser window required");
      }
    }
    const sendChannel = util2.getSendChannel(channel);
    const listener = async (event, data) => {
      const browserWindow = BrowserWindow.fromWebContents(event.sender);
      if (window && window.id !== browserWindow.id) {
        return;
      }
      const send = (channel2, data2) => {
        if (!(browserWindow && browserWindow.isDestroyed())) {
          event.sender.send(channel2, data2);
        }
      };
      const { dataChannel, errorChannel, userData } = data;
      try {
        send(dataChannel, await callback(userData, browserWindow));
      } catch (error) {
        send(errorChannel, serializeError(error));
      }
    };
    ipcMain.on(sendChannel, listener);
    return () => {
      ipcMain.off(sendChannel, listener);
    };
  };
  ipc.sendToRenderers = (channel, data) => {
    for (const browserWindow of BrowserWindow.getAllWindows()) {
      if (browserWindow.webContents) {
        browserWindow.webContents.send(channel, data);
      }
    }
  };
  main = ipc;
  return main;
}
var ipcRenderer;
if (process.type === "renderer") {
  ipcRenderer = requireRenderer();
} else {
  requireMain();
}
const apiKey = "electron";
const api = {
  path,
  clipboard: require$$0.clipboard,
  ipcRenderer,
  access: (dir) => promises.access(dir, fs.constants.R_OK | fs.constants.W_OK),
  versions: process.versions
};
{
  require$$0.contextBridge.exposeInMainWorld(apiKey, api);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc2VyaWFsaXplLWVycm9yL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWJldHRlci1pcGMvc291cmNlL3V0aWwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24tYmV0dGVyLWlwYy9zb3VyY2UvcmVuZGVyZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZWxlY3Ryb24tYmV0dGVyLWlwYy9zb3VyY2UvbWFpbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1iZXR0ZXItaXBjL2luZGV4LmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgTm9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcblx0XHRzdXBlcihOb25FcnJvci5fcHJlcGFyZVN1cGVyTWVzc2FnZShtZXNzYWdlKSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICduYW1lJywge1xuXHRcdFx0dmFsdWU6ICdOb25FcnJvcicsXG5cdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0aWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG5cdFx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBOb25FcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIF9wcmVwYXJlU3VwZXJNZXNzYWdlKG1lc3NhZ2UpIHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuXHRcdH0gY2F0Y2gge1xuXHRcdFx0cmV0dXJuIFN0cmluZyhtZXNzYWdlKTtcblx0XHR9XG5cdH1cbn1cblxuY29uc3QgY29tbW9uUHJvcGVydGllcyA9IFtcblx0e3Byb3BlcnR5OiAnbmFtZScsIGVudW1lcmFibGU6IGZhbHNlfSxcblx0e3Byb3BlcnR5OiAnbWVzc2FnZScsIGVudW1lcmFibGU6IGZhbHNlfSxcblx0e3Byb3BlcnR5OiAnc3RhY2snLCBlbnVtZXJhYmxlOiBmYWxzZX0sXG5cdHtwcm9wZXJ0eTogJ2NvZGUnLCBlbnVtZXJhYmxlOiB0cnVlfVxuXTtcblxuY29uc3QgaXNDYWxsZWQgPSBTeW1ib2woJy50b0pTT04gY2FsbGVkJyk7XG5cbmNvbnN0IHRvSlNPTiA9IGZyb20gPT4ge1xuXHRmcm9tW2lzQ2FsbGVkXSA9IHRydWU7XG5cdGNvbnN0IGpzb24gPSBmcm9tLnRvSlNPTigpO1xuXHRkZWxldGUgZnJvbVtpc0NhbGxlZF07XG5cdHJldHVybiBqc29uO1xufTtcblxuY29uc3QgZGVzdHJveUNpcmN1bGFyID0gKHtcblx0ZnJvbSxcblx0c2Vlbixcblx0dG9fLFxuXHRmb3JjZUVudW1lcmFibGUsXG5cdG1heERlcHRoLFxuXHRkZXB0aFxufSkgPT4ge1xuXHRjb25zdCB0byA9IHRvXyB8fCAoQXJyYXkuaXNBcnJheShmcm9tKSA/IFtdIDoge30pO1xuXG5cdHNlZW4ucHVzaChmcm9tKTtcblxuXHRpZiAoZGVwdGggPj0gbWF4RGVwdGgpIHtcblx0XHRyZXR1cm4gdG87XG5cdH1cblxuXHRpZiAodHlwZW9mIGZyb20udG9KU09OID09PSAnZnVuY3Rpb24nICYmIGZyb21baXNDYWxsZWRdICE9PSB0cnVlKSB7XG5cdFx0cmV0dXJuIHRvSlNPTihmcm9tKTtcblx0fVxuXG5cdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGZyb20pKSB7XG5cdFx0aWYgKHR5cGVvZiBCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuXHRcdFx0dG9ba2V5XSA9ICdbb2JqZWN0IEJ1ZmZlcl0nO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHR0b1trZXldID0gdmFsdWU7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIXNlZW4uaW5jbHVkZXMoZnJvbVtrZXldKSkge1xuXHRcdFx0ZGVwdGgrKztcblxuXHRcdFx0dG9ba2V5XSA9IGRlc3Ryb3lDaXJjdWxhcih7XG5cdFx0XHRcdGZyb206IGZyb21ba2V5XSxcblx0XHRcdFx0c2Vlbjogc2Vlbi5zbGljZSgpLFxuXHRcdFx0XHRmb3JjZUVudW1lcmFibGUsXG5cdFx0XHRcdG1heERlcHRoLFxuXHRcdFx0XHRkZXB0aFxuXHRcdFx0fSk7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHR0b1trZXldID0gJ1tDaXJjdWxhcl0nO1xuXHR9XG5cblx0Zm9yIChjb25zdCB7cHJvcGVydHksIGVudW1lcmFibGV9IG9mIGNvbW1vblByb3BlcnRpZXMpIHtcblx0XHRpZiAodHlwZW9mIGZyb21bcHJvcGVydHldID09PSAnc3RyaW5nJykge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBwcm9wZXJ0eSwge1xuXHRcdFx0XHR2YWx1ZTogZnJvbVtwcm9wZXJ0eV0sXG5cdFx0XHRcdGVudW1lcmFibGU6IGZvcmNlRW51bWVyYWJsZSA/IHRydWUgOiBlbnVtZXJhYmxlLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuXG5jb25zdCBzZXJpYWxpemVFcnJvciA9ICh2YWx1ZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IHttYXhEZXB0aCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWX0gPSBvcHRpb25zO1xuXG5cdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0cmV0dXJuIGRlc3Ryb3lDaXJjdWxhcih7XG5cdFx0XHRmcm9tOiB2YWx1ZSxcblx0XHRcdHNlZW46IFtdLFxuXHRcdFx0Zm9yY2VFbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0bWF4RGVwdGgsXG5cdFx0XHRkZXB0aDogMFxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gUGVvcGxlIHNvbWV0aW1lcyB0aHJvdyB0aGluZ3MgYmVzaWRlcyBFcnJvciBvYmplY3Rz4oCmXG5cdGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcblx0XHQvLyBgSlNPTi5zdHJpbmdpZnkoKWAgZGlzY2FyZHMgZnVuY3Rpb25zLiBXZSBkbyB0b28sIHVubGVzcyBhIGZ1bmN0aW9uIGlzIHRocm93biBkaXJlY3RseS5cblx0XHRyZXR1cm4gYFtGdW5jdGlvbjogJHsodmFsdWUubmFtZSB8fCAnYW5vbnltb3VzJyl9XWA7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG5jb25zdCBkZXNlcmlhbGl6ZUVycm9yID0gKHZhbHVlLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3Qge21heERlcHRoID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZfSA9IG9wdGlvbnM7XG5cblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRjb25zdCBuZXdFcnJvciA9IG5ldyBFcnJvcigpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHVuaWNvcm4vZXJyb3ItbWVzc2FnZVxuXHRcdGRlc3Ryb3lDaXJjdWxhcih7XG5cdFx0XHRmcm9tOiB2YWx1ZSxcblx0XHRcdHNlZW46IFtdLFxuXHRcdFx0dG9fOiBuZXdFcnJvcixcblx0XHRcdG1heERlcHRoLFxuXHRcdFx0ZGVwdGg6IDBcblx0XHR9KTtcblx0XHRyZXR1cm4gbmV3RXJyb3I7XG5cdH1cblxuXHRyZXR1cm4gbmV3IE5vbkVycm9yKHZhbHVlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRzZXJpYWxpemVFcnJvcixcblx0ZGVzZXJpYWxpemVFcnJvclxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZ2V0VW5pcXVlSWQgPSAoKSA9PiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCl9YDtcblxuY29uc3QgZ2V0U2VuZENoYW5uZWwgPSBjaGFubmVsID0+IGAlYmV0dGVyLWlwYy1zZW5kLWNoYW5uZWwtJHtjaGFubmVsfWA7XG5jb25zdCBnZXRSZW5kZXJlclNlbmRDaGFubmVsID0gY2hhbm5lbCA9PiBgJWJldHRlci1pcGMtc2VuZC1jaGFubmVsLSR7Y2hhbm5lbH1gO1xuXG5tb2R1bGUuZXhwb3J0cy5jdXJyZW50V2luZG93Q2hhbm5lbCA9ICclYmV0dGVyLWlwYy1jdXJyZW50LXdpbmRvdyc7XG5cbm1vZHVsZS5leHBvcnRzLmdldFNlbmRDaGFubmVsID0gZ2V0U2VuZENoYW5uZWw7XG5tb2R1bGUuZXhwb3J0cy5nZXRSZW5kZXJlclNlbmRDaGFubmVsID0gZ2V0UmVuZGVyZXJTZW5kQ2hhbm5lbDtcblxubW9kdWxlLmV4cG9ydHMuZ2V0UmVzcG9uc2VDaGFubmVscyA9IGNoYW5uZWwgPT4ge1xuXHRjb25zdCBpZCA9IGdldFVuaXF1ZUlkKCk7XG5cdHJldHVybiB7XG5cdFx0c2VuZENoYW5uZWw6IGdldFNlbmRDaGFubmVsKGNoYW5uZWwpLFxuXHRcdGRhdGFDaGFubmVsOiBgJWJldHRlci1pcGMtcmVzcG9uc2UtZGF0YS1jaGFubmVsLSR7Y2hhbm5lbH0tJHtpZH1gLFxuXHRcdGVycm9yQ2hhbm5lbDogYCViZXR0ZXItaXBjLXJlc3BvbnNlLWVycm9yLWNoYW5uZWwtJHtjaGFubmVsfS0ke2lkfWBcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldFJlbmRlcmVyUmVzcG9uc2VDaGFubmVscyA9IGNoYW5uZWwgPT4ge1xuXHRjb25zdCBpZCA9IGdldFVuaXF1ZUlkKCk7XG5cdHJldHVybiB7XG5cdFx0c2VuZENoYW5uZWw6IGdldFJlbmRlcmVyU2VuZENoYW5uZWwoY2hhbm5lbCksXG5cdFx0ZGF0YUNoYW5uZWw6IGAlYmV0dGVyLWlwYy1yZXNwb25zZS1kYXRhLWNoYW5uZWwtJHtjaGFubmVsfS0ke2lkfWAsXG5cdFx0ZXJyb3JDaGFubmVsOiBgJWJldHRlci1pcGMtcmVzcG9uc2UtZXJyb3ItY2hhbm5lbC0ke2NoYW5uZWx9LSR7aWR9YFxuXHR9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbmNvbnN0IHtzZXJpYWxpemVFcnJvciwgZGVzZXJpYWxpemVFcnJvcn0gPSByZXF1aXJlKCdzZXJpYWxpemUtZXJyb3InKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuY29uc3Qge2lwY1JlbmRlcmVyfSA9IGVsZWN0cm9uO1xuY29uc3QgaXBjID0gT2JqZWN0LmNyZWF0ZShpcGNSZW5kZXJlciB8fCB7fSk7XG5cbmlwYy5jYWxsTWFpbiA9IChjaGFubmVsLCBkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdGNvbnN0IHtzZW5kQ2hhbm5lbCwgZGF0YUNoYW5uZWwsIGVycm9yQ2hhbm5lbH0gPSB1dGlsLmdldFJlc3BvbnNlQ2hhbm5lbHMoY2hhbm5lbCk7XG5cblx0Y29uc3QgY2xlYW51cCA9ICgpID0+IHtcblx0XHRpcGNSZW5kZXJlci5vZmYoZGF0YUNoYW5uZWwsIG9uRGF0YSk7XG5cdFx0aXBjUmVuZGVyZXIub2ZmKGVycm9yQ2hhbm5lbCwgb25FcnJvcik7XG5cdH07XG5cblx0Y29uc3Qgb25EYXRhID0gKF9ldmVudCwgcmVzdWx0KSA9PiB7XG5cdFx0Y2xlYW51cCgpO1xuXHRcdHJlc29sdmUocmVzdWx0KTtcblx0fTtcblxuXHRjb25zdCBvbkVycm9yID0gKF9ldmVudCwgZXJyb3IpID0+IHtcblx0XHRjbGVhbnVwKCk7XG5cdFx0cmVqZWN0KGRlc2VyaWFsaXplRXJyb3IoZXJyb3IpKTtcblx0fTtcblxuXHRpcGNSZW5kZXJlci5vbmNlKGRhdGFDaGFubmVsLCBvbkRhdGEpO1xuXHRpcGNSZW5kZXJlci5vbmNlKGVycm9yQ2hhbm5lbCwgb25FcnJvcik7XG5cblx0Y29uc3QgY29tcGxldGVEYXRhID0ge1xuXHRcdGRhdGFDaGFubmVsLFxuXHRcdGVycm9yQ2hhbm5lbCxcblx0XHR1c2VyRGF0YTogZGF0YVxuXHR9O1xuXG5cdGlwY1JlbmRlcmVyLnNlbmQoc2VuZENoYW5uZWwsIGNvbXBsZXRlRGF0YSk7XG59KTtcblxuaXBjLmFuc3dlck1haW4gPSAoY2hhbm5lbCwgY2FsbGJhY2spID0+IHtcblx0Y29uc3Qgc2VuZENoYW5uZWwgPSB1dGlsLmdldFJlbmRlcmVyU2VuZENoYW5uZWwoY2hhbm5lbCk7XG5cblx0Y29uc3QgbGlzdGVuZXIgPSBhc3luYyAoX2V2ZW50LCBkYXRhKSA9PiB7XG5cdFx0Y29uc3Qge2RhdGFDaGFubmVsLCBlcnJvckNoYW5uZWwsIHVzZXJEYXRhfSA9IGRhdGE7XG5cblx0XHR0cnkge1xuXHRcdFx0aXBjUmVuZGVyZXIuc2VuZChkYXRhQ2hhbm5lbCwgYXdhaXQgY2FsbGJhY2sodXNlckRhdGEpKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0aXBjUmVuZGVyZXIuc2VuZChlcnJvckNoYW5uZWwsIHNlcmlhbGl6ZUVycm9yKGVycm9yKSk7XG5cdFx0fVxuXHR9O1xuXG5cdGlwY1JlbmRlcmVyLm9uKHNlbmRDaGFubmVsLCBsaXN0ZW5lcik7XG5cblx0cmV0dXJuICgpID0+IHtcblx0XHRpcGNSZW5kZXJlci5vZmYoc2VuZENoYW5uZWwsIGxpc3RlbmVyKTtcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXBjO1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuY29uc3Qge3NlcmlhbGl6ZUVycm9yLCBkZXNlcmlhbGl6ZUVycm9yfSA9IHJlcXVpcmUoJ3NlcmlhbGl6ZS1lcnJvcicpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG5jb25zdCB7aXBjTWFpbiwgQnJvd3NlcldpbmRvd30gPSBlbGVjdHJvbjtcbmNvbnN0IGlwYyA9IE9iamVjdC5jcmVhdGUoaXBjTWFpbiB8fCB7fSk7XG5cbmlwYy5jYWxsUmVuZGVyZXIgPSAoYnJvd3NlcldpbmRvdywgY2hhbm5lbCwgZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRpZiAoIWJyb3dzZXJXaW5kb3cpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgd2luZG93IHJlcXVpcmVkJyk7XG5cdH1cblxuXHRjb25zdCB7c2VuZENoYW5uZWwsIGRhdGFDaGFubmVsLCBlcnJvckNoYW5uZWx9ID0gdXRpbC5nZXRSZW5kZXJlclJlc3BvbnNlQ2hhbm5lbHMoY2hhbm5lbCk7XG5cblx0Y29uc3QgY2xlYW51cCA9ICgpID0+IHtcblx0XHRpcGNNYWluLm9mZihkYXRhQ2hhbm5lbCwgb25EYXRhKTtcblx0XHRpcGNNYWluLm9mZihlcnJvckNoYW5uZWwsIG9uRXJyb3IpO1xuXHR9O1xuXG5cdGNvbnN0IG9uRGF0YSA9IChldmVudCwgcmVzdWx0KSA9PiB7XG5cdFx0Y29uc3Qgd2luZG93ID0gQnJvd3NlcldpbmRvdy5mcm9tV2ViQ29udGVudHMoZXZlbnQuc2VuZGVyKTtcblx0XHRpZiAod2luZG93LmlkID09PSBicm93c2VyV2luZG93LmlkKSB7XG5cdFx0XHRjbGVhbnVwKCk7XG5cdFx0XHRyZXNvbHZlKHJlc3VsdCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IG9uRXJyb3IgPSAoZXZlbnQsIGVycm9yKSA9PiB7XG5cdFx0Y29uc3Qgd2luZG93ID0gQnJvd3NlcldpbmRvdy5mcm9tV2ViQ29udGVudHMoZXZlbnQuc2VuZGVyKTtcblx0XHRpZiAod2luZG93LmlkID09PSBicm93c2VyV2luZG93LmlkKSB7XG5cdFx0XHRjbGVhbnVwKCk7XG5cdFx0XHRyZWplY3QoZGVzZXJpYWxpemVFcnJvcihlcnJvcikpO1xuXHRcdH1cblx0fTtcblxuXHRpcGNNYWluLm9uKGRhdGFDaGFubmVsLCBvbkRhdGEpO1xuXHRpcGNNYWluLm9uKGVycm9yQ2hhbm5lbCwgb25FcnJvcik7XG5cblx0Y29uc3QgY29tcGxldGVEYXRhID0ge1xuXHRcdGRhdGFDaGFubmVsLFxuXHRcdGVycm9yQ2hhbm5lbCxcblx0XHR1c2VyRGF0YTogZGF0YVxuXHR9O1xuXG5cdGlmIChicm93c2VyV2luZG93LndlYkNvbnRlbnRzKSB7XG5cdFx0YnJvd3NlcldpbmRvdy53ZWJDb250ZW50cy5zZW5kKHNlbmRDaGFubmVsLCBjb21wbGV0ZURhdGEpO1xuXHR9XG59KTtcblxuaXBjLmNhbGxGb2N1c2VkUmVuZGVyZXIgPSBhc3luYyAoLi4uYXJncykgPT4ge1xuXHRjb25zdCBmb2N1c2VkV2luZG93ID0gQnJvd3NlcldpbmRvdy5nZXRGb2N1c2VkV2luZG93KCk7XG5cdGlmICghZm9jdXNlZFdpbmRvdykge1xuXHRcdHRocm93IG5ldyBFcnJvcignTm8gYnJvd3NlciB3aW5kb3cgaW4gZm9jdXMnKTtcblx0fVxuXG5cdHJldHVybiBpcGMuY2FsbFJlbmRlcmVyKGZvY3VzZWRXaW5kb3csIC4uLmFyZ3MpO1xufTtcblxuaXBjLmFuc3dlclJlbmRlcmVyID0gKGJyb3dzZXJXaW5kb3dPckNoYW5uZWwsIGNoYW5uZWxPckNhbGxiYWNrLCBjYWxsYmFja09yTm90aGluZykgPT4ge1xuXHRsZXQgd2luZG93O1xuXHRsZXQgY2hhbm5lbDtcblx0bGV0IGNhbGxiYWNrO1xuXG5cdGlmIChjYWxsYmFja09yTm90aGluZyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Y2hhbm5lbCA9IGJyb3dzZXJXaW5kb3dPckNoYW5uZWw7XG5cdFx0Y2FsbGJhY2sgPSBjaGFubmVsT3JDYWxsYmFjaztcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cgPSBicm93c2VyV2luZG93T3JDaGFubmVsO1xuXHRcdGNoYW5uZWwgPSBjaGFubmVsT3JDYWxsYmFjaztcblx0XHRjYWxsYmFjayA9IGNhbGxiYWNrT3JOb3RoaW5nO1xuXG5cdFx0aWYgKCF3aW5kb3cpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignQnJvd3NlciB3aW5kb3cgcmVxdWlyZWQnKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBzZW5kQ2hhbm5lbCA9IHV0aWwuZ2V0U2VuZENoYW5uZWwoY2hhbm5lbCk7XG5cblx0Y29uc3QgbGlzdGVuZXIgPSBhc3luYyAoZXZlbnQsIGRhdGEpID0+IHtcblx0XHRjb25zdCBicm93c2VyV2luZG93ID0gQnJvd3NlcldpbmRvdy5mcm9tV2ViQ29udGVudHMoZXZlbnQuc2VuZGVyKTtcblxuXHRcdGlmICh3aW5kb3cgJiYgd2luZG93LmlkICE9PSBicm93c2VyV2luZG93LmlkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VuZCA9IChjaGFubmVsLCBkYXRhKSA9PiB7XG5cdFx0XHRpZiAoIShicm93c2VyV2luZG93ICYmIGJyb3dzZXJXaW5kb3cuaXNEZXN0cm95ZWQoKSkpIHtcblx0XHRcdFx0ZXZlbnQuc2VuZGVyLnNlbmQoY2hhbm5lbCwgZGF0YSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IHtkYXRhQ2hhbm5lbCwgZXJyb3JDaGFubmVsLCB1c2VyRGF0YX0gPSBkYXRhO1xuXG5cdFx0dHJ5IHtcblx0XHRcdHNlbmQoZGF0YUNoYW5uZWwsIGF3YWl0IGNhbGxiYWNrKHVzZXJEYXRhLCBicm93c2VyV2luZG93KSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdHNlbmQoZXJyb3JDaGFubmVsLCBzZXJpYWxpemVFcnJvcihlcnJvcikpO1xuXHRcdH1cblx0fTtcblxuXHRpcGNNYWluLm9uKHNlbmRDaGFubmVsLCBsaXN0ZW5lcik7XG5cblx0cmV0dXJuICgpID0+IHtcblx0XHRpcGNNYWluLm9mZihzZW5kQ2hhbm5lbCwgbGlzdGVuZXIpO1xuXHR9O1xufTtcblxuaXBjLnNlbmRUb1JlbmRlcmVycyA9IChjaGFubmVsLCBkYXRhKSA9PiB7XG5cdGZvciAoY29uc3QgYnJvd3NlcldpbmRvdyBvZiBCcm93c2VyV2luZG93LmdldEFsbFdpbmRvd3MoKSkge1xuXHRcdGlmIChicm93c2VyV2luZG93LndlYkNvbnRlbnRzKSB7XG5cdFx0XHRicm93c2VyV2luZG93LndlYkNvbnRlbnRzLnNlbmQoY2hhbm5lbCwgZGF0YSk7XG5cdFx0fVxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlwYztcbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuXHRtb2R1bGUuZXhwb3J0cy5pcGNSZW5kZXJlciA9IHJlcXVpcmUoJy4vc291cmNlL3JlbmRlcmVyLmpzJyk7XG59IGVsc2Uge1xuXHRtb2R1bGUuZXhwb3J0cy5pcGNNYWluID0gcmVxdWlyZSgnLi9zb3VyY2UvbWFpbi5qcycpO1xufVxuIiwiaW1wb3J0IHsgY29udGV4dEJyaWRnZSwgY2xpcGJvYXJkIH0gZnJvbSAnZWxlY3Ryb24nO1xuaW1wb3J0IHsgaXBjUmVuZGVyZXIgfSBmcm9tICdlbGVjdHJvbi1iZXR0ZXItaXBjJztcbmltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGFjY2VzcyB9IGZyb20gJ2ZzL3Byb21pc2VzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBhcGlLZXkgPSAnZWxlY3Ryb24nO1xuLyoqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi9lbGVjdHJvbi9pc3N1ZXMvMjE0MzcjaXNzdWVjb21tZW50LTU3MzUyMjM2MFxuICovXG5jb25zdCBhcGkgPSB7XG4gIHBhdGgsXG4gIGNsaXBib2FyZCxcbiAgaXBjUmVuZGVyZXIsXG4gIGFjY2VzczogKGRpcikgPT4gYWNjZXNzKGRpciwgY29uc3RhbnRzLlJfT0sgfCBjb25zdGFudHMuV19PSyksXG4gIHZlcnNpb25zOiBwcm9jZXNzLnZlcnNpb25zLFxufTtcblxuaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFICE9PSAndGVzdCcpIHtcbiAgLyoqXG4gICAqIFRoZSBcIk1haW4gV29ybGRcIiBpcyB0aGUgSmF2YVNjcmlwdCBjb250ZXh0IHRoYXQgeW91ciBtYWluIHJlbmRlcmVyIGNvZGUgcnVucyBpbi5cbiAgICogQnkgZGVmYXVsdCwgdGhlIHBhZ2UgeW91IGxvYWQgaW4geW91ciByZW5kZXJlciBleGVjdXRlcyBjb2RlIGluIHRoaXMgd29ybGQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZWxlY3Ryb25qcy5vcmcvZG9jcy9hcGkvY29udGV4dC1icmlkZ2VcbiAgICovXG4gIGNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoYXBpS2V5LCBhcGkpO1xufSBlbHNlIHtcblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgT2JqZWN0LmZyZWV6ZSgpIG9uIG9iamVjdHMgYW5kIGZ1bmN0aW9uc1xuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zdWJzdGFjay9kZWVwLWZyZWV6ZVxuICAgKiBAcGFyYW0gb2JqIE9iamVjdCBvbiB3aGljaCB0byBsb2NrIHRoZSBhdHRyaWJ1dGVzXG4gICAqL1xuICBjb25zdCBkZWVwRnJlZXplID0gKG9iaikgPT4ge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwpIHtcbiAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBjb25zdCB2YWwgPSBvYmpbcHJvcF07XG4gICAgICAgIGlmICgodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykgJiYgIU9iamVjdC5pc0Zyb3plbih2YWwpKSB7XG4gICAgICAgICAgZGVlcEZyZWV6ZSh2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZShvYmopO1xuICB9O1xuXG4gIGRlZXBGcmVlemUoYXBpKTtcblxuICB3aW5kb3dbYXBpS2V5XSA9IGFwaTtcblxuICAvLyBOZWVkIGZvciBTcGVjdHJvbiB0ZXN0c1xuICB3aW5kb3cuZWxlY3Ryb25SZXF1aXJlID0gcmVxdWlyZTtcbn1cbiJdLCJuYW1lcyI6WyJyZXF1aXJlJCQxIiwidXRpbCIsInJlcXVpcmUkJDIiLCJpcGNSZW5kZXJlciIsImNoYW5uZWwiLCJkYXRhIiwicmVxdWlyZSQkMCIsImNsaXBib2FyZCIsImFjY2VzcyIsImNvbnN0YW50cyIsImNvbnRleHRCcmlkZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0VBRUEsTUFBTSxpQkFBaUIsTUFBTTtBQUFBLElBQzVCLFlBQVksU0FBUztBQUNwQixZQUFNLFNBQVMscUJBQXFCLE9BQU8sQ0FBQztBQUM1QyxhQUFPLGVBQWUsTUFBTSxRQUFRO0FBQUEsUUFDbkMsT0FBTztBQUFBLFFBQ1AsY0FBYztBQUFBLFFBQ2QsVUFBVTtBQUFBLE1BQ2IsQ0FBRztBQUVELFVBQUksTUFBTSxtQkFBbUI7QUFDNUIsY0FBTSxrQkFBa0IsTUFBTSxRQUFRO0FBQUEsTUFDdEM7QUFBQSxJQUNEO0FBQUEsSUFFRCxPQUFPLHFCQUFxQixTQUFTO0FBQ3BDLFVBQUk7QUFDSCxlQUFPLEtBQUssVUFBVSxPQUFPO0FBQUEsTUFDaEMsUUFBVTtBQUNQLGVBQU8sT0FBTyxPQUFPO0FBQUEsTUFDckI7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUVELFFBQU0sbUJBQW1CO0FBQUEsSUFDeEIsRUFBQyxVQUFVLFFBQVEsWUFBWSxNQUFLO0FBQUEsSUFDcEMsRUFBQyxVQUFVLFdBQVcsWUFBWSxNQUFLO0FBQUEsSUFDdkMsRUFBQyxVQUFVLFNBQVMsWUFBWSxNQUFLO0FBQUEsSUFDckMsRUFBQyxVQUFVLFFBQVEsWUFBWSxLQUFJO0FBQUEsRUFDcEM7QUFFQSxRQUFNLFdBQVcsT0FBTyxnQkFBZ0I7QUFF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Q0osUUFBSTtBQUNKLFFBQUk7QUFFSixRQUFJLHNCQUFzQixRQUFXO0FBQ3BDLGdCQUFVO0FBQ1YsaUJBQVc7QUFBQSxJQUNiLE9BQVE7QUFDTixlQUFTO0FBQ1QsZ0JBQVU7QUFDVixpQkFBVztBQUVYLFVBQUksQ0FBQyxRQUFRO0FBQ1osY0FBTSxJQUFJLE1BQU0seUJBQXlCO0FBQUEsTUFDekM7QUFBQSxJQUNEO0FBRUQsVUFBTSxjQUFjQSxNQUFLLGVBQWUsT0FBTztBQUUvQyxVQUFNLFdBQVcsT0FBTyxPQUFPLFNBQVM7QUFDdkMsWUFBTSxnQkFBZ0IsY0FBYyxnQkFBZ0IsTUFBTSxNQUFNO0FBRWhFLFVBQUksVUFBVSxPQUFPLE9BQU8sY0FBYyxJQUFJO0FBQzdDO0FBQUEsTUFDQTtBQUVELFlBQU0sT0FBTyxDQUFDRyxVQUFTQyxVQUFTO0FBQy9CLFlBQUksRUFBRSxpQkFBaUIsY0FBYyxZQUFhLElBQUc7QUFDcEQsZ0JBQU0sT0FBTyxLQUFLRCxVQUFTQyxLQUFJO0FBQUEsUUFDL0I7QUFBQSxNQUNKO0FBRUUsWUFBTSxFQUFDLGFBQWEsY0FBYyxTQUFRLElBQUk7QUFFOUMsVUFBSTtBQUNILGFBQUssYUFBYSxNQUFNLFNBQVMsVUFBVSxhQUFhLENBQUM7QUFBQSxNQUN6RCxTQUFRLE9BQU87QUFDZixhQUFLLGNBQWMsZUFBZSxLQUFLLENBQUM7QUFBQSxNQUN4QztBQUFBLElBQ0g7QUFFQyxZQUFRLEdBQUcsYUFBYSxRQUFRO0FBRWhDLFdBQU8sTUFBTTtBQUNaLGNBQVEsSUFBSSxhQUFhLFFBQVE7QUFBQSxJQUNuQztBQUFBLEVBQ0E7QUFFQSxNQUFJLGtCQUFrQixDQUFDLFNBQVMsU0FBUztBQUN4QyxlQUFXLGlCQUFpQixjQUFjLGlCQUFpQjtBQUMxRCxVQUFJLGNBQWMsYUFBYTtBQUM5QixzQkFBYyxZQUFZLEtBQUssU0FBUyxJQUFJO0FBQUEsTUFDNUM7QUFBQSxJQUNEO0FBQUEsRUFDRjtBQUVBLFNBQWlCOzs7O0FDbEhqQixJQUFJLFFBQVEsU0FBUyxZQUFZO0FBQ2hDLGdCQUE2QkMsZ0JBQUE7QUFDOUIsT0FBTztBQUNtQk47QUFDMUI7QUNBQSxNQUFNLFNBQVM7QUFJZixNQUFNLE1BQU07QUFBQSxFQUNWO0FBQUEsRUFBQSxXQUNBTyxXQUFBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsUUFBUSxDQUFDLFFBQVFDLGdCQUFPLEtBQUtDLEdBQUFBLFVBQVUsT0FBT0EsYUFBVSxJQUFJO0FBQUEsRUFDNUQsVUFBVSxRQUFRO0FBQ3BCO0FBRXFDO0FBT3JCQyxhQUFBQSxjQUFBLGtCQUFrQixRQUFRLEdBQUc7QUFDN0M7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNF19
