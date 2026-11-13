# Meu espaço de estudos

Esta pasta contém uma aplicação web estática, sem dependências externas. No site, ela fica disponível em `/estudos/`. Para executar localmente, inicie um servidor na raiz do repositório (`python -m http.server 8000`) e abra `http://localhost:8000/estudos/`. As aulas, cursos, progresso, configuração do Pomodoro e tempos focados ficam no armazenamento local desse navegador e perfil.

## Estrutura

- `index.html`: estrutura da página.
- `assets/css/app.css`: estilos visuais.
- `js/state.js`: referências da interface, chaves de armazenamento e estado compartilhado.
- `js/courses.js` e `js/persistence.js`: cursos, aulas e persistência local.
- `js/pomodoro.js`: timer, áudio e registro de foco.
- `js/sharing.js`: geração do cartão de progresso.
- `js/backup.js`: importação e exportação JSON.
- `js/ui.js`, `js/theme-sync.js` e `js/utilities.js`: renderização, eventos, tema, sincronização e utilitários.
- `js/app.js`: inicialização e conexão dos componentes.

## Uso

- Crie um curso pelo botão **+ Novo** no formulário e adicione as aulas. O nome do curso pode ser alterado no cabeçalho do grupo de aulas; a renomeação preserva o histórico de foco.
- Informe um módulo para agrupar as aulas. Use as setas no cabeçalho do módulo para reordenar módulos e as setas de cada aula para mudar a ordem dentro do módulo.
- No Pomodoro, selecione o curso antes de iniciar o foco. O tempo de foco é somado ao curso selecionado; pausas não entram no total.
- O timer é pausado ao fechar ou recarregar a página. Se o navegador suspender a página por um período longo, ele pausa ao retornar para evitar contar tempo fora da sessão.
- Cada curso mostra a porcentagem de aulas concluídas. **Compartilhar** gera um cartão PNG quadrado ou vertical com essa porcentagem, as aulas concluídas e o tempo focado.
- **Apagar lista** remove todos os cursos, aulas e tempos focados. As configurações do Pomodoro permanecem salvas.

## Cópias de segurança

Use **Exportar JSON** para salvar cursos e aulas em um formato simples. Cada curso tem `nome` e `aulas`; cada aula tem `titulo`, `modulo`, `link` e `anotacoes`. O estado de conclusão das aulas, tempos focados e configurações do Pomodoro não entram nessa exportação. **Baixar modelo** gera um exemplo preenchível. **Importar JSON** acrescenta cursos e aulas à lista atual; cursos com o mesmo nome são agrupados e aulas repetidas (mesmo título, módulo e link) são ignoradas. As aulas importadas começam como não assistidas, sem alterar o progresso das aulas existentes. Arquivos de cópia antigos do app continuam aceitos como fonte de cursos e aulas. Mantenha o arquivo JSON fora desta pasta se quiser preservá-lo após limpar o navegador.

Os dados não são sincronizados entre navegadores ou perfis. A planilha em `outputs/telegram-video-tracker` é um artefato inicial separado e não sincroniza com a página.
