<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="extension" class="q-mr-sm" style="color: var(--accent-orange)" />
              Módulos Apache
            </div>
            <div class="text-subtitle1 text-secondary">
              Gerenciar módulos e extensões do Apache
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="refresh"
              label="Atualizar"
              @click="loadModules"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <!-- Filter -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <div class="row q-col-gutter-md items-center">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-input
                  v-model="filter"
                  label="Filtrar módulos"
                  filled
                  dense
                  clearable
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
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Modules Grid -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <div
            v-for="module in filteredModules"
            :key="module.name"
            class="col-lg-4 col-md-6 col-sm-12"
          >
            <q-card class="bg-secondary module-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6 text-primary">{{ module.name }}</div>
                  <q-chip
                    :color="module.enabled ? 'positive' : 'negative'"
                    text-color="white"
                    size="sm"
                  >
                    {{ module.enabled ? 'Habilitado' : 'Desabilitado' }}
                  </q-chip>
                </div>

                <div class="text-caption text-secondary q-mb-sm">
                  {{ module.category }}
                </div>

                <div class="text-body2 text-primary q-mb-md">
                  {{ module.description }}
                </div>

                <div class="row items-center justify-between">
                  <q-chip
                    color="primary"
                    text-color="white"
                    size="sm"
                    outline
                  >
                    v{{ module.version }}
                  </q-chip>

                  <q-btn-group>
                    <q-btn
                      :color="module.enabled ? 'negative' : 'positive'"
                      :icon="module.enabled ? 'stop' : 'play_arrow'"
                      :label="module.enabled ? 'Desabilitar' : 'Habilitar'"
                      size="sm"
                      @click="toggleModule(module)"
                      :loading="module.loading"
                    />
                    <q-btn
                      color="primary"
                      icon="info"
                      size="sm"
                      flat
                      @click="showModuleInfo(module)"
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

    <!-- Module Info Dialog -->
    <q-dialog v-model="showInfoDialog" persistent>
      <q-card style="min-width: 500px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">{{ selectedModule?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <div>
              <div class="text-subtitle2 text-primary">Descrição:</div>
              <div class="text-body2 text-secondary">{{ selectedModule?.description }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Categoria:</div>
              <div class="text-body2 text-secondary">{{ selectedModule?.category }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Versão:</div>
              <div class="text-body2 text-secondary">{{ selectedModule?.version }}</div>
            </div>

            <div>
              <div class="text-subtitle2 text-primary">Status:</div>
              <q-chip
                :color="selectedModule?.enabled ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ selectedModule?.enabled ? 'Habilitado' : 'Desabilitado' }}
              </q-chip>
            </div>

            <div v-if="selectedModule?.dependencies?.length">
              <div class="text-subtitle2 text-primary">Dependências:</div>
              <div class="q-gutter-xs">
                <q-chip
                  v-for="dep in selectedModule.dependencies"
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
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" @click="showInfoDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const filter = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const showInfoDialog = ref(false)
const selectedModule = ref(null)

const modules = ref([
  {
    name: 'mod_rewrite',
    description: 'Fornece uma maneira de modificar URLs de entrada com base em regras de expressão regular',
    category: 'URL Manipulation',
    version: '2.4.54',
    enabled: true,
    dependencies: []
  },
  {
    name: 'mod_ssl',
    description: 'Fornece suporte SSL/TLS para o servidor Apache',
    category: 'Security',
    version: '2.4.54',
    enabled: true,
    dependencies: ['mod_socache_shmcb']
  },
  {
    name: 'mod_php',
    description: 'Permite ao Apache executar scripts PHP',
    category: 'Programming Languages',
    version: '8.1.0',
    enabled: true,
    dependencies: []
  },
  {
    name: 'mod_deflate',
    description: 'Comprime conteúdo antes de enviá-lo ao cliente',
    category: 'Compression',
    version: '2.4.54',
    enabled: false,
    dependencies: []
  },
  {
    name: 'mod_headers',
    description: 'Permite controle sobre cabeçalhos HTTP de resposta e solicitação',
    category: 'HTTP Headers',
    version: '2.4.54',
    enabled: true,
    dependencies: []
  },
  {
    name: 'mod_expires',
    description: 'Geração de cabeçalhos Expires e Cache-Control HTTP',
    category: 'Caching',
    version: '2.4.54',
    enabled: false,
    dependencies: []
  },
  {
    name: 'mod_security',
    description: 'Web Application Firewall (WAF) para Apache',
    category: 'Security',
    version: '2.9.6',
    enabled: false,
    dependencies: ['mod_unique_id']
  },
  {
    name: 'mod_status',
    description: 'Fornece informações sobre atividade e desempenho do servidor',
    category: 'Monitoring',
    version: '2.4.54',
    enabled: true,
    dependencies: []
  }
])

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Habilitados', value: 'enabled' },
  { label: 'Desabilitados', value: 'disabled' }
]

const categoryOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Security', value: 'Security' },
  { label: 'URL Manipulation', value: 'URL Manipulation' },
  { label: 'Programming Languages', value: 'Programming Languages' },
  { label: 'Compression', value: 'Compression' },
  { label: 'HTTP Headers', value: 'HTTP Headers' },
  { label: 'Caching', value: 'Caching' },
  { label: 'Monitoring', value: 'Monitoring' }
]

const filteredModules = computed(() => {
  let filtered = modules.value

  if (filter.value) {
    filtered = filtered.filter(module =>
      module.name.toLowerCase().includes(filter.value.toLowerCase()) ||
      module.description.toLowerCase().includes(filter.value.toLowerCase())
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(module => {
      if (statusFilter.value === 'enabled') return module.enabled
      if (statusFilter.value === 'disabled') return !module.enabled
      return true
    })
  }

  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(module => module.category === categoryFilter.value)
  }

  return filtered
})

function showModuleInfo(module) {
  selectedModule.value = module
  showInfoDialog.value = true
}

async function toggleModule(module) {
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

  module.loading = true
  try {
    const action = module.enabled ? 'a2dismod' : 'a2enmod'
    const command = `sudo ${action} ${module.name} && sudo systemctl reload apache2`

    const result = await window.electronAPI.executeCommand(currentConnection, command)

    if (!result.success) {
      throw new Error(result.error || 'Comando falhou')
    }

    module.enabled = !module.enabled

    $q.notify({
      type: 'positive',
      message: `Módulo ${module.name} ${module.enabled ? 'habilitado' : 'desabilitado'} com sucesso!`
    })
  } catch (error) {
    console.error('Erro ao alterar status do módulo:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao alterar status do módulo: ${error.message}`
    })
  } finally {
    module.loading = false
  }
}

async function loadModules() {
  const globalConnection = window.currentActiveConnection

  if (!globalConnection) {
    $q.notify({
      type: 'warning',
      message: 'Nenhuma conexão ativa. Selecione um servidor.'
    })
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
    // Buscar módulos habilitados
    const enabledResult = await window.electronAPI.executeCommand(
      currentConnection,
      'apache2ctl -M 2>/dev/null | grep -v "Loaded Modules:" | awk "{print $1}" | sort || echo ""'
    )

    // Buscar módulos disponíveis
    const availableResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /usr/lib/apache2/modules/*.so 2>/dev/null | xargs -I {} basename {} .so | sed "s/^lib//" | sort || echo ""'
    )

    const enabledModules = enabledResult.success ?
      enabledResult.output.trim().split('\n').filter(mod => mod.trim()) : []
    const availableModules = availableResult.success ?
      availableResult.output.trim().split('\n').filter(mod => mod.trim()) : []

    // Combinar dados dos módulos
    const moduleSet = new Set([...enabledModules, ...availableModules])
    const loadedModules = []

    for (const moduleName of moduleSet) {
      if (!moduleName.trim()) continue

      const isEnabled = enabledModules.includes(moduleName)

      loadedModules.push({
        name: moduleName,
        description: getModuleDescription(moduleName),
        category: getModuleCategory(moduleName),
        version: '2.4.x',
        enabled: isEnabled,
        dependencies: []
      })
    }

    modules.value = loadedModules

    $q.notify({
      type: 'positive',
      message: 'Módulos atualizados com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao carregar módulos:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar módulos'
    })
  } finally {
    loading.value = false
  }
}

function getModuleDescription(moduleName) {
  const descriptions = {
    'mod_rewrite': 'Fornece uma maneira de modificar URLs de entrada com base em regras de expressão regular',
    'mod_ssl': 'Fornece suporte SSL/TLS para o servidor Apache',
    'mod_php': 'Permite ao Apache executar scripts PHP',
    'mod_deflate': 'Comprime conteúdo antes de enviá-lo ao cliente',
    'mod_headers': 'Permite controle sobre cabeçalhos HTTP de resposta e solicitação',
    'mod_dir': 'Fornece redirecionamentos para URLs que terminam em diretório',
    'mod_mime': 'Associa extensões de arquivo com tipos de conteúdo',
    'mod_negotiation': 'Fornece negociação de conteúdo',
    'mod_setenvif': 'Define variáveis de ambiente baseadas em características da requisição',
    'mod_authz_core': 'Fornece autorização baseada em host',
    'mod_authz_host': 'Autorização baseada em host',
    'mod_authn_core': 'Fornece autenticação básica',
    'mod_authn_file': 'Autenticação baseada em arquivo de texto',
    'mod_authz_user': 'Autorização baseada em usuário',
    'mod_alias': 'Fornece mapeamento de diferentes partes do sistema de arquivos do host',
    'mod_autoindex': 'Gera automaticamente listagens de diretório'
  }
  return descriptions[moduleName] || 'Módulo do Apache HTTP Server'
}

function getModuleCategory(moduleName) {
  const categories = {
    'mod_rewrite': 'URL Manipulation',
    'mod_ssl': 'Security',
    'mod_php': 'Programming Languages',
    'mod_deflate': 'Compression',
    'mod_headers': 'HTTP Headers',
    'mod_dir': 'Content',
    'mod_mime': 'Content',
    'mod_negotiation': 'Content',
    'mod_setenvif': 'Environment',
    'mod_authz_core': 'Authentication',
    'mod_authz_host': 'Authentication',
    'mod_authn_core': 'Authentication',
    'mod_authn_file': 'Authentication',
    'mod_authz_user': 'Authentication',
    'mod_alias': 'URL Manipulation',
    'mod_autoindex': 'Content'
  }
  return categories[moduleName] || 'Other'
}

onMounted(() => {
  loadModules()
})
</script>

<style scoped>
.module-card {
  transition: transform 0.2s ease;
}

.module-card:hover {
  transform: translateY(-2px);
}
</style>
