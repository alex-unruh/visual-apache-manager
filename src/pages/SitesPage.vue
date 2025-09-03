<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="web" class="q-mr-sm" style="color: var(--accent-orange)" />
              Sites Apache
            </div>
            <div class="text-subtitle1 text-secondary">
              Gerenciar sites virtuais do Apache
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Novo Site"
              @click="openSiteDialog"
            />
          </div>
        </div>
      </div>

      <!-- Sites Table -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <q-table
              :rows="sites"
              :columns="columns"
              row-key="name"
              :loading="loading"
              class="bg-secondary text-primary"
              flat
              bordered
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.value ? 'positive' : 'negative'"
                    text-color="white"
                    size="sm"
                  >
                    {{ props.value ? 'Habilitado' : 'Desabilitado' }}
                  </q-chip>
                </q-td>
              </template>
              
              <template v-slot:body-cell-ssl="props">
                <q-td :props="props">
                  <q-icon
                    :name="props.value ? 'lock' : 'lock_open'"
                    :color="props.value ? 'positive' : 'negative'"
                    size="sm"
                  />
                </q-td>
              </template>
              
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn-group flat>
                    <q-btn
                      flat
                      dense
                      :icon="props.row.enabled ? 'stop' : 'play_arrow'"
                      :color="props.row.enabled ? 'negative' : 'positive'"
                      @click="toggleSite(props.row)"
                      :loading="props.row.loading"
                    >
                      <q-tooltip>
                        {{ props.row.enabled ? 'Desabilitar' : 'Habilitar' }} Site
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      icon="edit"
                      color="primary"
                      @click="editSite(props.row)"
                    >
                      <q-tooltip>Editar Site</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      icon="delete"
                      color="negative"
                      @click="deleteSite(props.row)"
                    >
                      <q-tooltip>Excluir Site</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para criar/editar site -->
    <q-dialog v-model="showSiteDialog" persistent>
      <q-card style="min-width: 600px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">
            {{ editingIndex !== -1 ? 'Editar Site' : 'Novo Site' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveSite" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="siteForm.name"
                  label="Nome do Site"
                  filled
                  dense
                  :rules="[val => !!val || 'Nome é obrigatório']"
                  dark
                />
              </div>
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model="siteForm.domain"
                  label="Domínio"
                  filled
                  dense
                  :rules="[val => !!val || 'Domínio é obrigatório']"
                  placeholder="exemplo.com"
                  dark
                />
              </div>
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-md-8 col-sm-12">
                <q-input
                  v-model="siteForm.documentRoot"
                  label="Document Root"
                  filled
                  dense
                  :rules="[val => !!val || 'Document Root é obrigatório']"
                  placeholder="/var/www/html/exemplo"
                  dark
                />
              </div>
              <div class="col-md-4 col-sm-12">
                <q-select
                  v-model="siteForm.phpVersion"
                  :options="phpVersions"
                  label="Versão PHP"
                  filled
                  dense
                  emit-value
                  map-options
                  dark
                />
              </div>
            </div>
            
            <div class="row q-gutter-md">
              <div class="col-md-6 col-sm-12">
                <q-input
                  v-model.number="siteForm.port"
                  label="Porta"
                  type="number"
                  filled
                  dense
                  :rules="[val => !!val || 'Porta é obrigatória']"
                  dark
                />
              </div>
              <div class="col-md-6 col-sm-12">
                <div class="q-mt-md">
                  <q-checkbox
                    v-model="siteForm.enabled"
                    label="Habilitar site"
                    color="primary"
                  />
                  <q-checkbox
                    v-model="siteForm.sslEnabled"
                    label="Habilitar SSL"
                    color="primary"
                    class="q-ml-md"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeSiteDialog" />
          <q-btn color="primary" label="Salvar" @click="saveSite" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const loading = ref(false)
const saving = ref(false)
const showSiteDialog = ref(false)
const editingIndex = ref(-1)

const sites = ref([])
const currentConnection = ref(null)

const phpVersions = ref([
  { label: 'PHP 7.4', value: '7.4' },
  { label: 'PHP 8.0', value: '8.0' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.3', value: '8.3' }
])

const siteForm = ref({
  name: '',
  domain: '',
  documentRoot: '',
  phpVersion: '8.1',
  port: 80,
  enabled: true,
  sslEnabled: false
})

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'domain',
    label: 'Domínio',
    align: 'left',
    field: 'domain',
    sortable: true
  },
  {
    name: 'documentRoot',
    label: 'Document Root',
    align: 'left',
    field: 'documentRoot'
  },
  {
    name: 'phpVersion',
    label: 'PHP',
    align: 'center',
    field: 'phpVersion',
    sortable: true
  },
  {
    name: 'port',
    label: 'Porta',
    align: 'center',
    field: 'port',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    align: 'center',
    field: 'enabled'
  },
  {
    name: 'ssl',
    label: 'SSL',
    align: 'center',
    field: 'sslEnabled'
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center'
  }
]

function openSiteDialog() {
  siteForm.value = {
    name: '',
    domain: '',
    documentRoot: '',
    phpVersion: '8.1',
    port: 80,
    enabled: true,
    sslEnabled: false
  }
  editingIndex.value = -1
  showSiteDialog.value = true
}

function closeSiteDialog() {
  showSiteDialog.value = false
  editingIndex.value = -1
}

function editSite(site) {
  siteForm.value = { ...site }
  editingIndex.value = sites.value.findIndex(s => s.name === site.name)
  showSiteDialog.value = true
}

async function saveSite() {
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
  
  saving.value = true
  try {
    const siteName = siteForm.value.name
    const configFileName = `${siteName}.conf`
    
    // Gerar configuração do virtual host
    let config = `<VirtualHost *:${siteForm.value.port}>\n`
    config += `    ServerName ${siteForm.value.domain}\n`
    config += `    DocumentRoot ${siteForm.value.documentRoot}\n`
    config += `    ErrorLog \${APACHE_LOG_DIR}/${siteName}_error.log\n`
    config += `    CustomLog \${APACHE_LOG_DIR}/${siteName}_access.log combined\n`
    config += `\n    <Directory ${siteForm.value.documentRoot}>\n`
    config += `        Options Indexes FollowSymLinks\n`
    config += `        AllowOverride All\n`
    config += `        Require all granted\n`
    config += `    </Directory>\n`
    
    if (siteForm.value.phpVersion && siteForm.value.phpVersion !== 'N/A') {
      config += `\n    # PHP Configuration\n`
      config += `    <FilesMatch \\.php$>\n`
      config += `        SetHandler "proxy:unix:/var/run/php/php${siteForm.value.phpVersion}-fpm.sock|fcgi://localhost"\n`
      config += `    </FilesMatch>\n`
    }
    
    config += `</VirtualHost>\n`
    
    // Criar diretório do documento se não existir
    const createDirResult = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo mkdir -p ${siteForm.value.documentRoot}`
    )
    
    if (!createDirResult.success) {
      throw new Error('Falha ao criar diretório do documento')
    }
    
    // Criar arquivo de configuração
    const createConfigResult = await window.electronAPI.executeCommand(
      currentConnection,
      `echo '${config}' | sudo tee /etc/apache2/sites-available/${configFileName} > /dev/null`
    )
    
    if (!createConfigResult.success) {
      throw new Error('Falha ao criar arquivo de configuração')
    }
    
    // Habilitar site se necessário
    if (siteForm.value.enabled) {
      const enableResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo a2ensite ${configFileName} && sudo systemctl reload apache2`
      )
      
      if (!enableResult.success) {
        throw new Error('Falha ao habilitar site')
      }
    }
    
    // Atualizar lista local
    if (editingIndex.value !== -1) {
      sites.value[editingIndex.value] = { ...siteForm.value }
    } else {
      sites.value.push({ ...siteForm.value })
    }
    
    closeSiteDialog()
    $q.notify({
      type: 'positive',
      message: 'Site salvo com sucesso!'
    })
    
    // Recarregar lista de sites
    await loadSites()
    
  } catch (error) {
    console.error('Erro ao salvar site:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar site: ${error.message}`
    })
  } finally {
    saving.value = false
  }
}

