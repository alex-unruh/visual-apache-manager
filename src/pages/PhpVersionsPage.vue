<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Header -->
      <div class="col-12">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h4 text-primary q-mb-sm">
              <q-icon name="code" class="q-mr-sm" style="color: var(--accent-orange)" />
              Versões PHP
            </div>
            <div class="text-subtitle1 text-secondary">
              Gerenciar versões PHP instaladas no servidor
            </div>
          </div>
          <div>
            <q-btn
              color="primary"
              icon="add"
              label="Instalar Nova Versão"
              @click="showInstallDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- PHP Versions Grid -->
      <div class="col-12">
        <div class="row q-gutter-md">
          <div
            v-for="version in phpVersions"
            :key="version.version"
            class="col-lg-4 col-md-6 col-sm-12"
          >
            <q-card class="bg-secondary php-version-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6 text-primary">
                    PHP {{ version.version }}
                    <span v-if="version.isDefault" class="text-positive" style="font-size: 12px">
                      <q-icon name="star" size="xs" style="top: -2px" /> Versão padrão
                    </span>
                  </div>
                  <q-chip
                    :color="getStatusColor(version.status)"
                    text-color="white"
                    size="sm"
                  >
                    {{ getStatusLabel(version.status) }}
                  </q-chip>
                </div>

                <div class="text-caption text-secondary q-mb-sm">
                  Instalado em: {{ version.installDate }}
                </div>

                <div class="text-body2 text-primary q-mb-md">
                  <div>
                    Caminho: {{ version.path }}
                  </div>
                </div>

                <div class="row items-center justify-between">
                  <div class="text-caption text-secondary">
                    {{ version.sitesCount }} site(s) usando
                  </div>

                  <q-btn-group>
                    <q-btn
                      v-if="!version.isDefault"
                      color="primary"
                      icon="star"
                      size="sm"
                      flat
                      @click="setAsDefault(version)"
                    >
                      <q-tooltip>Definir como padrão</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="primary"
                      icon="settings"
                      size="sm"
                      flat
                      @click="configurePhp(version)"
                    >
                      <q-tooltip>Configurar</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="primary"
                      icon="extension"
                      size="sm"
                      flat
                      @click="manageExtensions(version)"
                    >
                      <q-tooltip>Extensões</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="version.sitesCount === 0 && !version.isDefault"
                      color="negative"
                      icon="delete"
                      size="sm"
                      flat
                      @click="uninstallVersion(version)"
                    >
                      <q-tooltip>Desinstalar</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Install PHP Dialog -->
    <q-dialog v-model="showInstallDialog" persistent>
      <q-card style="min-width: 500px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">Instalar Nova Versão PHP</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <q-select
              v-model="selectedVersionToInstall"
              :options="availableVersions"
              label="Versão PHP"
              filled
              dense
              emit-value
              map-options
              dark
            />

            <q-checkbox
              v-model="installCommonExtensions"
              label="Instalar extensões comuns (curl, gd, mbstring, xml, zip)"
              color="primary"
            />

            <q-checkbox
              v-model="setAsDefaultAfterInstall"
              label="Definir como versão padrão após instalação"
              color="primary"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showInstallDialog = false" />
          <q-btn
            color="primary"
            label="Instalar"
            @click="installPhpVersion"
            :loading="installing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PHP Configuration Dialog -->
    <q-dialog v-model="showConfigDialog" persistent>
      <q-card style="min-width: 700px" class="bg-secondary">
        <q-card-section>
          <div class="text-h6 text-primary">
            Configurar PHP {{ selectedPhpVersion?.version }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-tabs v-model="configTab" class="text-primary">
            <q-tab name="ini" label="php.ini" />
            <q-tab name="fpm" label="PHP-FPM" />
            <q-tab name="info" label="Informações" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="configTab" animated>
            <q-tab-panel name="ini">
              <div class="q-gutter-md">
                <q-input
                  v-model="phpConfig.memory_limit"
                  label="Memory Limit"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="phpConfig.max_execution_time"
                  label="Max Execution Time"
                  type="number"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="phpConfig.upload_max_filesize"
                  label="Upload Max Filesize"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="phpConfig.post_max_size"
                  label="Post Max Size"
                  filled
                  dark
                  dense
                />
                <q-checkbox
                  v-model="phpConfig.display_errors"
                  label="Display Errors"
                  color="primary"
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="fpm">
              <div class="q-gutter-md">
                <q-input
                  v-model="fpmConfig.pm_max_children"
                  label="PM Max Children"
                  type="number"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="fpmConfig.pm_start_servers"
                  label="PM Start Servers"
                  type="number"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="fpmConfig.pm_min_spare_servers"
                  label="PM Min Spare Servers"
                  type="number"
                  filled
                  dense
                  dark
                />
                <q-input
                  v-model="fpmConfig.pm_max_spare_servers"
                  label="PM Max Spare Servers"
                  type="number"
                  filled
                  dense
                  dark
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="info">
              <div class="q-gutter-sm">
                <div><strong>Versão:</strong> {{ selectedPhpVersion?.version }}</div>
                <div><strong>Caminho:</strong> {{ selectedPhpVersion?.path }}</div>
                <div><strong>Arquivo de configuração:</strong> {{ selectedPhpVersion?.configPath }}</div>
                <div><strong>Extensões carregadas:</strong> {{ selectedPhpVersion?.loadedExtensions?.length || 0 }}</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showConfigDialog = false" />
          <q-btn
            color="primary"
            label="Salvar"
            @click="savePhpConfig"
            :loading="savingConfig"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const installing = ref(false)
const savingConfig = ref(false)
const showInstallDialog = ref(false)
const showConfigDialog = ref(false)
const selectedVersionToInstall = ref('')
const installCommonExtensions = ref(true)
const setAsDefaultAfterInstall = ref(false)
const selectedPhpVersion = ref(null)
const configTab = ref('ini')

const phpVersions = ref([])

const availableVersions = [
  { label: 'PHP 8.4', value: '8.4' },
  { label: 'PHP 8.3', value: '8.3' },
  { label: 'PHP 8.2', value: '8.2' },
  { label: 'PHP 8.1', value: '8.1' },
  { label: 'PHP 8.0', value: '8.0' },
  { label: 'PHP 7.4', value: '7.4' }
]

const phpConfig = ref({
  memory_limit: '128M',
  max_execution_time: 30,
  upload_max_filesize: '2M',
  post_max_size: '8M',
  display_errors: false
})

const fpmConfig = ref({
  pm_max_children: 50,
  pm_start_servers: 5,
  pm_min_spare_servers: 5,
  pm_max_spare_servers: 35
})

function getStatusColor(status) {
  switch (status) {
    case 'active': return 'positive'
    case 'inactive': return 'warning'
    case 'error': return 'negative'
    default: return 'grey'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'active': return 'Ativo'
    case 'inactive': return 'Inativo'
    case 'error': return 'Erro'
    default: return 'Desconhecido'
  }
}

async function setAsDefault(version) {
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
    // Configurar alternativas do sistema para PHP
    const setDefaultResult = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo update-alternatives --set php /usr/bin/php${version.version}`
    )

    if (!setDefaultResult.success) {
      throw new Error('Falha ao configurar versão padrão')
    }

    // Verificar se foi definido corretamente
    const verifyResult = await window.electronAPI.executeCommand(
      currentConnection,
      'php -v | head -n1'
    )

    if (verifyResult.success && verifyResult.output.includes(version.version)) {
      // Recarregar lista para atualizar status
      await loadPhpVersions()

      $q.notify({
        type: 'positive',
        message: `PHP ${version.version} definido como versão padrão!`,

      })
    } else {
      throw new Error('Versão não foi definida corretamente como padrão')
    }

  } catch (error) {
    console.error('Erro ao definir versão padrão:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao definir versão padrão: ${error.message}`
    })
  }
}

