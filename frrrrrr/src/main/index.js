'use strict';

const { app, BrowserWindow, ipcMain, Menu, nativeImage } = require('electron');
const path = require('path');

import AppIcon from '../assets/img/icon.png';


const DEV = process.env.NODE_ENV === 'development';

let players = [];


function createPlayerWindow(x, y, width, height) {
    const window = new BrowserWindow({
        x: x,
        y: y,
        width: width,
        height: height,
        useContentSize: true,
        maximizable: false,
        minimizable: false,
        fullscreenable: false,
        movable: false,
        closable: false,
        frame: false,
        skipTaskbar: true,
        transparent: true,
        alwaysOnTop: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload-player.js')
        }
    });

    if (process.platform === 'linux') {
        const icon = nativeImage.createFromPath(path.join(__dirname, AppIcon));
        window.setIcon(icon);
    }

    if (DEV) {
        window.loadURL('http://localhost:8080/player.html');
        window.webContents.openDevTools();
    } else {
        window.loadFile(path.join(__dirname, 'player.html'));
        const menu = Menu.buildFromTemplate([
            {
                label: 'App',
                submenu: [{ role: 'quit' }]
            },
            {
                label: 'Debug',
                submenu: [{ role: 'toggledevtools' }]
            }
        ]);
        window.setMenu(menu);
    }

    window.setContentSize(width, height);

    window.once('ready-to-show', () => {
        window.show();
        window.moveTop();
        window.focus();
        window.setResizable(false);
    });

    if (!DEV) {
        window.on('close', (event) => event.preventDefault());
    }

    return window;
}

app.whenReady().then(async () => {
    ipcMain.handle('playback-end', () => {
        try {
            players.forEach((player) => player.window.destroy());
            players = [];
        } catch (error) {
            console.error(`Error destroying players after playback end: ${error}`);
        }

        app.quit();
    });

    const { screen } = require('electron');
    const displays = screen.getAllDisplays() || [screen.getPrimaryDisplay()];

    displays.forEach((display) => {
        const x = display.bounds.x;
        const y = display.bounds.y;
        const width = display.bounds.width;
        const height = display.bounds.height;
        const playerWindow = createPlayerWindow(x, y, width, height);
        const loaded = new Promise((resolve, reject) => {
            playerWindow.once('ready-to-show', resolve);
        });

        players.push({
            window: playerWindow,
            loaded: loaded
        });
    });

    await Promise.all(players.map((player) => player.loaded)).then(
        () => {
            console.log('Players loaded, starting video');
            players.forEach((player, index) => {
                player.window.webContents.send('play', index === 0);
            });
        },
        () => {
            console.log('Players loading error, quitting');
            app.quit();
        }
    );
});

app.on('window-all-closed', () => app.quit());
