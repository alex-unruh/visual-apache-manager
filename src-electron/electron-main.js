import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Store from 'electron-store'
import { Client } from 'ssh2'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuração do electron-store
const store = new Store()

// Configuração da janela principal
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'preload', 'electron-preload.cjs')
    },
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a', // Tema escuro
    show: false
  })

  // Remover o menu padrão do Electron
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Funções auxiliares para gerenciar dados
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Handlers IPC para comunicação com o renderer
ipcMain.handle('db-get-connections', () => {
  const connections = store.get('connections', [])
  return connections.sort((a, b) => a.name.localeCompare(b.name))
})

ipcMain.handle('db-save-connection', (event, connection) => {
  const connections = store.get('connections', [])
  
  if (connection.id) {
    // Atualizar conexão existente
    const index = connections.findIndex(conn => conn.id === connection.id)
    if (index !== -1) {
      connections[index] = {
        ...connection,
        updated_at: new Date().toISOString()
      }
    }
  } else {
    // Criar nova conexão
    const newConnection = {
      ...connection,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    connections.push(newConnection)
  }
  
  store.set('connections', connections)
  return { success: true }
})

ipcMain.handle('db-delete-connection', (event, id) => {
  const connections = store.get('connections', [])
  const filteredConnections = connections.filter(conn => conn.id !== id)
  store.set('connections', filteredConnections)
  return { success: true }
})

// Handler para testar conexão SSH
ipcMain.handle('ssh-test-connection', (event, connectionData) => {
  return new Promise((resolve) => {
    console.log('Testando conexão SSH:', {
      host: connectionData.host,
      port: connectionData.port || 22,
      username: connectionData.username,
      hasPassword: !!connectionData.password,
      hasPrivateKey: !!connectionData.private_key
    })
    
    const conn = new Client()
    
    conn.on('ready', () => {
      console.log('Conexão SSH estabelecida com sucesso')
      conn.end()
      resolve({ success: true, message: 'Conexão estabelecida com sucesso!' })
    })
    
    conn.on('error', (err) => {
      console.error('Erro na conexão SSH:', err)
      resolve({ success: false, message: `Erro na conexão: ${err.message}` })
    })
    
    // Verificar se as propriedades obrigatórias existem
    if (!connectionData.host || !connectionData.username) {
      resolve({ success: false, error: 'Host e username são obrigatórios' })
      return
    }
    
    const config = {
      host: connectionData.host,
      port: connectionData.port || 22,
      username: connectionData.username
    }
    
    if (connectionData.password) {
      config.password = connectionData.password
    }
    
    if (connectionData.private_key) {
      config.privateKey = connectionData.private_key
    }
    
    console.log('Tentando conectar com configuração:', {
      host: config.host,
      port: config.port,
      username: config.username,
      hasPassword: !!config.password,
      hasPrivateKey: !!config.privateKey
    })
    
    conn.connect(config)
  })
})

// Handler para executar comandos SSH
ipcMain.handle('ssh-execute-command', (event, connectionData, command) => {
  return new Promise((resolve) => {
    // Verificar se connectionData existe
    if (!connectionData) {
      resolve({ success: false, error: 'Dados de conexão não fornecidos' })
      return
    }
    
    const conn = new Client()
    
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end()
          resolve({ success: false, error: err.message })
          return
        }
        
        let output = ''
        let errorOutput = ''
        
        stream.on('close', (code) => {
          conn.end()
          resolve({ 
            success: code === 0, 
            output: output.trim(), 
            error: errorOutput.trim(),
            exitCode: code 
          })
        })
        
        stream.on('data', (data) => {
          output += data.toString()
        })
        
        stream.stderr.on('data', (data) => {
          errorOutput += data.toString()
        })
      })
    })
    
    conn.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
    
    const config = {
      host: connectionData.host,
      port: connectionData.port || 22,
      username: connectionData.username
    }
    
    if (connectionData.password) {
      config.password = connectionData.password
    }
    
    if (connectionData.private_key) {
      config.privateKey = connectionData.private_key
    }
    
    conn.connect(config)
  })
})

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

app.on('before-quit', () => {
  // Cleanup se necessário
})