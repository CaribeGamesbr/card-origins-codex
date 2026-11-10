# Cadastro de cartas pelo proprietário

O menu **Adicionar carta** (`#register`) e os botões **+ Nova carta** no Deck e na configuração do planejador abrem a entrada do cadastro. A gravação depende de uma ativação inicial na conta do proprietário. Enquanto `card-admin-config.json` não contém o endereço do aplicativo privado, a página mostra **Ativação inicial pendente** e não afirma que salvou nada.

## Ativação inicial

1. Abra [Google Apps Script](https://script.google.com/home) com a conta que edita o documento do projeto. Crie um projeto chamado **Card Origins — Cadastro de cartas**. Se esse projeto já foi preparado nesta conversa, continue nele; não é necessário criar outro.
2. Copie todo o conteúdo de [Install.txt](../integrations/card-registration/Install.txt) para o arquivo `Código.gs` do projeto e salve. Esse instalador inclui a lógica e o formulário, sem credenciais. Não adicione também `Core.gs`, `Code.gs` ou `Index.html`: são os arquivos-fonte separados usados para gerar o instalador.
3. No GitHub, crie uma chave de acesso **fine-grained**, limitada ao repositório **CaribeGamesbr/card-origins-codex**, com **Contents: Read and write** e os metadados de leitura obrigatórios. Não conceda acesso a outros repositórios, administração ou workflows. Escolha um prazo de validade e renove a chave quando expirar.
4. No Apps Script, abra **Configurações do projeto → Propriedades do script**. Crie a propriedade `GITHUB_TOKEN` e coloque a chave no valor. Salve. Não coloque a chave no código, no GitHub, na página pública ou no chat. Uma propriedade opcional `OWNER_EMAIL` pode fixar explicitamente a conta proprietária; sem ela, o aplicativo exige que a conta ativa seja a mesma que executa a implantação.
5. Em **Implantar → Nova implantação**, escolha **Aplicativo da Web**, executar como **Eu**, acesso **Somente eu**. Revise as permissões do Google e autorize na sua conta. O aplicativo usa o serviço de documentos, seu e-mail para verificar o proprietário e solicitações ao GitHub. Não altere o acesso para público.
6. Abra o endereço `/exec` da implantação e clique em **Ativar cadastro no site**. Esse botão publica apenas o endereço protegido em `card-admin-config.json` e registra a ativação no documento. A chave permanece nas propriedades do script.
7. Quando o GitHub Pages terminar de publicar, abra **Adicionar carta → Conferir conexão** no Codex. A página passa a exibir **Abrir cadastro de nova carta**.

O projeto fornece também [appsscript.json](../integrations/card-registration/appsscript.json) com os escopos e o acesso privado esperados. Se instalar por ferramentas de desenvolvimento, preserve `executeAs: USER_DEPLOYING` e `access: MYSELF`. A interface de implantação deve continuar em **Somente eu**.

## Cadastrar uma carta

Preencha nome, borda, elemento, atributos, habilidade e descrição conforme o print ou o jogo. O print é opcional, aceita PNG/JPG/GIF/WebP e tem limite de 6 MB. Ele será publicado com o catálogo. Não há leitura automática do texto da imagem. Campos desconhecidos ficam em branco; os atributos e a habilidade só recebem marcação completa de transcrição quando todos os dados necessários foram preenchidos e confirmados pelo proprietário.

Escolha **Deck e Meu time no planejador**, **Somente Deck** ou **Somente catálogo**, e o slot de destino. Clique em **Salvar no GitHub e Google Docs** e aguarde o resultado de ambos. O botão **Usar carta no site** aparece depois da conclusão; se a variante já existir, o formulário preserva o registro original e permite usar a carta já catalogada.

O retorno para o Codex aguarda a publicação do catálogo. Quando a carta está disponível, atualiza apenas o slot escolhido. Se ela já estava em outro slot, troca as posições e os suportes vinculados em vez de criar uma repetição. O perfil pessoal do planejador conserva os pontos, reserva, objetivo, Path e talentos. O perfil do amigo e a formação independente do Infinite não são substituídos.

## Gravação e recuperação

- O servidor verifica o proprietário em cada chamada. Os destinos de gravação são fixos: este repositório, branch `main`, documento `1OyNn8YnWXBTg_gdTwFwT8xD4ktY789jeGpGpJWN6bR8`, aba `t.0`.
- O registro gera um identificador único e atualiza `catalog.json`, `data.js`, `catalogo.csv` e o cache do catálogo em `index.html` no mesmo commit. O print e o registro de origem ficam em `assets/cards/` e `docs/card-registrations/`.
- Antes de gravar, o servidor confere que `catalog.json` e `data.js` têm os mesmos registros. Alteração inesperada de formato interrompe o cadastro. Os registros anteriores e os outros arquivos são preservados pela árvore-base do commit.
- Uma variante de mesmo nome, borda, elemento e variantes não é sobrescrita silenciosamente. A alteração de nome ou classificação não é inferida a partir da imagem.
- Um marcador único no documento evita duplicação quando o mesmo cadastro é reenviado. Se o GitHub salvar e o documento falhar, a tela mostra o estado parcial e oferece **Concluir registro no Google Docs**, sem criar outra carta.
- As gravações no GitHub e no Docs pertencem a serviços diferentes e não formam uma transação única. A tela confirma cada destino separadamente; o registro não é apresentado como concluído enquanto o documento estiver pendente.
- Novas habilidades entram no catálogo como texto confirmado. Elas não recebem uma implementação de combate inventada. O planejador continua sendo um modelo de prioridades por sinergia e custo.

## Código e validação

Fontes do aplicativo privado: `integrations/card-registration/`. Para gerar o instalador de arquivo único, execute `node scripts/build-card-registration.js`.

`node scripts/test-card-registration.js` verifica dados desconhecidos, entradas inválidas, preservação dos registros, duplicidade, consistência JSON/JS, CSV, endereços aceitos, posicionamento no Deck, proteção do proprietário e repetição de gravação parcial. Esses testes usam serviços simulados; não comprovam uma gravação real nas contas. A ativação e o teste nas contas do proprietário devem ser verificados separadamente.

Documentação dos provedores: [aplicativos da web do Apps Script](https://developers.google.com/apps-script/guides/web), [chamadas do formulário ao servidor](https://developers.google.com/apps-script/guides/html/communication), [propriedades protegidas do script](https://developers.google.com/apps-script/guides/properties), [chaves de acesso do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
