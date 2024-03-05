const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("os", {
  homedir: () => ipcRenderer.invoke("os-homedir"),
});

contextBridge.exposeInMainWorld("path", {
  join: (value) => ipcRenderer.invoke("path-join", value),
});

contextBridge.exposeInMainWorld("imgApi", {
  resize: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
