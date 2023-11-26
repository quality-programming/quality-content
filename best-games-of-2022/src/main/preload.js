'use strict';

const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    invincibleMainWindow: () => ipcRenderer.invoke('invincible-main-window'),
    playVideo: () => ipcRenderer.invoke('play-video')
});
