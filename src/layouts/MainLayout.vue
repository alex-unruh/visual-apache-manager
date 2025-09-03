<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-secondary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="text-primary"
        />

        <q-toolbar-title class="text-primary">
          <div class="flex items-center">
            <q-icon name="dns" size="md" class="q-mr-sm" style="color: var(--accent-orange)" />
            Visual Apache Manager
          </div>
        </q-toolbar-title>

        <div class="flex items-center q-gutter-md">
          <q-chip
            v-if="currentConnection"
            :color="connectionStatus === 'connected' ? 'positive' : 'negative'"
            text-color="white"
            icon="cloud"
            size="sm"
          >
            {{ currentConnection.name }}
          </q-chip>
          <q-btn
            v-if="currentConnection && connectionStatus === 'connected'"
            flat
            dense
            round
            icon="power_settings_new"
            class="text-negative"
            @click="disconnectFromServer"
            >
            <q-tooltip>Desconectar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="settings"
            class="text-secondary"
            @click="openSettings"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      class="bg-secondary"
    >
      <div class="q-pa-md">
        <q-select
          v-model="selectedConnection"
          :options="connections"
          option-label="name"
          label="Servidor"
          filled
          dense
          dark
          color="primary"
          label-color="white"
          class="q-mb-md"
          clearable
          @update:model-value="onConnectionChange"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Nenhuma conexão configurada
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        
        <q-btn
          color="primary"
          icon="add"
          label="Nova Conexão"
          class="full-width q-mb-md"
          @click="openConnectionDialog"
        />
        
        <q-btn
          v-if="selectedConnection"
          color="negative"
          icon="delete"
          label="Excluir Conexão"
          outline
          class="full-width q-mb-md"
          @click="confirmDeleteConnection"
        />
      </div>

      <q-separator />

      <q-list class="q-pt-md">
        <q-item-label header class="text-secondary">
          GERENCIAMENTO APACHE
        </q-item-label>

        <q-item
          v-for="item in availableMenuItems"
          :key="item.title"
          clickable
          v-ripple
          :to="item.route"
          exact-active-class="q-item--active"
          class="q-my-xs q-mx-sm rounded-borders"
          :class="{ 'text-grey-6': !hasActiveConnection && item.route !== '/' }"
          :disable="!hasActiveConnection && item.route !== '/'"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
            <q-item-label caption class="text-muted">{{ item.caption }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="!hasActiveConnection && item.route !== '/'">
            <q-icon name="lock" size="xs" class="text-grey-6" />
          </q-item-section>
        </q-item>
        
        <q-separator v-if="!hasActiveConnection" class="q-my-md" />
        
        <q-item v-if="!hasActiveConnection" class="q-mx-sm">
          <q-item-section>
            <q-item-label class="text-caption text-grey-6 text-center">
              Conecte-se a um servidor para acessar todas as funcionalidades
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Dialog para nova conexão -->
    <q-dialog v-model="showConnectionDialog" persistent>
      <q-card style="min-width: 500px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">Nova Conexão SSH</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveConnection" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="newConnection.name"
                  label="Nome da Conexão"
                  filled
                  dense
                  :rules="[val => !!val || 'Nome é obrigatório']"
                  dark
                />
              </div>
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="newConnection.host"
                  label="Host/IP"
                  filled
                  dense
                  :rules="[val => !!val || 'Host é obrigatório']"
                  dark
                />
              </div>
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-md-4 col-sm-12">
                <q-input
                  v-model.number="newConnection.port"
                  label="Porta"
                  type="number"
                  filled
                  dense
                  :rules="[val => !!val || 'Porta é obrigatória']"
                  dark
                />
              </div>
              <div class="col-md-8 col-sm-12">
                <q-input
                  v-model="newConnection.username"
                  label="Usuário"
                  filled
                  dense
                  :rules="[val => !!val || 'Usuário é obrigatório']"
                  dark
                />
              </div>
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="newConnection.password"
                  label="Senha"
                  type="password"
                  filled
                  dense
                  dark
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeConnectionDialog" />
          <q-btn flat label="Testar" color="secondary" @click="testConnection" :loading="testing" />
          <q-btn color="primary" label="Salvar" @click="saveConnection" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const leftDrawerOpen = ref(false)
const showConnectionDialog = ref(false)
const connections = ref([])
const selectedConnection = ref(null)
const testing = ref(false)
const saving = ref(false)

const newConnection = ref({
  name: '',
  host: '',
  port: 22,
  username: '',
  password: ''
})

const menuItems = [
  {
    title: 'Dashboard',
    caption: 'Visão geral do servidor',
    icon: 'dashboard',
    route: '/'
  },
  {
    title: 'Sites Apache',
    caption: 'Gerenciar sites virtuais',
    icon: 'web',
    route: '/sites'
  },
  {
    title: 'Módulos Apache',
    caption: 'Habilitar/desabilitar módulos',
    icon: 'extension',
    route: '/modules'
  },
  {
    title: 'Versões PHP',
    caption: 'Gerenciar versões do PHP',
    icon: 'code',
    route: '/php-versions'
  },
  {
    title: 'Extensões PHP',
    caption: 'Configurar extensões PHP',
    icon: 'settings_applications',
    route: '/php-extensions'
  },
  {
    title: 'Virtual Hosts',
    caption: 'Criar e editar virtual hosts',
    icon: 'dns',
    route: '/virtual-hosts'
  },
  {
    title: 'Logs',
    caption: 'Visualizar logs do sistema',
    icon: 'description',
    route: '/logs'
  }
]

const currentConnection = computed(() => {
  return selectedConnection.value
})

const connectionStatus = ref('disconnected')

const hasActiveConnection = computed(() => {
  return connectionStatus.value === 'connected' && selectedConnection.value !== null
})

const availableMenuItems = computed(() => {
  if (hasActiveConnection.value) {
    return menuItems
  }
  // Quando não há conexão ativa, mostrar apenas o dashboard
  return menuItems.filter(item => item.route === '/')
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function openConnectionDialog() {
  newConnection.value = {
    name: '',
    host: '',
    port: 22,
    username: '',
    password: ''
  }
  showConnectionDialog.value = true
}

function closeConnectionDialog() {
  showConnectionDialog.value = false
}

async function loadConnections() {
  try {
    if (window.electronAPI) {
      connections.value = await window.electronAPI.getConnections()
    }
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
  }
}

async function testConnection() {
  testing.value = true
  try {
    console.log('Iniciando teste de conexão...')
    console.log('Dados da conexão:', newConnection.value)
    
    if (window.electronAPI) {
      console.log('electronAPI disponível, chamando testConnection...')
      
      // Criar uma cópia limpa do objeto para evitar problemas de serialização
      const connectionData = {
        name: newConnection.value.name,
        host: newConnection.value.host,
        port: newConnection.value.port,
        username: newConnection.value.username,
        password: newConnection.value.password,
        private_key: newConnection.value.private_key || null
      }
      
      console.log('Dados limpos para envio:', connectionData)
      const result = await window.electronAPI.testConnection(connectionData)
      console.log('Resultado recebido:', result)
      
      if (result.success) {
        $q.notify({
          type: 'positive',
          message: 'Conexão testada com sucesso!'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: `Erro na conexão: ${result.message}`
        })
      }
    } else {
      console.error('electronAPI não está disponível')
      $q.notify({
        type: 'negative',
        message: 'API do Electron não disponível'
      })
    }
  } catch (error) {
    console.error('Erro capturado no frontend:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao testar conexão: ${error.message}`
    })
  } finally {
    testing.value = false
  }
}

async function saveConnection() {
  saving.value = true
  try {
    if (window.electronAPI) {
      // Criar uma cópia limpa do objeto para evitar problemas de serialização
      const connectionData = {
        id: newConnection.value.id || null,
        name: newConnection.value.name,
        host: newConnection.value.host,
        port: newConnection.value.port,
        username: newConnection.value.username,
        password: newConnection.value.password,
        private_key: newConnection.value.private_key || null
      }
      
      await window.electronAPI.saveConnection(connectionData)
      await loadConnections()
      closeConnectionDialog()
      $q.notify({
        type: 'positive',
        message: 'Conexão salva com sucesso!'
      })
    }
  } catch (error) {
    console.error('Erro ao salvar conexão:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar conexão: ${error.message}`
    })
  } finally {
    saving.value = false
  }
}

async function onConnectionChange(connection) {
  selectedConnection.value = connection
  if (connection) {
    await connectToServer(connection)
  } else {
    connectionStatus.value = 'disconnected'
    window.currentActiveConnection = null
  }
}

async function connectToServer(connection) {
  if (!connection) return
  
  connectionStatus.value = 'connecting'
  currentConnection.value = connection
  
  try {
    console.log('Conectando ao servidor:', connection.name)
    
    // Testar a conexão primeiro
    const connectionData = {
      name: connection.name,
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.password,
      private_key: connection.private_key || null
    }
    
    const result = await window.electronAPI.testConnection(connectionData)
    
    if (result.success) {
      connectionStatus.value = 'connected'
      
      // Definir conexão ativa globalmente
      window.currentActiveConnection = connection
      
      $q.notify({
        type: 'positive',
        message: `Conectado ao servidor ${connection.name}`
      })
      
      // Emitir evento para outras páginas saberem que a conexão mudou
      window.dispatchEvent(new CustomEvent('connection-changed', { 
        detail: { 
          connection: {
            id: connection.id,
            name: connection.name,
            host: connection.host,
            port: connection.port,
            username: connection.username
          }, 
          status: 'connected' 
        } 
      }))
    } else {
      connectionStatus.value = 'disconnected'
      currentConnection.value = null
      window.currentActiveConnection = null
      $q.notify({
        type: 'negative',
        message: `Erro ao conectar: ${result.message}`
      })
    }
  } catch (error) {
    console.error('Erro ao conectar:', error)
    connectionStatus.value = 'disconnected'
    currentConnection.value = null
    window.currentActiveConnection = null
    $q.notify({
      type: 'negative',
      message: `Erro ao conectar: ${error.message}`
    })
  }
}

function openSettings() {
  // TODO: Implementar configurações
  console.log('Abrir configurações')
}

function disconnectFromServer() {
  selectedConnection.value = null
  connectionStatus.value = 'disconnected'
  window.currentActiveConnection = null
  
  // Emitir evento para outras páginas saberem que a conexão foi desconectada
  window.dispatchEvent(new CustomEvent('connection-changed', { 
    detail: { connection: null, status: 'disconnected' } 
  }))
  
  $q.notify({
    type: 'info',
    message: 'Desconectado do servidor'
  })
}

function confirmDeleteConnection() {
  const connection = currentConnection.value
  if (!connection) return
  
  $q.dialog({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir a conexão "${connection.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await deleteConnection(connection.id)
  })
}

async function deleteConnection(connectionId) {
  try {
    if (window.electronAPI) {
      await window.electronAPI.deleteConnection(connectionId)
      
      // Recarregar lista de conexões
      await loadConnections()
      
      // Se a conexão excluída era a selecionada, limpar seleção
       if (selectedConnection.value?.id === connectionId) {
         selectedConnection.value = null
         connectionStatus.value = 'disconnected'
         window.currentActiveConnection = null
       }
      
      $q.notify({
        type: 'positive',
        message: 'Conexão excluída com sucesso!'
      })
    }
  } catch (error) {
    console.error('Erro ao excluir conexão:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir conexão: ' + error.message
    })
  }
}

onMounted(() => {
  loadConnections()
})
</script>