function configurePhp(version) {
  selectedPhpVersion.value = version
  showConfigDialog.value = true
}

function manageExtensions(version) {
  // Navegar para página de extensões PHP com filtro da versão
  router.push(`/php-extensions?version=${version.version}`)
}

async function uninstallVersion(version) {
  $q.dialog({
    title: 'Confirmar desinstalação',
    message: `Tem certeza que deseja desinstalar PHP ${version.version}?`,
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
      // Desinstalar PHP e suas extensões
      const uninstallResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo apt remove --purge -y php${version.version}*`
      )

      if (!uninstallResult.success) {
        throw new Error('Falha ao desinstalar PHP')
      }

      // Limpar pacotes órfãos
      await window.electronAPI.executeCommand(
        currentConnection,
        'sudo apt autoremove -y'
      )

      // Recarregar lista de versões
      await loadPhpVersions()

      $q.notify({
        type: 'positive',
        message: `PHP ${version.version} desinstalado com sucesso!`
      })

    } catch (error) {
      console.error('Erro na desinstalação:', error)
      $q.notify({
        type: 'negative',
        message: `Erro ao desinstalar PHP: ${error.message}`
      })
    }
  })
}

async function installPhpVersion() {
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

  installing.value = true
  try {
    const version = selectedVersionToInstall.value

    // Atualizar repositórios
    const updateResult = await window.electronAPI.executeCommand(
      currentConnection,
      'sudo apt update'
    )

    if (!updateResult.success) {
      throw new Error('Falha ao atualizar repositórios')
    }

    // Instalar PHP
     let installCommand = `sudo apt install -y php${version} php${version}-cli php${version}-fpm`

     if (installCommonExtensions.value) {
       installCommand += ` php${version}-curl php${version}-gd php${version}-mbstring php${version}-mysql php${version}-xml php${version}-zip`
     }

    const installResult = await window.electronAPI.executeCommand(
      currentConnection,
      installCommand
    )

    if (!installResult.success) {
      throw new Error('Falha na instalação do PHP')
    }

    // Verificar se a instalação foi bem-sucedida
    const verifyResult = await window.electronAPI.executeCommand(
      currentConnection,
      `php${version} -v`
    )

    if (!verifyResult.success) {
      throw new Error('PHP instalado mas não está funcionando corretamente')
    }

    // Definir como padrão se solicitado
    if (setAsDefaultAfterInstall.value) {
      const defaultResult = await window.electronAPI.executeCommand(
        currentConnection,
        `sudo update-alternatives --set php /usr/bin/php${version}`
      )

      if (!defaultResult.success) {
        console.warn('Falha ao definir como versão padrão')
      }
    }

    // Recarregar lista de versões
    await loadPhpVersions()

    showInstallDialog.value = false

    $q.notify({
      type: 'positive',
      message: `PHP ${version} instalado com sucesso!`
    })

  } catch (error) {
    console.error('Erro na instalação:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao instalar PHP: ${error.message}`
    })
  } finally {
    installing.value = false
  }
}

