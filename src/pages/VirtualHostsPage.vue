<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="dns" class="q-mr-sm" style="color: var(--accent-orange)" />
              Virtual Hosts
            </div>
            <div class="text-subtitle1 text-secondary">
              Gerenciar Virtual Hosts do Apache
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Novo Virtual Host"
              @click="openVhostDialog"
            />
          </div>
        </div>
      </div>

      <!-- Virtual Hosts Table -->
      <div class="col-12">
        <q-card class="bg-secondary">
          <q-card-section>
            <q-table
              :rows="virtualHosts"
              :columns="columns"
              row-key="serverName"
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
                    {{ props.value ? 'Ativo' : 'Inativo' }}
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
                      @click="toggleVhost(props.row)"
                      :loading="props.row.loading"
                    >
                      <q-tooltip>
                        {{ props.row.enabled ? 'Desabilitar' : 'Habilitar' }} Virtual Host
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      icon="edit"
                      color="primary"
                      @click="editVhost(props.row)"
                    >
                      <q-tooltip>Editar Virtual Host</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      icon="code"
                      color="primary"
                      @click="viewConfig(props.row)"
                    >
                      <q-tooltip>Ver Configuração</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      icon="delete"
                      color="negative"
                      @click="deleteVhost(props.row)"
                    >
                      <q-tooltip>Excluir Virtual Host</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para criar/editar Virtual Host -->
    <q-dialog v-model="showVhostDialog" persistent>
      <q-card style="min-width: 700px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">
            {{ editingIndex !== -1 ? 'Editar Virtual Host' : 'Novo Virtual Host' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveVhost" class="q-gutter-md">
            <q-tabs v-model="vhostTab" class="text-primary">
              <q-tab name="basic" label="Básico" />
              <q-tab name="advanced" label="Avançado" />
              <q-tab name="ssl" label="SSL" />
              <q-tab name="hosts" label="Hosts File" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="vhostTab" animated>
              <q-tab-panel name="basic">
                <div class="q-gutter-md">
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-input
                        v-model="vhostForm.serverName"
                        label="Server Name"
                        filled
                        dense
                        :rules="[val => !!val || 'Server Name é obrigatório']"
                        placeholder="exemplo.com"
                        dark
                      />
                    </div>
                    <div class="col">
                      <q-input
                        v-model="vhostForm.serverAlias"
                        label="Server Alias (opcional)"
                        filled
                        dense
                        placeholder="www.exemplo.com"
                        dark
                      />
                    </div>
                  </div>
                  
                  <q-input
                    v-model="vhostForm.documentRoot"
                    label="Document Root"
                    filled
                    dense
                    :rules="[val => !!val || 'Document Root é obrigatório']"
                    placeholder="/var/www/html/exemplo"
                    dark
                  />
                  
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-input
                        v-model.number="vhostForm.port"
                        label="Porta"
                        type="number"
                        filled
                        dense
                        :rules="[val => !!val || 'Porta é obrigatória']"
                        dark
                      />
                    </div>
                    <div class="col">
                      <q-select
                        v-model="vhostForm.phpVersion"
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
                    <div class="col">
                      <q-checkbox
                        v-model="vhostForm.enabled"
                        label="Habilitar Virtual Host"
                        color="primary"
                      />
                    </div>
                    <div class="col">
                      <q-checkbox
                        v-model="vhostForm.sslEnabled"
                        label="Habilitar SSL"
                        color="primary"
                      />
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="advanced">
                <div class="q-gutter-md">
                  <q-input
                    v-model="vhostForm.errorLog"
                    label="Error Log"
                    filled
                    dense
                    placeholder="/var/log/apache2/exemplo_error.log"
                    dark
                  />
                  
                  <q-input
                    v-model="vhostForm.accessLog"
                    label="Access Log"
                    filled
                    dense
                    placeholder="/var/log/apache2/exemplo_access.log"
                    dark
                  />
                  
                  <q-input
                    v-model="vhostForm.customDirectives"
                    label="Diretivas Customizadas"
                    type="textarea"
                    filled
                    rows="5"
                    placeholder="# Adicione diretivas Apache customizadas aqui"
                    dark
                  />
                  
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-select
                        v-model="vhostForm.logLevel"
                        :options="logLevels"
                        label="Log Level"
                        filled
                        dense
                        emit-value
                        map-options
                        dark
                      />
                    </div>
                    <div class="col">
                      <q-checkbox
                        v-model="vhostForm.allowOverride"
                        label="Allow Override All"
                        color="primary"
                      />
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="ssl">
                <div class="q-gutter-md">
                  <q-input
                    v-model="vhostForm.sslCertificate"
                    label="Certificado SSL"
                    filled
                    dense
                    placeholder="/etc/ssl/certs/exemplo.crt"
                    :disable="!vhostForm.sslEnabled"
                    dark
                  />
                  
                  <q-input
                    v-model="vhostForm.sslCertificateKey"
                    label="Chave Privada SSL"
                    filled
                    dense
                    placeholder="/etc/ssl/private/exemplo.key"
                    :disable="!vhostForm.sslEnabled"
                    dark
                  />
                  
                  <q-input
                    v-model="vhostForm.sslCertificateChain"
                    label="Cadeia de Certificados"
                    filled
                    dense
                    placeholder="/etc/ssl/certs/exemplo-chain.crt"
                    :disable="!vhostForm.sslEnabled"
                    dark
                  />
                  
                  <div class="row q-gutter-md">
                    <div class="col">
                      <q-checkbox
                        v-model="vhostForm.forceHttps"
                        label="Forçar HTTPS (redirect)"
                        color="primary"
                        :disable="!vhostForm.sslEnabled"
                      />
                    </div>
                    <div class="col">
                      <q-checkbox
                        v-model="vhostForm.hstsEnabled"
                        label="Habilitar HSTS"
                        color="primary"
                        :disable="!vhostForm.sslEnabled"
                      />
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="hosts">
                <div class="q-gutter-md">
                  <div class="text-subtitle2 text-primary">Configuração do arquivo /etc/hosts</div>
                  <div class="text-caption text-secondary q-mb-md">
                    Adicionar entradas no arquivo hosts para teste local
                  </div>
                  
                  <q-checkbox
                    v-model="vhostForm.updateHostsFile"
                    label="Atualizar arquivo /etc/hosts automaticamente"
                    color="primary"
                  />
                  
                  <q-input
                    v-model="vhostForm.hostsIp"
                    label="IP para hosts file"
                    filled
                    dense
                    placeholder="127.0.0.1"
                    :disable="!vhostForm.updateHostsFile"
                    dark
                  />
                  
                  <div class="bg-tertiary q-pa-md rounded-borders" v-if="vhostForm.updateHostsFile">
                    <div class="text-caption text-secondary q-mb-sm">Preview das entradas no hosts:</div>
                    <div class="text-body2 text-primary font-mono">
                      {{ vhostForm.hostsIp || '127.0.0.1' }} {{ vhostForm.serverName }}<br>
                      <span v-if="vhostForm.serverAlias">
                        {{ vhostForm.hostsIp || '127.0.0.1' }} {{ vhostForm.serverAlias }}
                      </span>
                    </div>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeVhostDialog" />
          <q-btn color="primary" label="Salvar" @click="saveVhost" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para visualizar configuração -->
    <q-dialog v-model="showConfigDialog" persistent>
      <q-card style="min-width: 800px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">
            Configuração: {{ selectedVhost?.serverName }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="configContent"
            type="textarea"
            filled
            readonly
            rows="20"
            class="font-mono"
            dark
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" @click="showConfigDialog = false" />
          <q-btn color="primary" icon="content_copy" label="Copiar" @click="copyConfig" />
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
const showVhostDialog = ref(false)
const showConfigDialog = ref(false)
const editingIndex = ref(-1)
const vhostTab = ref('basic')
const selectedVhost = ref(null)
const configContent = ref('')

const virtualHosts = ref([])

const phpVersions = ref([
  { label: 'PHP 7.4', value: '7.4' },
  { label: 'PHP 8.0', value: '8.0' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.3', value: '8.3' }
])

const logLevels = ref([
  { label: 'Error', value: 'error' },
  { label: 'Warn', value: 'warn' },
  { label: 'Info', value: 'info' },
  { label: 'Debug', value: 'debug' }
])

const vhostForm = ref({
  serverName: '',
  serverAlias: '',
  documentRoot: '',
  port: 80,
  phpVersion: '8.1',
  enabled: true,
  sslEnabled: false,
  errorLog: '',
  accessLog: '',
  customDirectives: '',
  logLevel: 'warn',
  allowOverride: true,
  sslCertificate: '',
  sslCertificateKey: '',
  sslCertificateChain: '',
  forceHttps: false,
  hstsEnabled: false,
  updateHostsFile: false,
  hostsIp: '127.0.0.1'
})

const columns = [
  {
    name: 'serverName',
    required: true,
    label: 'Server Name',
    align: 'left',
    field: 'serverName',
    sortable: true
  },
  {
    name: 'serverAlias',
    label: 'Server Alias',
    align: 'left',
    field: 'serverAlias'
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

function openVhostDialog() {
  vhostForm.value = {
    serverName: '',
    serverAlias: '',
    documentRoot: '',
    port: 80,
    phpVersion: '8.1',
    enabled: true,
    sslEnabled: false,
    errorLog: '',
    accessLog: '',
    customDirectives: '',
    logLevel: 'warn',
    allowOverride: true,
    sslCertificate: '',
    sslCertificateKey: '',
    sslCertificateChain: '',
    forceHttps: false,
    hstsEnabled: false,
    updateHostsFile: false,
    hostsIp: '127.0.0.1'
  }
  editingIndex.value = -1
  vhostTab.value = 'basic'
  showVhostDialog.value = true
}

function closeVhostDialog() {
  showVhostDialog.value = false
  editingIndex.value = -1
}

function editVhost(vhost) {
  vhostForm.value = { ...vhost }
  editingIndex.value = virtualHosts.value.findIndex(v => v.serverName === vhost.serverName)
  vhostTab.value = 'basic'
  showVhostDialog.value = true
}

function viewConfig(vhost) {
  selectedVhost.value = vhost
  
  // Gerar configuração do Virtual Host
  configContent.value = generateVhostConfig(vhost)
  showConfigDialog.value = true
}

function generateVhostConfig(vhost) {
  let config = `<VirtualHost *:${vhost.port}>\n`
  config += `    ServerName ${vhost.serverName}\n`
  
  if (vhost.serverAlias) {
    config += `    ServerAlias ${vhost.serverAlias}\n`
  }
  
  config += `    DocumentRoot ${vhost.documentRoot}\n`
  
  if (vhost.errorLog) {
    config += `    ErrorLog ${vhost.errorLog}\n`
  }
  
  if (vhost.accessLog) {
    config += `    CustomLog ${vhost.accessLog} combined\n`
  }
  
  config += `\n    <Directory ${vhost.documentRoot}>\n`
  config += `        Options Indexes FollowSymLinks\n`
  config += `        AllowOverride ${vhost.allowOverride ? 'All' : 'None'}\n`
  config += `        Require all granted\n`
  config += `    </Directory>\n`
  
  if (vhost.phpVersion) {
    config += `\n    # PHP Configuration\n`
    config += `    <FilesMatch \\.php$>\n`
    config += `        SetHandler "proxy:unix:/var/run/php/php${vhost.phpVersion}-fpm.sock|fcgi://localhost"\n`
    config += `    </FilesMatch>\n`
  }
  
  if (vhost.customDirectives) {
    config += `\n    # Custom Directives\n`
    config += `    ${vhost.customDirectives}\n`
  }
  
  config += `</VirtualHost>\n`
  
  if (vhost.sslEnabled) {
    config += `\n<VirtualHost *:443>\n`
    config += `    ServerName ${vhost.serverName}\n`
    
    if (vhost.serverAlias) {
      config += `    ServerAlias ${vhost.serverAlias}\n`
    }
    
    config += `    DocumentRoot ${vhost.documentRoot}\n`
    config += `\n    SSLEngine on\n`
    
    if (vhost.sslCertificate) {
      config += `    SSLCertificateFile ${vhost.sslCertificate}\n`
    }
    
    if (vhost.sslCertificateKey) {
      config += `    SSLCertificateKeyFile ${vhost.sslCertificateKey}\n`
    }
    
    if (vhost.sslCertificateChain) {
      config += `    SSLCertificateChainFile ${vhost.sslCertificateChain}\n`
    }
    
    if (vhost.hstsEnabled) {
      config += `    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"\n`
    }
    
    config += `</VirtualHost>`
    
    if (vhost.forceHttps) {
      config += `\n\n# Force HTTPS Redirect\n`
      config += `<VirtualHost *:80>\n`
      config += `    ServerName ${vhost.serverName}\n`
      if (vhost.serverAlias) {
        config += `    ServerAlias ${vhost.serverAlias}\n`
      }
      config += `    Redirect permanent / https://${vhost.serverName}/\n`
      config += `</VirtualHost>`
    }
  }
  
  return config
}

function copyConfig() {
  navigator.clipboard.writeText(configContent.value)
  $q.notify({
    type: 'positive',
    message: 'Configuração copiada para a área de transferência!'
  })
}

async function saveVhost() {
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
    // Gerar logs automáticos se não especificados
    if (!vhostForm.value.errorLog) {
      vhostForm.value.errorLog = `/var/log/apache2/${vhostForm.value.serverName}_error.log`
    }
    if (!vhostForm.value.accessLog) {
      vhostForm.value.accessLog = `/var/log/apache2/${vhostForm.value.serverName}_access.log`
    }
    
    // Gerar configuração do virtual host
    const config = generateVhostConfig(vhostForm.value)
    const configFileName = `${vhostForm.value.serverName}.conf`
    
    // Criar diretório do documento se não existir
    const createDirResult = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo mkdir -p ${vhostForm.value.documentRoot}`
    )
    
    if (!createDirResult.success) {
      throw new Error('Falha ao criar diretório do documento')
    }
    
    // Criar arquivo de configuração
    const createConfigResult = await window.electronAPI.executeCommand(
      currentConnection,
      `echo '${config.replace(/'/g, "'\"'\"'")}' | sudo tee /etc/apache2/sites-available/${configFileName} > /dev/null`
    )
    
    if (!createConfigResult.success) {
      throw new Error('Falha ao criar arquivo de configuração')
    }
    
    // Habilitar site se necessário
    if (vhostForm.value.enabled) {
      const enableResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo a2ensite ${configFileName} && sudo systemctl reload apache2`
      )
      
      if (!enableResult.success) {
        throw new Error('Falha ao habilitar virtual host')
      }
    }
    
    // Atualizar lista local
    if (editingIndex.value !== -1) {
      virtualHosts.value[editingIndex.value] = { ...vhostForm.value }
    } else {
      virtualHosts.value.push({ ...vhostForm.value })
    }
    
    closeVhostDialog()
    $q.notify({
      type: 'positive',
      message: 'Virtual Host salvo com sucesso!'
    })
    
    // Recarregar lista de virtual hosts
    await loadVirtualHosts()
    
  } catch (error) {
    console.error('Erro ao salvar Virtual Host:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar Virtual Host: ${error.message}`
    })
  } finally {
    saving.value = false
  }
}

async function toggleVhost(vhost) {
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
  
  vhost.loading = true
  try {
    const configFileName = `${vhost.serverName}.conf`
    const action = vhost.enabled ? 'a2dissite' : 'a2ensite'
    const command = `sudo ${action} ${configFileName} && sudo systemctl reload apache2`
    
    const result = await window.electronAPI.executeCommand(currentConnection, command)
    
    if (!result.success) {
      throw new Error(result.error || 'Comando falhou')
    }
    
    vhost.enabled = !vhost.enabled
    
    $q.notify({
      type: 'positive',
      message: `Virtual Host ${vhost.enabled ? 'habilitado' : 'desabilitado'} com sucesso!`
    })
  } catch (error) {
    console.error('Erro ao alterar status do Virtual Host:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao alterar status do Virtual Host: ${error.message}`
    })
  } finally {
    vhost.loading = false
  }
}

