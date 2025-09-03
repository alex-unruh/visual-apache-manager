<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="article" class="q-mr-sm" style="color: var(--accent-orange)" />
              Logs Apache/PHP
            </div>
            <div class="text-subtitle1 text-secondary">
              Visualizar logs de acesso, erro e PHP
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="refresh"
              label="Atualizar"
              @click="loadLogs"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="row q-gutter-md items-center">
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-select
                  v-model="selectedLogType"
                  :options="logTypes"
                  label="Tipo de Log"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                  @update:model-value="loadLogs"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-select
                  v-model="selectedSite"
                  :options="siteOptions"
                  label="Site"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                  @update:model-value="loadLogs"
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-select
                  v-model="selectedLevel"
                  :options="logLevels"
                  label="Nível"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-input
                  v-model="linesCount"
                  label="Linhas"
                  type="number"
                  filled
                  dense
                  min="10"
                  max="1000"
                  dark
                />
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-input
                  v-model="searchFilter"
                  label="Filtrar"
                  filled
                  dense
                  clearable
                  dark
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-2 col-sm-6 col-xs-12">
                <q-checkbox
                  v-model="autoRefresh"
                  label="Auto-refresh"
                  color="primary"
                  @update:model-value="toggleAutoRefresh"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Log Statistics -->
      <div class="col-12">
        <div class="row q-gutter-md">
          <div class="col-lg-3 col-md-6 col-sm-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-positive">{{ logStats.total }}</div>
                    <div class="text-caption text-secondary">Total de Entradas</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="list_alt" size="md" color="positive" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-lg-3 col-md-6 col-sm-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-negative">{{ logStats.errors }}</div>
                    <div class="text-caption text-secondary">Erros</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="error" size="md" color="negative" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-lg-3 col-md-6 col-sm-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-warning">{{ logStats.warnings }}</div>
                    <div class="text-caption text-secondary">Avisos</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="warning" size="md" color="warning" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <div class="col-lg-3 col-md-6 col-sm-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-info">{{ logStats.info }}</div>
                    <div class="text-caption text-secondary">Informações</div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="info" size="md" color="info" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Log Content -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6 text-primary">
                {{ logTitle }}
              </div>
              <div>
                <q-btn
                  color="primary"
                  icon="download"
                  label="Baixar"
                  size="sm"
                  flat
                  @click="downloadLog"
                />
                <q-btn
                  color="negative"
                  icon="clear_all"
                  label="Limpar"
                  size="sm"
                  flat
                  @click="clearLog"
                />
              </div>
            </div>
            
            <div class="log-container">
              <div 
                v-for="(line, index) in filteredLogs" 
                :key="index"
                :class="getLogLineClass(line)"
                class="log-line"
              >
                <div class="row items-start q-gutter-sm">
                  <div class="col-auto">
                    <q-chip
                      :color="getLogLevelColor(line.level)"
                      text-color="white"
                      size="xs"
                      dense
                    >
                      {{ line.level }}
                    </q-chip>
                  </div>
                  <div class="col-auto text-caption text-secondary">
                    {{ line.timestamp }}
                  </div>
                  <div class="col text-body2">
                    <span v-if="line.ip" class="text-info">[{{ line.ip }}]</span>
                    <span v-if="line.method" class="text-warning">{{ line.method }}</span>
                    <span v-if="line.url" class="text-primary">{{ line.url }}</span>
                    <span v-if="line.status" :class="getStatusClass(line.status)">{{ line.status }}</span>
                    <div class="log-message">{{ line.message }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="filteredLogs.length === 0" class="text-center q-pa-lg text-secondary">
                <q-icon name="inbox" size="lg" />
                <div class="q-mt-sm">Nenhum log encontrado</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const autoRefresh = ref(false)
const refreshInterval = ref(null)
const selectedLogType = ref('error')
const selectedSite = ref('all')
const selectedLevel = ref('all')
const linesCount = ref(100)
const searchFilter = ref('')

const logs = ref([])

const logTypes = [
  { label: 'Error Log', value: 'error' },
  { label: 'Access Log', value: 'access' },
  { label: 'PHP Error Log', value: 'php' }
]

const siteOptionsData = ref([
  { label: 'Todos os Sites', value: 'all' }
])

const siteOptions = computed(() => siteOptionsData.value)

const logLevels = [
  { label: 'Todos', value: 'all' },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warning' },
  { label: 'Notice', value: 'notice' },
  { label: 'Info', value: 'info' }
]

const logStats = computed(() => {
  const stats = {
    total: logs.value.length,
    errors: 0,
    warnings: 0,
    info: 0
  }
  
  logs.value.forEach(log => {
    switch (log.level.toLowerCase()) {
      case 'error':
      case 'fatal':
        stats.errors++
        break
      case 'warning':
      case 'warn':
        stats.warnings++
        break
      case 'info':
      case 'notice':
        stats.info++
        break
    }
  })
  
  return stats
})

const filteredLogs = computed(() => {
  let filtered = logs.value
  
  if (selectedLevel.value !== 'all') {
    filtered = filtered.filter(log => 
      log.level.toLowerCase() === selectedLevel.value.toLowerCase()
    )
  }
  
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(search) ||
      (log.ip && log.ip.includes(search)) ||
      (log.url && log.url.toLowerCase().includes(search))
    )
  }
  
  return filtered.slice(0, linesCount.value)
})

