# Alchemy-BotList

Um sistema completo para gerenciamento e análise de bots Discord, desenvolvido para comunidades que precisam de um processo estruturado de avaliação antes de aprovar novos bots em seus servidores.

## Sobre o Projeto

Este sistema automatiza o processo de submissão, teste e aprovação de bots Discord. Quando um usuário solicita a adição de um bot, o sistema cria automaticamente um ambiente de teste isolado onde a equipe pode avaliar todas as funcionalidades antes de tomar uma decisão final.

O bot suporta tanto comandos slash quanto comandos com prefixo, oferecendo flexibilidade para diferentes preferências de uso. Todos os dados são armazenados localmente em formato JSON, garantindo simplicidade na manutenção e backup.

## Principais Funcionalidades

**Sistema de Fila Inteligente**
O sistema mantém uma fila organizada de todos os bots aguardando análise, permitindo que a equipe processe as solicitações de forma sistemática.

**Ambiente de Teste Dedicado**
Para cada bot submetido, é criado automaticamente um tópico específico onde toda a análise acontece de forma isolada e organizada.

**Controle de Acesso**
Os comandos de aprovação e reprovação funcionam exclusivamente dentro dos tópicos de teste, evitando execuções acidentais em locais inadequados.

**Interface Dual**
Todos os comandos estão disponíveis tanto como slash commands quanto como comandos tradicionais com prefixo, atendendo diferentes preferências de uso.

## Comandos Disponíveis

| Comando | Formato Slash | Formato Prefixo | Funcionalidade |
|---------|---------------|-----------------|----------------|
| add | `/add` | `.add` | Inicia o processo de submissão de um novo bot |
| lista | `/lista` | `.lista` | Exibe a fila atual de bots aguardando análise |
| aprovar | `/aprovar` | `.aprovar` | Aprova o bot em teste (apenas em tópicos) |
| reprovar | `/reprovar` | `.reprovar` | Rejeita o bot em teste (apenas em tópicos) |

## Configuração Completa

### Pré-requisitos

Antes de começar, certifique-se de ter:
- Node.js versão 16 ou superior instalado
- Um bot Discord criado no Discord Developer Portal
- Permissões adequadas no servidor onde o bot será usado

### Obtenção das Credenciais

**Token do Bot:**
1. Acesse o Discord Developer Portal
2. Selecione sua aplicação
3. Vá para a seção "Bot"
4. Copie o token (mantenha-o seguro)

**Client ID:**
1. Na mesma aplicação, vá para "General Information"
2. Copie o "Application ID"

**Guild ID (Opcional):**
1. Ative o modo desenvolvedor no Discord
2. Clique com o botão direito no seu servidor
3. Selecione "Copiar ID"

### Configuração do Arquivo

Crie um arquivo `config.js` na raiz do projeto baseado no exemplo fornecido:

```javascript
module.exports = {
    token: 'implemente o token aqui',
    clientId: 'coloca o id aqui do client aqui',
    guildId: 'id do server (opcional)'
};
```

**Nota sobre Guild ID:** Se você fornecer o Guild ID, os comandos serão registrados apenas nesse servidor específico (mais rápido para testes). Se omitir, os comandos serão registrados globalmente (pode levar até 1 hora para aparecer).

### Permissões Necessárias

O bot precisa das seguintes permissões no servidor:
- Enviar mensagens
- Gerenciar tópicos
- Usar comandos slash
- Ler histórico de mensagens
- Adicionar reações

## Instalação e Execução

```bash
# Clone ou baixe o projeto
# Navegue até a pasta do projeto

# Instale as dependências
npm install

# Configure o arquivo config.js conforme explicado acima

# Execute o bot
node index.js
```

Se tudo estiver configurado corretamente, você verá mensagens confirmando a conexão do bot e o registro dos comandos.

## Como Usar

**Adicionando um Bot:**
1. Use `.add` ou `/add` em qualquer canal onde o bot tenha permissão
2. Forneça o ID do bot quando solicitado
3. Um tópico será criado automaticamente para teste

**Testando e Decidindo:**
1. Entre no tópico criado para o bot
2. Teste todas as funcionalidades necessárias
3. Use `.aprovar` ou `.reprovar` quando finalizar a análise
4. O tópico será arquivado automaticamente

**Acompanhando a Fila:**
- Use `.lista` ou `/lista` para ver todos os bots aguardando análise

## Solução de Problemas

**O bot não conecta:**
- Verifique se o token está correto no config.js
- Confirme se o bot está ativo no Developer Portal

**Comandos não aparecem:**
- Aguarde alguns minutos após a primeira execução
- Se usar Guild ID, os comandos aparecem instantaneamente
- Sem Guild ID, pode levar até 1 hora

**Erro de permissões:**
- Verifique se o bot tem as permissões necessárias no servidor
- Confirme se o bot consegue criar tópicos no canal usado

## Manutenção

O sistema armazena todos os dados no arquivo `database/queue.json`. Para fazer backup, simplesmente copie este arquivo. Para limpar dados antigos, você pode editar manualmente o arquivo ou resetá-lo para `{"bots": [], "topics": {}}`.

O sistema é projetado para ser robusto e lidar com a maioria dos erros automaticamente, registrando problemas no console para facilitar a manutenção.
