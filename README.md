# Visual Apache Manager

Um gerenciador visual moderno e intuitivo para servidores Apache, desenvolvido com Vue.js 3, Quasar Framework e Electron.

## 📋 Funcionalidades

### 🔌 Gerenciamento de Conexões
- Conexão SSH segura com servidores remotos
- Gerenciamento de múltiplas conexões
- Interface intuitiva para configuração de credenciais

### 🌐 Gerenciamento de Sites
- Criação e edição de sites Apache
- Configuração automática de Virtual Hosts
- Habilitação/desabilitação de sites
- Suporte a SSL/HTTPS
- Configuração de Document Root e portas

### 🏠 Virtual Hosts
- Editor visual de Virtual Hosts
- Geração automática de configurações Apache
- Suporte completo a SSL com certificados
- Configurações avançadas (HSTS, redirecionamento HTTPS)
- Preview da configuração gerada

### 🐘 Gerenciamento PHP
- **Versões PHP**: Visualização e configuração de múltiplas versões
- **Extensões PHP**: Habilitação/desabilitação de extensões
- **Configurações**: Editor para php.ini e PHP-FPM
- Instalação de novas extensões
- Monitoramento de status das versões

### 🧩 Módulos Apache
- Visualização de módulos instalados
- Habilitação/desabilitação de módulos
- Informações detalhadas sobre dependências
- Filtros por categoria e status

### 📊 Logs
- Visualização em tempo real de logs Apache
- Suporte a Error Log, Access Log e PHP Error Log
- Filtros por nível de log e site
- Download e limpeza de logs
- Auto-refresh configurável

## 🚀 Tecnologias

- **Frontend**: Vue.js 3 + Composition API
- **UI Framework**: Quasar Framework
- **Desktop**: Electron
- **Comunicação**: SSH2 para conexões remotas
- **Estilo**: SCSS com tema dark/light

## 📦 Instalação

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Git

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/visual-apache-manager.git
   cd visual-apache-manager
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn
   ```

3. **Instale as dependências do Electron**
   ```bash
   cd src-electron
   npm install
   cd ..
   ```

### 🔧 Desenvolvimento

**Modo de desenvolvimento (Hot Reload)**
```bash
quasar dev
# ou para Electron
quasar dev -m electron
```

**Build para produção**
```bash
quasar build
# ou para Electron
quasar build -m electron
```

**Lint e formatação**
```bash
# Verificar código
npm run lint
# ou
yarn lint

# Formatar código
npm run format
# ou
yarn format
```

## 🖥️ Uso

1. **Primeira Execução**
   - Abra o aplicativo
   - Configure uma nova conexão SSH
   - Teste a conectividade

2. **Gerenciamento de Sites**
   - Acesse a aba "Sites"
   - Clique em "Novo Site" para criar
   - Configure domínio, Document Root e versão PHP

3. **Configuração PHP**
   - Vá para "PHP Versions" para configurar php.ini
   - Use "PHP Extensions" para gerenciar extensões

4. **Monitoramento**
   - Acesse "Logs" para visualizar logs em tempo real
   - Configure auto-refresh para monitoramento contínuo

## 🔒 Segurança

- Todas as conexões SSH são criptografadas
- Credenciais são armazenadas localmente de forma segura
- Comandos executados com validação de entrada
- Suporte a autenticação por chave SSH

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/seu-usuario/visual-apache-manager/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Sistema operacional e versão
- Screenshots (se aplicável)

## 📞 Suporte

Para suporte e dúvidas:

- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/visual-apache-manager/issues)
- 📖 Wiki: [Documentação](https://github.com/seu-usuario/visual-apache-manager/wiki)

---

**Desenvolvido com ❤️ para simplificar o gerenciamento de servidores Apache**

### Configuração do Quasar
Veja [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) para mais detalhes sobre configuração.
