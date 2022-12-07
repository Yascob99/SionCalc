const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https'); // or 'https' for https:// URLs

function downloadData(version) {
    https.get('https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/14.json', (res) => {
        var str = ''
        res.on('data', (d) => {
            str += d
        }).on('error', (e) => {
            console.error(e);
        }).on('end', function () {
            var data = JSON.parse(str);
            https.get('https://ddragon.leagueoflegends.com/cdn/' + version + "/data/en_US/champion.json", (res) => {
                var str3 = ''
                res.on('data', (d) => {
                    str3 += d
                }).on('error', (e) => {
                    console.error(e);
                }).on('end', function () {
                    var cdata = JSON.parse(str3);
                    data.stats = cdata.data.Sion.stats;
                    data.version = version;
                    const file = fs.writeFileSync(path.join(__dirname, "src/assets/Sion.json"), JSON.stringify(data));
                    createWindow()
                })
            });
        });
    });    
}

function initData () {
    https.get('https://ddragon.leagueoflegends.com/api/versions.json', (res) => {
        var versions = ''
        res.on('data', (d) => {
            versions += d
        }).on('error', (e) => {
            console.error(e);
        }).on('end', function () {
            versions = JSON.parse(versions)
            try {
                if (fs.existsSync(path)) {
                    var currentVer = JSON.parse(fs.readFileSync(path.join(__dirname, "src/assets/Sion.json"), "utf-8")).version;
                    if (currentVer == versions[0]) {
                        createWindow()
                    }
                    else{
                        downloadData(versions[0])
                    }
                }
                else {
                    downloadData(versions[0])
                }
                } catch(err) {
                    console.error(err)
                }
        });
   });
}

function createWindow () {
   const win = new BrowserWindow({
        width: 1125,
        height: 663,
        icon: path.join(__dirname, "assets/icons/Dealwithit.ico"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile(path.join(__dirname, 'src/index.html'));
}

app.whenReady().then(() => {
  initData()

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