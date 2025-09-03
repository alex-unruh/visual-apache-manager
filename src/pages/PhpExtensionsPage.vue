<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="extension" class="q-mr-sm" style="color: var(--accent-orange)" />
              Extensões PHP
            </div>
            <div class="text-subtitle1 text-secondary">
              Gerenciar extensões PHP por versão
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="refresh"
              label="Atualizar"
              @click="loadExtensions"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="row q-col-gutter-md items-center">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-select
                  v-model="selectedPhpVersion"
                  :options="phpVersionOptions"
                  label="Versão PHP"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                  @update:model-value="loadExtensions"
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-input
                  v-model="filter"
                  label="Filtrar extensões"
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
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-select
                  v-model="statusFilter"
                  :options="statusOptions"
                  label="Status"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                />
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-select
                  v-model="categoryFilter"
                  :options="categoryOptions"
                  label="Categoria"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Extensions Grid -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div
            v-for="extension in filteredExtensions"
            :key="extension.name"
            class="col-lg-4 col-md-6 col-sm-12"
          >
            <q-card class="bg-secondary extension-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6 text-primary">{{ extension.name }}</div>
                  <q-chip
                    :color="extension.enabled ? 'positive' : 'negative'"
                    text-color="white"
                    size="sm"
                  >
                    {{ extension.enabled ? 'Habilitada' : 'Desabilitada' }}
                  </q-chip>
                </div>

                <div class="text-caption text-secondary q-mb-sm">
                  {{ extension.category }}
                </div>

                <div class="text-body2 text-primary q-mb-md">
                  {{ extension.description }}
                </div>

                <div class="row items-center justify-between">
                  <q-chip
                    color="primary"
                    text-color="white"
                    size="sm"
                    outline
                  >
                    v{{ extension.version }}
                  </q-chip>

                  <q-btn-group>
                    <q-btn
                      v-if="extension.installed"
                      :color="extension.enabled ? 'negative' : 'positive'"
                      :icon="extension.enabled ? 'stop' : 'play_arrow'"
                      :label="extension.enabled ? 'Desabilitar' : 'Habilitar'"
                      size="sm"
                      @click="toggleExtension(extension)"
                      :loading="extension.loading"
                    />
                    <q-btn
                      v-else
                      color="primary"
                      icon="download"
                      label="Instalar"
                      size="sm"
                      @click="installExtension(extension)"
                      :loading="extension.installing"
                    />
                    <q-btn
                      v-if="extension.configurable"
                      color="primary"
                      icon="settings"
                      size="sm"
                      flat
                      @click="configureExtension(extension)"
                    >
                      <q-tooltip>Configurar</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="primary"
                      icon="info"
                      size="sm"
                      flat
                      @click="showExtensionInfo(extension)"
                    >
                      <q-tooltip>Informações</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Extension Info Dialog -->
    <q-dialog v-model="showInfoDialog" persistent>
      <q-card style="min-width: 500px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">{{ selectedExtension?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <div>
              <div class="text-subtitle2 text-primary">Descrição:</div>
              <div class="text-body2 text-secondary">{{ selectedExtension?.description }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Categoria:</div>
              <div class="text-body2 text-secondary">{{ selectedExtension?.category }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Versão:</div>
              <div class="text-body2 text-secondary">{{ selectedExtension?.version }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Status:</div>
              <q-chip
                :color="selectedExtension?.enabled ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ selectedExtension?.enabled ? 'Habilitada' : 'Desabilitada' }}
              </q-chip>
            </div>

            <div v-if="selectedExtension?.dependencies?.length">
              <div class="text-subtitle2 text-primary">Dependências:</div>
              <div class="q-gutter-xs">
                <q-chip
                  v-for="dep in selectedExtension.dependencies"
                  :key="dep"
                  color="primary"
                  text-color="white"
                  size="sm"
                  outline
                >
                  {{ dep }}
                </q-chip>
              </div>
            </div>

            <div v-if="selectedExtension?.configFile">
              <div class="text-subtitle2 text-primary">Arquivo de configuração:</div>
              <div class="text-body2 text-secondary">{{ selectedExtension.configFile }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" @click="showInfoDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Extension Configuration Dialog -->
    <q-dialog v-model="showConfigDialog" persistent>
      <q-card style="min-width: 600px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">
            Configurar {{ selectedExtension?.name }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <div v-for="(config, key) in extensionConfig" :key="key">
              <q-input
                v-if="typeof config.value === 'string' || typeof config.value === 'number'"
                v-model="config.value"
                :label="config.label"
                :type="typeof config.value === 'number' ? 'number' : 'text'"
                filled
                dense
                dark
                :hint="config.description"
              />
              <q-checkbox
                v-else-if="typeof config.value === 'boolean'"
                v-model="config.value"
                :label="config.label"
                color="primary"
              >
                <q-tooltip>{{ config.description }}</q-tooltip>
              </q-checkbox>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showConfigDialog = false" />
          <q-btn
            color="primary"
            label="Salvar"
            @click="saveExtensionConfig"
            :loading="savingConfig"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

const $q = useQuasar()
const route = useRoute()

const loading = ref(false)
const savingConfig = ref(false)
const filter = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const selectedPhpVersion = ref('8.1')
const showInfoDialog = ref(false)
const showConfigDialog = ref(false)
const selectedExtension = ref(null)

const extensions = ref([])

const phpVersionOptions = [
  { label: 'PHP 7.4', value: '7.4' },
  { label: 'PHP 8.0', value: '8.0' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.3', value: '8.3' }
]

const statusOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Habilitadas', value: 'enabled' },
  { label: 'Desabilitadas', value: 'disabled' },
  { label: 'Instaladas', value: 'installed' },
  { label: 'Não instaladas', value: 'not_installed' }
]

const categoryOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Network', value: 'Network' },
  { label: 'Graphics', value: 'Graphics' },
  { label: 'String', value: 'String' },
  { label: 'Database', value: 'Database' },
  { label: 'Data Format', value: 'Data Format' },
  { label: 'Archive', value: 'Archive' },
  { label: 'Cache', value: 'Cache' },
  { label: 'Development', value: 'Development' }
]

const extensionConfig = ref({})

const filteredExtensions = computed(() => {
  let filtered = extensions.value

  if (filter.value) {
    filtered = filtered.filter(ext =>
      ext.name.toLowerCase().includes(filter.value.toLowerCase()) ||
      ext.description.toLowerCase().includes(filter.value.toLowerCase())
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(ext => {
      switch (statusFilter.value) {
        case 'enabled': return ext.enabled
        case 'disabled': return !ext.enabled && ext.installed
        case 'installed': return ext.installed
        case 'not_installed': return !ext.installed
        default: return true
      }
    })
  }

  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(ext => ext.category === categoryFilter.value)
  }

  return filtered
})

function showExtensionInfo(extension) {
  selectedExtension.value = extension
  showInfoDialog.value = true
}

function configureExtension(extension) {
  selectedExtension.value = extension

  // Configurações específicas por extensão
  switch (extension.name) {
    case 'gd':
      extensionConfig.value = {
        jpeg_support: { label: 'JPEG Support', value: true, description: 'Habilitar suporte JPEG' },
        png_support: { label: 'PNG Support', value: true, description: 'Habilitar suporte PNG' },
        gif_support: { label: 'GIF Support', value: true, description: 'Habilitar suporte GIF' }
      }
      break
    case 'mysql':
      extensionConfig.value = {
        default_socket: { label: 'Default Socket', value: '/var/run/mysqld/mysqld.sock', description: 'Socket padrão MySQL' },
        default_port: { label: 'Default Port', value: 3306, description: 'Porta padrão MySQL' },
        connect_timeout: { label: 'Connect Timeout', value: 60, description: 'Timeout de conexão em segundos' }
      }
      break
    case 'redis':
      extensionConfig.value = {
        session_locking_enabled: { label: 'Session Locking', value: true, description: 'Habilitar bloqueio de sessão' },
        session_lock_expire: { label: 'Lock Expire', value: 30, description: 'Tempo de expiração do bloqueio' }
      }
      break
    case 'xdebug':
      extensionConfig.value = {
        mode: { label: 'Mode', value: 'debug', description: 'Modo do Xdebug' },
        start_with_request: { label: 'Start with Request', value: 'yes', description: 'Iniciar com requisição' },
        client_port: { label: 'Client Port', value: 9003, description: 'Porta do cliente' },
        log_level: { label: 'Log Level', value: 7, description: 'Nível de log' }
      }
      break
    default:
      extensionConfig.value = {}
  }

  showConfigDialog.value = true
}

async function toggleExtension(extension) {
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

  extension.loading = true
  try {
    const phpVersion = selectedPhpVersion.value
    const action = extension.enabled ? 'phpdismod' : 'phpenmod'

    const result = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo ${action} -v ${phpVersion} ${extension.name} && sudo systemctl reload apache2`
    )

    if (result.success) {
      extension.enabled = !extension.enabled

      $q.notify({
        type: 'positive',
        message: `Extensão ${extension.name} ${extension.enabled ? 'habilitada' : 'desabilitada'} com sucesso!`
      })
    } else {
      throw new Error(result.error || 'Comando falhou')
    }
  } catch (error) {
    console.error('Erro ao alterar status da extensão:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao ${extension.enabled ? 'desabilitar' : 'habilitar'} extensão: ${error.message}`
    })
  } finally {
    extension.loading = false
  }
}

async function installExtension(extension) {
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

  extension.installing = true
  try {
    const phpVersion = selectedPhpVersion.value

    // Instalar a extensão
    const installResult = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo apt-get update && sudo apt-get install -y php${phpVersion}-${extension.name}`
    )

    if (installResult.success) {
      // Habilitar a extensão
      const enableResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo phpenmod -v ${phpVersion} ${extension.name} && sudo systemctl reload apache2`
      )

      if (enableResult.success) {
        extension.installed = true
        extension.enabled = true

        $q.notify({
          type: 'positive',
          message: `Extensão ${extension.name} instalada com sucesso!`
        })

        // Recarregar lista de extensões
        await loadExtensions()
      } else {
        throw new Error('Falha ao habilitar extensão após instalação')
      }
    } else {
      throw new Error(installResult.error || 'Falha na instalação')
    }
  } catch (error) {
    console.error('Erro ao instalar extensão:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao instalar extensão: ${error.message}`
    })
  } finally {
    extension.installing = false
  }
}

async function saveExtensionConfig() {
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

  savingConfig.value = true
  try {
    const phpVersion = selectedPhpVersion.value
    const configFile = `/etc/php/${phpVersion}/mods-available/${selectedExtension.value.name}.ini`

    // Gerar conteúdo do arquivo de configuração
    let configContent = `; Configuration for ${selectedExtension.value.name} extension\n`
    configContent += `extension=${selectedExtension.value.name}\n\n`

    // Adicionar configurações específicas
    for (const [key, config] of Object.entries(extensionConfig.value)) {
      if (typeof config.value === 'boolean') {
        configContent += `${selectedExtension.value.name}.${key} = ${config.value ? 'On' : 'Off'}\n`
      } else {
        configContent += `${selectedExtension.value.name}.${key} = ${config.value}\n`
      }
    }

    // Salvar arquivo de configuração
    const saveResult = await window.electronAPI.executeCommand(
      currentConnection,
      `echo '${configContent}' | sudo tee ${configFile} > /dev/null && sudo systemctl reload apache2`
    )

    if (saveResult.success) {
      showConfigDialog.value = false

      $q.notify({
        type: 'positive',
        message: 'Configuração salva com sucesso!'
      })
    } else {
      throw new Error(saveResult.error || 'Falha ao salvar configuração')
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar configuração: ${error.message}`
    })
  } finally {
    savingConfig.value = false
  }
}

async function loadExtensions() {
  const globalConnection = window.currentActiveConnection

  if (!globalConnection) {
    extensions.value = []
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
    const phpVersion = selectedPhpVersion.value
    const phpPath = `/usr/bin/php${phpVersion}`

    // Verificar se a versão PHP existe
    const phpExistsResult = await window.electronAPI.executeCommand(
      currentConnection,
      `test -f ${phpPath} && echo "exists" || echo "not_found"`
    )

    if (!phpExistsResult.success || !phpExistsResult.output.includes('exists')) {
      extensions.value = []
      return
    }

    // Buscar extensões carregadas
    const loadedResult = await window.electronAPI.executeCommand(
      currentConnection,
      `${phpPath} -m 2>/dev/null | grep -v "\\[" | sort || echo ""`
    )

    const loadedExtensions = loadedResult.success ?
      loadedResult.output.trim().split('\n').filter(ext => ext.trim()) : []

    // Buscar extensões disponíveis (instaladas mas não necessariamente carregadas)
    const availableResult = await window.electronAPI.executeCommand(
      currentConnection,
      `ls /etc/php/${phpVersion}/mods-available/*.ini 2>/dev/null | xargs -I {} basename {} .ini | sort || echo ""`
    )

    const availableExtensions = availableResult.success ?
      availableResult.output.trim().split('\n').filter(ext => ext.trim()) : []

    // Combinar informações
    const extensionSet = new Set([...loadedExtensions, ...availableExtensions])
    const extensionList = []

    for (const extName of extensionSet) {
      if (!extName) continue

      const enabled = loadedExtensions.includes(extName)
      const installed = availableExtensions.includes(extName) || enabled

      // Categorizar extensão baseado no nome
      let category = 'Other'
      if (['curl', 'ftp', 'ssh2'].includes(extName)) category = 'Network'
      else if (['gd', 'imagick', 'exif'].includes(extName)) category = 'Graphics'
      else if (['mysql', 'mysqli', 'pdo', 'pdo_mysql', 'redis', 'mongodb'].includes(extName)) category = 'Database'
      else if (['mbstring', 'iconv', 'intl'].includes(extName)) category = 'String'
      else if (['xml', 'json', 'yaml'].includes(extName)) category = 'Data Format'
      else if (['zip', 'rar', 'bz2'].includes(extName)) category = 'Archive'
      else if (['xdebug', 'opcache'].includes(extName)) category = 'Development'
      else if (['memcached', 'apcu'].includes(extName)) category = 'Cache'

      extensionList.push({
        name: extName,
        description: getExtensionDescription(extName),
        category,
        version: 'N/A', // Difícil de determinar via SSH
        enabled,
        installed,
        configurable: availableExtensions.includes(extName),
        dependencies: [],
        configFile: installed ? `/etc/php/${phpVersion}/mods-available/${extName}.ini` : null
      })
    }

    extensions.value = extensionList

  } catch (error) {
    console.error('Erro ao carregar extensões:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar extensões'
    })
  } finally {
    loading.value = false
  }
}

function getExtensionDescription(name) {
  const descriptions = {
    'curl': 'Permite fazer requisições HTTP/HTTPS',
    'gd': 'Biblioteca para manipulação de imagens',
    'mbstring': 'Funções para strings multibyte',
    'mysql': 'Driver MySQL para PHP',
    'mysqli': 'Driver MySQL melhorado',
    'pdo': 'PHP Data Objects',
    'pdo_mysql': 'Driver PDO para MySQL',
    'xml': 'Suporte para manipulação de XML',
    'zip': 'Suporte para arquivos ZIP',
    'redis': 'Cliente Redis para PHP',
    'imagick': 'ImageMagick para manipulação avançada de imagens',
    'xdebug': 'Debugger e profiler para PHP',
    'opcache': 'Cache de bytecode para PHP',
    'json': 'Suporte para JSON',
    'openssl': 'Funções criptográficas OpenSSL',
    'session': 'Gerenciamento de sessões',
    'filter': 'Filtros de dados',
    'hash': 'Funções de hash',
    'pcre': 'Expressões regulares compatíveis com Perl'
  }

  return descriptions[name] || `Extensão ${name}`
}

// Verificar se há filtro de versão na URL
watch(() => route.query.version, (newVersion) => {
  if (newVersion) {
    selectedPhpVersion.value = newVersion
  }
}, { immediate: true })

// Recarregar extensões quando a versão PHP mudar
watch(selectedPhpVersion, () => {
  loadExtensions()
})

// Listener para mudanças de conexão
let connectionChangeHandler = null

onMounted(() => {
  loadExtensions()

  // Adicionar listener para mudanças de conexão
  connectionChangeHandler = () => {
    loadExtensions()
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

<style scoped>
.extension-card {
  transition: transform 0.2s ease;
}

.extension-card:hover {
  transform: translateY(-2px);
}
</style>