async function savePhpConfig() {
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
    const version = selectedPhpVersion.value.version
    const phpIniPath = `/etc/php/${version}/apache2/php.ini`
    const fpmConfigPath = `/etc/php/${version}/fpm/pool.d/www.conf`

    // Salvar configurações do php.ini
    const phpIniCommands = [
      `sudo sed -i 's/^memory_limit = .*/memory_limit = ${phpConfig.value.memory_limit}/' ${phpIniPath}`,
      `sudo sed -i 's/^max_execution_time = .*/max_execution_time = ${phpConfig.value.max_execution_time}/' ${phpIniPath}`,
      `sudo sed -i 's/^upload_max_filesize = .*/upload_max_filesize = ${phpConfig.value.upload_max_filesize}/' ${phpIniPath}`,
      `sudo sed -i 's/^post_max_size = .*/post_max_size = ${phpConfig.value.post_max_size}/' ${phpIniPath}`,
      `sudo sed -i 's/^display_errors = .*/display_errors = ${phpConfig.value.display_errors ? 'On' : 'Off'}/' ${phpIniPath}`
    ]

    for (const command of phpIniCommands) {
      const result = await window.electronAPI.executeCommand(currentConnection, command)
      if (!result.success) {
        throw new Error(`Falha ao executar: ${command}`)
      }
    }

    // Salvar configurações do PHP-FPM
    const fpmCommands = [
      `sudo sed -i 's/^pm.max_children = .*/pm.max_children = ${fpmConfig.value.pm_max_children}/' ${fpmConfigPath}`,
      `sudo sed -i 's/^pm.start_servers = .*/pm.start_servers = ${fpmConfig.value.pm_start_servers}/' ${fpmConfigPath}`,
      `sudo sed -i 's/^pm.min_spare_servers = .*/pm.min_spare_servers = ${fpmConfig.value.pm_min_spare_servers}/' ${fpmConfigPath}`,
      `sudo sed -i 's/^pm.max_spare_servers = .*/pm.max_spare_servers = ${fpmConfig.value.pm_max_spare_servers}/' ${fpmConfigPath}`
    ]

    for (const command of fpmCommands) {
      const result = await window.electronAPI.executeCommand(currentConnection, command)
      if (!result.success) {
        throw new Error(`Falha ao executar: ${command}`)
      }
    }

    // Reiniciar serviços
    const restartResult = await window.electronAPI.executeCommand(
      currentConnection,
      `sudo systemctl restart php${version}-fpm && sudo systemctl reload apache2`
    )

    if (!restartResult.success) {
      throw new Error('Falha ao reiniciar serviços')
    }

    showConfigDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Configuração salva com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    $q.notify({
      type: 'negative',
      message: `Erro ao salvar configurações: ${error.message}`
    })
  } finally {
    savingConfig.value = false
  }
}

