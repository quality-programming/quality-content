'use strict';

const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    quit: () => ipcRenderer.send('quit'),
    requestImage: (url, options, filename) => ipcRenderer.invoke('request-image', url, options, filename),
    cancelImageRequest: () => ipcRenderer.invoke('cancel-image-request'),
    saveImage: () => ipcRenderer.invoke('save-image')
});
