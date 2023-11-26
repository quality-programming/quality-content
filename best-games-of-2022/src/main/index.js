'use strict';

const { app, BrowserWindow, ipcMain, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { setWallpaper } = require('wallpaper');
const tmp = require('tmp');

import AppIcon from '../assets/img/icon.png';


const DEV = process.env.NODE_ENV === 'development';

let mainWindow = null;
let players = [];


// Initialization

function createMainWindow() {
    const window = new BrowserWindow({
        width: 960,
        height: 540,
        useContentSize: true,
        maximizable: DEV,
        resizable: DEV,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.platform === 'linux') {
        const icon = nativeImage.createFromPath(path.join(__dirname, AppIcon));
        window.setIcon(icon);
    }

    if (DEV) {
        window.loadURL('http://localhost:8080');
        window.webContents.openDevTools();
    } else {
        window.loadFile(path.join(__dirname, 'index.html'));
        const menu = Menu.buildFromTemplate([
            {
                label: 'App',
                submenu: [{ role: 'quit' }]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ]
            },
            {
                label: 'Debug',
                submenu: [{ role: 'toggledevtools' }]
            }
        ]);
        window.setMenu(menu);
    }

    window.once('ready-to-show', () => {
        window.show();
    });

    window.once('closed', () => {
        mainWindow = null;
    });

    return window;
}

function createPlayerWindow(x, y, width, height, parent) {
    const window = new BrowserWindow({
        parent: parent,
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
        show: false,
        modal: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload-player.js')
        }
    });

    if (DEV) {
        window.loadURL('http://localhost:8080/player.html');
        window.webContents.openDevTools();
    } else {
        window.loadFile(path.join(__dirname, 'player.html'));
        const menu = Menu.buildFromTemplate([
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
    mainWindow = createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createMainWindow();
        }
    });

    const { screen } = require('electron');
    const displays = screen.getAllDisplays() || [screen.getPrimaryDisplay()];

    ipcMain.handle('invincible-main-window', () => {
        setInvincibleMainWindow(true);
    });

    ipcMain.handle('play-video', async () => {
        if (players.length > 0) {
            console.error('Players already initialized');
            return;
        }

        displays.forEach((display) => {
            const x = display.bounds.x;
            const y = display.bounds.y;
            const width = display.bounds.width;
            const height = display.bounds.height;
            const playerWindow = createPlayerWindow(x, y, width, height, mainWindow);
            const loaded = new Promise((resolve, reject) => {
                playerWindow.once('ready-to-show', resolve);
            });

            players.push({
                window: playerWindow,
                loaded: loaded
            });
        });

        return await Promise.all(players.map((player) => player.loaded)).then(
            () => {
                console.log('Players loaded, starting video');
                players.forEach((player, index) => {
                    player.window.webContents.send('play', index === 0);
                });
                return;
            },
            () => {
                console.log('Players loading error, quitting');
                setInvincibleMainWindow(false);
                app.quit();
                return;
            }
        );
    });

    ipcMain.handle('playback-end', async (event) => {
        try {
            players.forEach((player) => player.window.destroy());
        } catch (error) {
            console.error(`Error destroying players after playback end: ${error}`);
        }

        try {
            const wallpaperData = fs.readFileSync(path.join(__dirname, 'assets/img/wallpaper.jpg'));
            const tempFile = tmp.fileSync({
                detachDescriptor: true,
                keep: true,
                postfix: '.jpg'
            });
            fs.writeFileSync(tempFile.fd, wallpaperData);
            fs.closeSync(tempFile.fd);

            await setWallpaper(tempFile.name, { screen: 'all', scale: 'stretch' });
            console.log(`Wallpaper set to '${tempFile.name}'`);
        } catch (error) {
            console.error(`Error setting wallpaper: ${error}`);
        }

        setInvincibleMainWindow(false);
        app.quit();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function preventOnClose(event) {
    event.preventDefault()
}

function setInvincibleMainWindow(invincible) {
    mainWindow.setAlwaysOnTop(invincible);
    if (invincible) {
        mainWindow.on('close', preventOnClose);
    } else {
        mainWindow.off('close', preventOnClose);
    }
}