async function loadPhpVersions() {
  const globalConnection = window.currentActiveConnection

  if (!globalConnection) {
    phpVersions.value = []
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
    // Buscar versões PHP instaladas
    const versionsResult = await window.electronAPI.executeCommand(
      currentConnection,
      'ls /usr/bin/php* 2>/dev/null | grep -E "php[0-9]+\\.[0-9]+$" | sort -V || echo ""'
    )

    if (!versionsResult.success || !versionsResult.output.trim()) {
      phpVersions.value = []
      return
    }

    const versionPaths = versionsResult.output.trim().split('\n').filter(path => path.trim())
    const versions = []

    for (const path of versionPaths) {
      const versionMatch = path.match(/php([0-9]+\.[0-9]+)$/)
      if (!versionMatch) continue

      const version = versionMatch[1]

      // Verificar se a versão está ativa
      const statusResult = await window.electronAPI.executeCommand(
        currentConnection,
        `${path} -v 2>/dev/null && echo "active" || echo "inactive"`
      )

      const status = statusResult.success && statusResult.output.includes('active') ? 'active' : 'inactive'

      // Verificar se é a versão padrão
      const defaultResult = await window.electronAPI.executeCommand(
        currentConnection,
        'php -v 2>/dev/null | head -n1 | grep -o "PHP [0-9]\\.[0-9]" | cut -d" " -f2 || echo ""'
      )

      const isDefault = defaultResult.success && defaultResult.output.trim() === version

      // Buscar extensões carregadas
      const extensionsResult = await window.electronAPI.executeCommand(
        currentConnection,
        `${path} -m 2>/dev/null | grep -v "\\[" | sort || echo ""`
      )

      const loadedExtensions = extensionsResult.success ?
        extensionsResult.output.trim().split('\n').filter(ext => ext.trim()) : []

      versions.push({
        version,
        status,
        installDate: 'N/A', // Difícil de determinar via SSH
        path,
        configPath: `/etc/php/${version}/apache2/php.ini`,
        isDefault,
        sitesCount: 0, // Seria necessário analisar configurações do Apache
        loadedExtensions
      })
    }

    phpVersions.value = versions

  } catch (error) {
    console.error('Erro ao carregar versões PHP:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar versões PHP'
    })
  } finally {
    loading.value = false
  }
}

// Listener para mudanças de conexão
let connectionChangeHandler = null

onMounted(() => {
  loadPhpVersions()

  // Adicionar listener para mudanças de conexão
  connectionChangeHandler = () => {
    loadPhpVersions()
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
.php-version-card {
  transition: transform 0.2s ease;
}

.php-version-card:hover {
  transform: translateY(-2px);
}
</style>
