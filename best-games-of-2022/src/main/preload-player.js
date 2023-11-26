'use strict';

const { ipcRenderer, contextBridge } = require('electron');


contextBridge.exposeInMainWorld('api', {
    onPlay: (callback) => ipcRenderer.on('play', callback),
    playbackEnd: () => ipcRenderer.invoke('playback-end'),
});