const logTitle = computed(() => {
  const typeLabel = logTypes.find(t => t.value === selectedLogType.value)?.label || 'Log'
  const siteLabel = siteOptionsData.value.find(s => s.value === selectedSite.value)?.label || 'Todos'
  return `${typeLabel} - ${siteLabel}`
})

function getLogLineClass(line) {
  const level = line.level.toLowerCase()
  return {
    'log-error': level === 'error' || level === 'fatal',
    'log-warning': level === 'warning' || level === 'warn',
    'log-info': level === 'info' || level === 'notice'
  }
}

function getLogLevelColor(level) {
  switch (level.toLowerCase()) {
    case 'error':
    case 'fatal':
      return 'negative'
    case 'warning':
    case 'warn':
      return 'warning'
    case 'info':
    case 'notice':
      return 'info'
    default:
      return 'grey'
  }
}

function getStatusClass(status) {
  const code = parseInt(status)
  if (code >= 200 && code < 300) return 'text-positive'
  if (code >= 300 && code < 400) return 'text-info'
  if (code >= 400 && code < 500) return 'text-warning'
  if (code >= 500) return 'text-negative'
  return 'text-secondary'
}

function parseLogLine(line, logType) {
  if (!line.trim()) return null
  
  let parsed = {
    timestamp: '',
    level: 'Info',
    message: line,
    ip: '',
    method: '',
    url: '',
    status: ''
  }
  
  if (logType === 'access') {
    // Parse Apache access log format: IP - - [timestamp] "METHOD URL HTTP/1.1" status size
    const accessMatch = line.match(/^([\d.]+)\s+-\s+-\s+\[([^\]]+)\]\s+"(\w+)\s+([^\s]+)\s+[^"]*"\s+(\d+)\s+(\d+|-)/)
    if (accessMatch) {
      parsed.ip = accessMatch[1]
      parsed.timestamp = accessMatch[2]
      parsed.method = accessMatch[3]
      parsed.url = accessMatch[4]
      parsed.status = accessMatch[5]
      parsed.level = 'Info'
      parsed.message = line
    }
  } else if (logType === 'error') {
    // Parse Apache error log format: [timestamp] [level] [pid] message
    const errorMatch = line.match(/^\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+(.+)$/)
    if (errorMatch) {
      parsed.timestamp = errorMatch[1]
      parsed.level = errorMatch[2].charAt(0).toUpperCase() + errorMatch[2].slice(1)
      parsed.message = errorMatch[4]
      
      // Extract IP if present in message
      const ipMatch = parsed.message.match(/client\s+([\d.]+)/)
      if (ipMatch) {
        parsed.ip = ipMatch[1]
      }
    }
  } else if (logType === 'php') {
    // Parse PHP error log format: [timestamp] PHP Level: message in file:line
    const phpMatch = line.match(/^\[([^\]]+)\]\s+PHP\s+(\w+):\s+(.+)$/)
    if (phpMatch) {
      parsed.timestamp = phpMatch[1]
      parsed.level = phpMatch[2]
      parsed.message = phpMatch[3]
    }
  }
  
  return parsed
}

async function loadLogs() {
  const globalConnection = window.currentActiveConnection
  
  if (!globalConnection) {
    logs.value = []
    return
  }
  
  // Criar uma cópia limpa do objeto de conexão para evitar problemas de clonagem
  const currentConnection = {
    id: globalConnection.id,
    name: globalConnection.name,
    host: globalConnection.host,
    port: globalConnection.port,
    username: globalConnection.username,
    password: globalConnection.password
  }
  
  loading.value = true
  try {
    let logFile = ''
    
    // Determinar qual arquivo de log carregar
    switch (selectedLogType.value) {
      case 'error':
        if (selectedSite.value === 'all') {
          logFile = '/var/log/apache2/error.log'
        } else {
          logFile = `/var/log/apache2/${selectedSite.value}_error.log`
        }
        break
      case 'access':
        if (selectedSite.value === 'all') {
          logFile = '/var/log/apache2/access.log'
        } else {
          logFile = `/var/log/apache2/${selectedSite.value}_access.log`
        }
        break
      case 'php':
        logFile = '/var/log/php_errors.log'
        break
      default:
        logFile = '/var/log/apache2/error.log'
    }
    
    // Verificar se o arquivo existe
    const fileExistsResult = await window.electronAPI.executeCommand(
      currentConnection,
      `test -f "${logFile}" && echo "exists" || echo "not_found"`
    )
    
    if (!fileExistsResult.success || !fileExistsResult.output.includes('exists')) {
      logs.value = []
      $q.notify({
        type: 'warning',
        message: `Arquivo de log não encontrado: ${logFile}`
      })
      return
    }
    
    // Carregar as últimas linhas do log
    const logResult = await window.electronAPI.executeCommand(
      currentConnection,
      `tail -n ${linesCount.value} "${logFile}" 2>/dev/null || echo ""`
    )
    
    if (!logResult.success) {
      logs.value = []
      return
    }
    
    // Parse das linhas do log
    const logLines = logResult.output.trim().split('\n').filter(line => line.trim())
    const parsedLogs = []
    
    for (const line of logLines) {
      const parsed = parseLogLine(line, selectedLogType.value)
      if (parsed) {
        parsedLogs.push(parsed)
      }
    }
    
    // Reverter ordem para mostrar logs mais recentes primeiro
    logs.value = parsedLogs.reverse()
    
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar logs'
    })
  } finally {
    loading.value = false
  }
}

