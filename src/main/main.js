const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')

function createWindow () {
    const win = new BrowserWindow({
        width: 600,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, '../app/app.js')
        }
    })

    win.setMenuBarVisibility(false)

    win.loadFile(path.join(__dirname, '../build/index.html'))
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.handle('perform-action', (event, ...args) => {
    // ... do actions on behalf of the Renderer
})