import { app, BrowserWindow, screen, ipcMain, webContents, ipcRenderer } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow = null;
function createWindow(): BrowserWindow {

    const electronScreen = screen;
    const size = electronScreen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        // x: 0,
        // y: 0,
        // width: size.width,
        // height: size.height,
        width: 800,
        height: 600,
        webPreferences: {
            // webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,  // false if you want to run 2e2 test with Spectron
            enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
        },
    });

    win.webContents.openDevTools();

    win.loadURL(url.format({
        pathname: path.join(__dirname, `../../dist/index.html`),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    return win;
}

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    app.on('ready', () => setTimeout(createWindow, 400));


    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });


    // app.on('select-client-certificate', (event, webContents, url, list, callback) => {
    //     event.preventDefault();
    //     console.log(event, 'event');
    //     console.log(webContents, 'webContents');
    //     console.log(url, 'url');
    //     console.log(list, 'list');
    //     win.webContents.send("getTokenData", [event, webContents, url, list, callback]);
    //     callback(list[0]);
    // });

    app.on('select-client-certificate', (event, webContents, url, list, callback) => {
        console.log('select-client-certificate', url, list)
        event.preventDefault()

        ipcMain.once('client-certificate-selected', (event, item) => {
            console.log('selected:', item)
            callback(item)
        })
        win.webContents.send('getTokenData', list)
        
    });


    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
        console.log('certificate-error', url)
        event.preventDefault()
        //     const result = ... // do your validation here
        // callback(result)
    });

    app.on('login', (event, webContents, details, authInfo, callback) => {
        console.log('login');
        event.preventDefault()
        // callback('username', 'secret')
    });

    app.on('will-quit', (event) => {
        console.log('will-quit');
    })



    ipcMain.on('test', (event, arg) => {
        console.log(event, 'event ipcMain in electron');
        console.log(arg, 'arg ipcMain in electrom');
        win.webContents.send('testRes', 'test ipcMain from electron')
    });



} catch (e) {
    // Catch Error
    // throw e;
}