const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      loadLogs()
    }, 5000) // Atualizar a cada 5 segundos
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
}

const downloadLog = () => {
  const logContent = filteredLogs.value
    .map(log => `[${log.timestamp}] ${log.level}: ${log.message}`)
    .join('\n')
  
  const blob = new Blob([logContent], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedLogType.value}_log_${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
  
  $q.notify({
    type: 'positive',
    message: 'Log baixado com sucesso!'
  })
}

const clearLog = () => {
  $q.dialog({
    title: 'Confirmar limpeza',
    message: `Tem certeza que deseja limpar o ${logTitle.value}?`,
    cancel: true,
    persistent: true,
    class: 'bg-secondary text-primary'
  }).onOk(async () => {
    const globalConnection = window.currentActiveConnection
    
    if (!globalConnection) {
      $q.notify({
        type: 'negative',
        message: 'Nenhuma conexão ativa'
      })
      return
    }
    
    const currentConnection = {
      id: globalConnection.id,
      name: globalConnection.name,
      host: globalConnection.host,
      port: globalConnection.port,
      username: globalConnection.username,
      password: globalConnection.password
    }
    
    try {
      let logFile = ''
      
      // Determinar qual arquivo de log limpar
      switch (selectedLogType.value) {
        case 'error':
          if (selectedSite.value === 'all') {
            logFile = '/var/log/apache2/error.log'
          } else {
            logFile = `/var/log/apache2/${selectedSite.value}_error.log`
          }
          break
        case 'access':
          if (selectedSite.value === 'all') {
            logFile = '/var/log/apache2/access.log'
          } else {
            logFile = `/var/log/apache2/${selectedSite.value}_access.log`
          }
          break
        case 'php':
          logFile = '/var/log/php_errors.log'
          break
        default:
          logFile = '/var/log/apache2/error.log'
      }
      
      // Limpar o arquivo de log
      const clearResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo truncate -s 0 "${logFile}"`
      )
      
      if (!clearResult.success) {
        throw new Error(clearResult.error || 'Falha ao limpar log')
      }
      
      logs.value = []
      
      $q.notify({
        type: 'positive',
        message: 'Log limpo com sucesso!'
      })
    } catch (error) {
      console.error('Erro ao limpar log:', error)
      $q.notify({
        type: 'negative',
        message: `Erro ao limpar log: ${error.message}`
      })
    }
  })
}

async function loadAvailableSites() {
  const globalConnection = window.currentActiveConnection
  
  if (!globalConnection) {
    siteOptionsData.value = [{ label: 'Todos os Sites', value: 'all' }]
    return
  }
  
  // Criar uma cópia limpa do objeto de conexão para evitar problemas de clonagem
  const currentConnection = {
    id: globalConnection.id,
    name: globalConnection.name,
    host: globalConnection.host,
    port: globalConnection.port,
    username: globalConnection.username,
    password: globalConnection.password
  }
  
  try {
    // Buscar sites disponíveis no Apache
    const sitesResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-available/*.conf 2>/dev/null | xargs -I {} basename {} .conf | head -10 || echo ""'
    )
    
    const sites = [{ label: 'Todos os Sites', value: 'all' }]
    
    if (sitesResult.success) {
      const siteNames = sitesResult.output.trim().split('\n').filter(name => name.trim())
      
      for (const siteName of siteNames) {
        if (siteName && siteName !== '000-default') {
          sites.push({
            label: siteName,
            value: siteName
          })
        }
      }
    }
    
    siteOptionsData.value = sites
    
  } catch (error) {
    console.error('Erro ao carregar sites:', error)
  }
}

// Listener para mudanças de conexão
let connectionChangeHandler = null

onMounted(() => {
  loadAvailableSites()
  loadLogs()
  
  // Adicionar listener para mudanças de conexão
  connectionChangeHandler = () => {
    loadAvailableSites()
    loadLogs()
  }
  
  window.addEventListener('connection-changed', connectionChangeHandler)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  if (connectionChangeHandler) {
    window.removeEventListener('connection-changed', connectionChangeHandler)
  }
})
</script>

<style scoped>
.log-container {
  max-height: 600px;
  overflow-y: auto;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px;
}

.log-line {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-line:last-child {
  border-bottom: none;
}

.log-error {
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid var(--error-color);
}

.log-warning {
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid var(--warning-color);
}

.log-info {
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid var(--info-color);
}

.log-message {
  margin-top: 4px;
  word-break: break-all;
}
</style>