async function toggleSite(site) {
  if (!currentConnection.value) {
    $q.notify({
      type: 'warning',
      message: 'Nenhuma conexão ativa'
    })
    return
  }
  
  site.loading = true
  try {
    const command = site.enabled 
      ? `a2dissite ${site.name}.conf && systemctl reload apache2`
      : `a2ensite ${site.name}.conf && systemctl reload apache2`
    
    const result = await window.electronAPI.executeCommand(
      currentConnection.value,
      command
    )
    
    if (result.success) {
      site.enabled = !site.enabled
      
      $q.notify({
        type: 'positive',
        message: `Site ${site.enabled ? 'habilitado' : 'desabilitado'} com sucesso!`
      })
    } else {
      throw new Error(result.error || 'Comando falhou')
    }
  } catch (error) {
    console.error('Erro ao alterar status do site:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao alterar status do site: ${error.message}`
    })
  } finally {
    site.loading = false
  }
}

function deleteSite(site) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o site "${site.name}"?`,
    cancel: true,
    persistent: true,
    class: 'bg-secondary text-primary'
  }).onOk(() => {
    const index = sites.value.findIndex(s => s.name === site.name)
    if (index !== -1) {
      sites.value.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Site excluído com sucesso!'
      })
    }
  })
}

async function loadSites() {
  loading.value = true
  sites.value = []
  
  try {
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
    
    // Buscar sites disponíveis
    const availableSitesResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-available/ 2>/dev/null | grep -v "\\.\\.conf$" || echo ""'
    )
    
    // Buscar sites habilitados
    const enabledSitesResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-enabled/ 2>/dev/null | grep -v "\\.\\.conf$" || echo ""'
    )
    
    if (!availableSitesResult.success) {
      throw new Error('Erro ao acessar diretório de sites do Apache')
    }
    
    const availableSites = availableSitesResult.output.trim().split('\n').filter(site => site.trim())
    const enabledSites = enabledSitesResult.success ? 
      enabledSitesResult.output.trim().split('\n').filter(site => site.trim()) : []
    
    // Para cada site, buscar informações detalhadas
    for (const siteName of availableSites) {
      if (!siteName.trim()) continue
      
      try {
        // Ler configuração do site
        const configResult = await window.electronAPI.executeCommand(
          currentConnection,
          `cat /etc/apache2/sites-available/${siteName} 2>/dev/null || echo "Erro ao ler configuração"`
        )
        
        if (configResult.success && !configResult.output.includes('Erro ao ler configuração')) {
          const config = configResult.output
          
          // Extrair informações básicas da configuração
          const serverNameMatch = config.match(/ServerName\s+([^\s]+)/i)
          const documentRootMatch = config.match(/DocumentRoot\s+([^\s]+)/i)
          const portMatch = config.match(/<VirtualHost[^>]*:(\d+)>/i)
          const sslMatch = config.match(/SSLEngine\s+on/i)
          
          const site = {
            name: siteName.replace('.conf', ''),
            domain: serverNameMatch ? serverNameMatch[1] : 'localhost',
            documentRoot: documentRootMatch ? documentRootMatch[1] : '/var/www/html',
            phpVersion: 'N/A', // Será detectado posteriormente se necessário
            port: portMatch ? parseInt(portMatch[1]) : 80,
            enabled: enabledSites.includes(siteName),
            sslEnabled: !!sslMatch,
            loading: false
          }
          
          sites.value.push(site)
        }
      } catch (error) {
        console.error(`Erro ao processar site ${siteName}:`, error)
      }
    }
    
    // Ordenar sites por nome
    sites.value.sort((a, b) => a.name.localeCompare(b.name))
    
  } catch (error) {
    console.error('Erro ao carregar sites:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao carregar sites: ${error.message}`
    })
  } finally {
    loading.value = false
  }
}

// Escutar mudanças de conexão
function handleConnectionChange(event) {
  currentConnection.value = event.detail.connection
  if (event.detail.status === 'connected') {
    loadSites()
  } else {
    sites.value = []
    currentConnection.value = null
  }
}

onMounted(() => {
  // Escutar mudanças de conexão
  window.addEventListener('connection-changed', handleConnectionChange)
  loadSites()
})

onUnmounted(() => {
  window.removeEventListener('connection-changed', handleConnectionChange)
})
</script>