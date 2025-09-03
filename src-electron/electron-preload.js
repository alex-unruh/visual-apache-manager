import { contextBridge, ipcRenderer } from 'electron'

// Expor APIs de forma segura para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getConnections: () => ipcRenderer.invoke('db-get-connections'),
  saveConnection: (connection) => ipcRenderer.invoke('db-save-connection', connection),
  deleteConnection: (id) => ipcRenderer.invoke('db-delete-connection', id),
  
  // SSH operations
  testConnection: (connectionData) => ipcRenderer.invoke('ssh-test-connection', connectionData),
  executeCommand: (connectionData, command) => ipcRenderer.invoke('ssh-execute-command', connectionData, command),
  
  // Apache operations
  getApacheSites: (connectionId) => ipcRenderer.invoke('ssh-get-apache-sites', connectionId),
  enableSite: (connectionData, siteName) => ipcRenderer.invoke('ssh-enable-site', connectionData, siteName),
  disableSite: (connectionData, siteName) => ipcRenderer.invoke('ssh-disable-site', connectionData, siteName),
  
  // PHP operations
  getPhpVersions: (connectionData) => ipcRenderer.invoke('ssh-get-php-versions', connectionData),
  installPhpVersion: (connectionData, version) => ipcRenderer.invoke('ssh-install-php-version', connectionData, version),
  
  // Apache modules
  getApacheModules: (connectionData) => ipcRenderer.invoke('ssh-get-apache-modules', connectionData),
  enableModule: (connectionData, moduleName) => ipcRenderer.invoke('ssh-enable-module', connectionData, moduleName),
  disableModule: (connectionData, moduleName) => ipcRenderer.invoke('ssh-disable-module', connectionData, moduleName),
  
  // Logs
  getApacheLogs: (connectionData, logType, lines) => ipcRenderer.invoke('ssh-get-apache-logs', connectionData, logType, lines),
  getPhpLogs: (connectionData, lines) => ipcRenderer.invoke('ssh-get-php-logs', connectionData, lines)
})