function deleteVhost(vhost) {
  $q.dialog({
    title: 'Confirmar exclusão',
    message: `Tem certeza que deseja excluir o Virtual Host "${vhost.serverName}"?`,
    cancel: true,
    persistent: true,
    class: 'bg-secondary text-primary'
  }).onOk(() => {
    const index = virtualHosts.value.findIndex(v => v.serverName === vhost.serverName)
    if (index !== -1) {
      virtualHosts.value.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Virtual Host excluído com sucesso!'
      })
    }
  })
}

async function loadVirtualHosts() {
  const globalConnection = window.currentActiveConnection
  
  if (!globalConnection) {
    virtualHosts.value = []
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
    // Buscar sites disponíveis no Apache
    const sitesAvailableResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /etc/apache2/sites-available/*.conf 2>/dev/null | head -20 || echo ""'
    )
    
    if (!sitesAvailableResult.success) {
      virtualHosts.value = []
      return
    }
    
    const siteFiles = sitesAvailableResult.output.trim().split('\n').filter(file => file.trim())
    const vhosts = []
    
    for (const siteFile of siteFiles) {
      if (!siteFile) continue
      
      const siteName = siteFile.replace('/etc/apache2/sites-available/', '').replace('.conf', '')
      
      // Verificar se o site está habilitado
      const enabledResult = await window.electronAPI.executeCommand(
        currentConnection,
        `test -L "/etc/apache2/sites-enabled/${siteName}.conf" && echo "enabled" || echo "disabled"`
      )
      
      const enabled = enabledResult.success && enabledResult.output.includes('enabled')
      
      // Ler configuração do virtual host
      const configResult = await window.electronAPI.executeCommand(
        currentConnection,
        `cat "${siteFile}" 2>/dev/null || echo ""`
      )
      
      if (!configResult.success) continue
      
      const config = configResult.output
      
      // Extrair informações básicas do virtual host
      const serverNameMatch = config.match(/ServerName\s+([^\s\n]+)/i)
      const serverAliasMatch = config.match(/ServerAlias\s+([^\n]+)/i)
      const documentRootMatch = config.match(/DocumentRoot\s+([^\s\n]+)/i)
      const portMatch = config.match(/<VirtualHost\s+[^:]*:(\d+)>/i)
      const errorLogMatch = config.match(/ErrorLog\s+([^\s\n]+)/i)
      const accessLogMatch = config.match(/CustomLog\s+([^\s\n]+)/i)
      
      // Detectar versão PHP
      const phpMatch = config.match(/php(\d+\.\d+)/i)
      
      // Detectar SSL
      const sslEnabled = config.includes('SSLEngine on')
      const sslCertMatch = config.match(/SSLCertificateFile\s+([^\s\n]+)/i)
      const sslKeyMatch = config.match(/SSLCertificateKeyFile\s+([^\s\n]+)/i)
      
      const vhost = {
        serverName: serverNameMatch ? serverNameMatch[1] : siteName,
        serverAlias: serverAliasMatch ? serverAliasMatch[1].trim() : '',
        documentRoot: documentRootMatch ? documentRootMatch[1] : '/var/www/html',
        port: portMatch ? parseInt(portMatch[1]) : 80,
        phpVersion: phpMatch ? phpMatch[1] : '8.1',
        enabled,
        sslEnabled,
        errorLog: errorLogMatch ? errorLogMatch[1] : '/var/log/apache2/error.log',
        accessLog: accessLogMatch ? accessLogMatch[1] : '/var/log/apache2/access.log',
        sslCertificate: sslCertMatch ? sslCertMatch[1] : '',
        sslCertificateKey: sslKeyMatch ? sslKeyMatch[1] : '',
        configFile: siteFile
      }
      
      vhosts.push(vhost)
    }
    
    virtualHosts.value = vhosts
    
  } catch (error) {
    console.error('Erro ao carregar Virtual Hosts:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar Virtual Hosts'
    })
  } finally {
    loading.value = false
  }
}

// Listener para mudanças de conexão
let connectionChangeHandler = null

onMounted(() => {
  loadVirtualHosts()
  
  // Adicionar listener para mudanças de conexão
  connectionChangeHandler = () => {
    loadVirtualHosts()
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
.font-mono {
  font-family: 'Courier New', monospace;
}
</style>