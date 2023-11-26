'use strict';

const { app, BrowserWindow, dialog, ipcMain, Menu, nativeImage } = require('electron');
const { got, TimeoutError, CancelError, HTTPError } = require('got');
const path = require('path');
const fs = require('fs');

import AppIcon from '../assets/img/icon.png';


const DEV = process.env.NODE_ENV === 'development';


// Initialization

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 544,
        height: 544,
        resizable: DEV,
        maximizable: DEV,
        useContentSize: true,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.platform === 'linux') {
        const icon = nativeImage.createFromPath(path.join(__dirname, AppIcon));
        mainWindow.setIcon(icon);
    }

    if (DEV) {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
        mainWindow.setMenu(menu);
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// IPC listeners

ipcMain.on('quit', (event, args) => {
    app.quit();
});

let _imagePromise;
let _imageData;
let _imageFilename;
ipcMain.handle('request-image', async (event, url, options, filename) => {
    console.log(`Fetching '${url}'`);

    const promise = got.get(url, options);
    _imagePromise = promise;

    const result = promise
        .then((res) => {
            if (res.body.length === 0) {
                return {
                    success: false,
                    cancelled: false,
                    message: 'Response data length is 0',
                    data: null
                };
            }

            _imageData = res.body,
            _imageFilename = filename;
            return {
                success: true,
                cancelled: false,
                message: `${res.statusCode} ${res.statusMessage}`,
                data: res.body
            };
        })
        .catch((err) => {
            if (err instanceof CancelError) {
                return {
                    success: false,
                    cancelled: true,
                    message: 'Request cancelled',
                    data: null
                }
            }
            if (err instanceof TimeoutError) {
                return {
                    success: false,
                    cancelled: false,
                    message: 'Request timed out',
                    data: null
                }
            }
            if (err instanceof HTTPError) {
                console.error(err);
                return {
                    success: false,
                    cancelled: false,
                    message: `HTTP error: ${err.response.statusCode} (${err.response.statusMessage || err.code})`,
                    data: null
                };
            }
            return {
                success: false,
                cancelled: false,
                message: err.toString(),
                data: null
            };
        });

    result.then(completedResult => {
        if (completedResult.success) {
            console.log(`Successfully fetched '${url}'`);
        } else {
            console.error(`Error fetching '${url}': ${completedResult.message}`);
        }
    });

    return result;
});

ipcMain.handle('cancel-image-request', (event) => {
    if (_imagePromise) {
        console.log('Cancelling image request');
        _imagePromise.cancel();
        return true;
    }
    return false;
});

ipcMain.handle('save-image', (event) => {
    if (!_imageData || !_imageFilename) {
        console.error('Cannot save non-fetched image');
        return {
            success: false,
            cancelled: false,
            error: 'Cannot save non-fetched image'
        }
    }

    const window = BrowserWindow.fromWebContents(event.sender);
    const result = dialog.showSaveDialogSync(window, {
        defaultPath: _imageFilename,
        filters: [{ name: 'Image', extensions: ['png'] }]
    });

    if (!result) {
        return {
            success: false,
            cancelled: true,
            error: null
        };
    }

    console.log(`Saving image '${result}'`);
    try {
        fs.writeFileSync(result, _imageData);
    } catch (err) {
        return {
            success: false,
            cancelled: false,
            error: err.toString()
        };
    }

    return {
        success: true,
        cancelled: false,
        error: null
    };
});
