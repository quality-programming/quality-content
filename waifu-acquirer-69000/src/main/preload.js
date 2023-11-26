'use strict';

const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    getVersion: () => ipcRenderer.invoke('get-version'),
    quit: () => ipcRenderer.send('quit'),
    requestImage: (neko, nsfw) => ipcRenderer.invoke('request-image', neko, nsfw),
    saveImage: () => ipcRenderer.invoke('save-image'),
    cancelImageRequest: () => ipcRenderer.invoke('cancel-image-request'),
    openUrl: (url) => ipcRenderer.send('open-url', url)
});
