<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 text-primary q-mb-md">
          <q-icon name="dashboard" class="q-mr-sm" style="color: var(--accent-orange)" />
          Dashboard
        </div>
        <div class="text-subtitle1 text-secondary">
          Visão geral do servidor Apache
        </div>
      </div>

      <!-- Status Cards -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-primary">Status do Apache</div>
                    <div class="text-subtitle2" :class="apacheStatus === 'running' ? 'status-online' : 'status-offline'">
                      {{ apacheStatus === 'running' ? 'Executando' : 'Parado' }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon
                      name="web"
                      size="xl"
                      :color="apacheStatus === 'running' ? 'positive' : 'negative'"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-primary">Sites Ativos</div>
                    <div class="text-subtitle2 text-secondary">
                      {{ activeSites }} de {{ totalSites }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="dns" size="xl" color="accent" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-primary">Versão PHP</div>
                    <div class="text-subtitle2 text-secondary">
                      {{ currentPhpVersion || 'N/A' }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon name="code" size="xl" color="info" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-card class="bg-secondary">
              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h6 text-primary">Conexão</div>
                    <div class="text-subtitle2" :class="connectionStatus === 'connected' ? 'status-online' : 'status-offline'">
                      {{ connectionStatus === 'connected' ? 'Conectado' : 'Desconectado' }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-icon
                      name="cloud"
                      size="xl"
                      :color="connectionStatus === 'connected' ? 'positive' : 'negative'"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="text-h6 text-primary q-mb-md">
              <q-icon name="flash_on" class="q-mr-sm" />
              Ações Rápidas
            </div>
            <div class="row q-gutter-md">
              <q-btn
                color="primary"
                icon="web"
                label="Gerenciar Sites"
                @click="$router.push('/sites')"
              />
              <q-btn
                color="secondary"
                icon="extension"
                label="Módulos Apache"
                @click="$router.push('/modules')"
              />
              <q-btn
                color="accent"
                icon="code"
                label="Versões PHP"
                @click="$router.push('/php-versions')"
              />
              <q-btn
                color="info"
                icon="description"
                label="Ver Logs"
                @click="$router.push('/logs')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-md-8 col-xs-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="text-h6 text-primary q-mb-md">
              <q-icon name="history" class="q-mr-sm" />
              Atividade Recente
            </div>
            <q-list>
              <q-item v-for="activity in recentActivity" :key="activity.id">
                <q-item-section avatar>
                  <q-icon :name="activity.icon" :color="activity.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ activity.title }}</q-item-label>
                  <q-item-label caption class="text-muted">{{ activity.time }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="recentActivity.length === 0">
                <q-item-section>
                  <q-item-label class="text-muted">Nenhuma atividade recente</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- System Info -->
      <div class="col-md-4 col-xs-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="text-h6 text-primary q-mb-md">
              <q-icon name="info" class="q-mr-sm" />
              Informações do Sistema
            </div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label>SO</q-item-label>
                  <q-item-label caption>{{ systemInfo.os || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>Versão Apache</q-item-label>
                  <q-item-label caption>{{ systemInfo.apacheVersion || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>Uptime</q-item-label>
                  <q-item-label caption>{{ systemInfo.uptime || 'N/A' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const apacheStatus = ref('unknown')
const activeSites = ref(0)
const totalSites = ref(0)
const currentPhpVersion = ref('')
const connectionStatus = ref('disconnected')

const recentActivity = ref([])

const systemInfo = ref({
  os: '',
  apacheVersion: '',
  uptime: ''
})

async function loadDashboardData() {
  // Obter a conexão ativa do estado global
  const globalConnection = window.currentActiveConnection

  if (!globalConnection) {
    // Sem conexão ativa - mostrar dados padrão
    apacheStatus.value = 'unknown'
    activeSites.value = 0
    totalSites.value = 0
    currentPhpVersion.value = 'N/A'
    connectionStatus.value = 'disconnected'

    systemInfo.value = {
      os: 'Não conectado',
      apacheVersion: 'N/A',
      uptime: 'N/A'
    }

    recentActivity.value = []
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
    connectionStatus.value = 'connected'

    // Buscar status do Apache
    const apacheResult = await window.electronAPI.executeCommand(
      currentConnection,
      'systemctl is-active apache2 2>/dev/null || service apache2 status 2>/dev/null || echo "unknown"'
    )

    if (apacheResult.success) {
      apacheStatus.value = apacheResult.output.includes('active') || apacheResult.output.includes('running') ? 'running' : 'stopped'
    } else {
      apacheStatus.value = 'unknown'
    }

    // Buscar versão do PHP
    const phpResult = await window.electronAPI.executeCommand(
      currentConnection,
      'php -v 2>/dev/null | head -n1 | cut -d" " -f2 | cut -d"-" -f1 || echo "N/A"'
    )

    if (phpResult.success && phpResult.output.trim() !== 'N/A') {
      currentPhpVersion.value = phpResult.output.trim()
    } else {
      currentPhpVersion.value = 'N/A'
    }

    // Buscar sites disponíveis
    const sitesResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-available/ 2>/dev/null | wc -l || echo "0"'
    )

    if (sitesResult.success) {
      totalSites.value = parseInt(sitesResult.output.trim()) || 0
    }

    // Buscar sites habilitados
    const enabledSitesResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-enabled/ 2>/dev/null | wc -l || echo "0"'
    )

    if (enabledSitesResult.success) {
      activeSites.value = parseInt(enabledSitesResult.output.trim()) || 0
    }

    // Buscar informações do sistema
    const osResult = await window.electronAPI.executeCommand(
      currentConnection,
      'lsb_release -d 2>/dev/null | cut -f2 || cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d"=" -f2 | tr -d """ || uname -s'
    )

    const apacheVersionResult = await window.electronAPI.executeCommand(
      currentConnection,
      'apache2 -v 2>/dev/null | head -n1 | cut -d"/" -f2 | cut -d" " -f1 || httpd -v 2>/dev/null | head -n1 | cut -d"/" -f2 | cut -d" " -f1 || echo "N/A"'
    )

    const uptimeResult = await window.electronAPI.executeCommand(
      currentConnection,
      'uptime -p 2>/dev/null || uptime | cut -d"," -f1 | cut -d" " -f3-'
    )

    systemInfo.value = {
      os: osResult.success ? osResult.output.trim() : 'Desconhecido',
      apacheVersion: apacheVersionResult.success ? apacheVersionResult.output.trim() : 'N/A',
      uptime: uptimeResult.success ? uptimeResult.output.trim() : 'N/A'
    }

    // Atividade recente - por enquanto vazia, pode ser implementada com logs
    recentActivity.value = []

  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)

    // Em caso de erro, mostrar dados padrão
    apacheStatus.value = 'unknown'
    activeSites.value = 0
    totalSites.value = 0
    currentPhpVersion.value = 'N/A'
    connectionStatus.value = 'disconnected'

    systemInfo.value = {
      os: 'Erro ao conectar',
      apacheVersion: 'N/A',
      uptime: 'N/A'
    }

    recentActivity.value = []
  }
}

// Watcher para detectar mudanças na conexão global
let connectionChangeHandler = null

onMounted(() => {
  loadDashboardData()

  // Adicionar listener para mudanças de conexão
  connectionChangeHandler = () => {
    loadDashboardData()
  }

  window.addEventListener('connection-changed', connectionChangeHandler)
})

// Cleanup do listener quando o componente for desmontado
onUnmounted(() => {
  if (connectionChangeHandler) {
    window.removeEventListener('connection-changed', connectionChangeHandler)
  }
})
</script>
