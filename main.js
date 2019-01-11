const electron=require('electron')
const url=require('url')
const path=require('path')

const {app,BrowserWindow}=electron

let mainWindow

app.on('ready',function(){
    electron.Menu.setApplicationMenu(null)
    mainWindow=new BrowserWindow({
        // 理论上是1100，但是发现边距没有对齐就微调了一下
        width:1055,
        height:550,
    })
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname,'index.html'),
        protocol:'file:',
        slashes:true
    }))
    mainWindow.on('closed',function(){
        app.quit()
    })
})