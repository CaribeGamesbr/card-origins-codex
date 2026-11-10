# Cadastro automático retirado em 10/11/2026

**Este recurso está desativado a pedido do proprietário.** O menu, os botões de nova carta, o carregamento do leitor e a ligação com o formulário privado foram removidos do site. As novas cartas serão enviadas pelo chat para transcrição manual e registro no GitHub e no Google Docs. O catálogo de 419 registros, seus prints e os times foram preservados. A implantação privada foi arquivada; o projeto e seu código histórico não foram apagados.

As instruções abaixo descrevem a implementação anterior e não devem ser usadas como indicação de que o recurso está ativo.

## Experimento privado com Gemini — 10/11/2026

O proprietário configurou `GEMINI_API_KEY` nas propriedades protegidas do mesmo projeto. O novo instalador usa visão da API do Gemini no servidor: a chave não é enviada ao navegador, incluída no código público ou colocada em URLs. `GeminiClient.js` substitui o leitor OCR no bundle experimental; `Reader.js` permanece apenas no histórico. O modelo pode ser escolhido pela propriedade `GEMINI_MODEL`.

O teste de conexão consultou a API com sucesso, mas **as três tentativas reais de leitura de imagem retornaram HTTP 503**, em `gemini-3.8-flash` (duas) e `gemini-3.5-flash` (uma). Portanto, a extração visual ainda não foi validada. O menu público permanece removido, `card-admin-config.json` permanece desativado e a implantação publicada continua arquivada. O acesso de desenvolvimento pertence apenas ao proprietário. Nenhuma carta foi salva por essas tentativas e nenhum faturamento foi ativado.

O envio de imagem usa a cota da conta Gemini, separada desta conversa. O aplicativo limita as tentativas a 30 por dia, reutiliza respostas bem-sucedidas do mesmo print por 30 minutos e não repete chamadas nem troca de modelo automaticamente. Isso não é uma garantia de gratuidade, disponibilidade ou qualidade igual à interpretação do assistente.

O contrato de leitura exige transcrição literal do texto visível e tradução fiel para português. Atributos ausentes ou ambíguos ficam vazios; habilidades cortadas não são completadas. Edições manuais são preservadas e o proprietário precisa revisar antes de salvar no GitHub e no documento. Os testes locais verificam esse contrato, limites e preservação de dados usando respostas simuladas; não substituem uma leitura bem-sucedida na API real.

O próximo passo para reativação é obter e conferir uma leitura real, atualizar uma implantação privada e restaurar os pontos de entrada do site de forma explícita. Não reativar com base apenas no teste de conexão.

---

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

Preencha nome, borda, elemento, atributos, habilidade e descrição conforme o print ou o jogo. O print é opcional, aceita PNG/JPG/GIF/WebP e tem limite de 6 MB. Ele será publicado com o catálogo. O print inicia a leitura automática no navegador. Também é possível colar com Ctrl + V, arrastar para a prévia, repetir a leitura e ajustar a área da carta. Campos desconhecidos ficam em branco; os atributos e a habilidade só recebem marcação completa de transcrição quando todos os dados necessários foram preenchidos e confirmados pelo proprietário.

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


## Preenchimento automático pelo print (10/11/2026)

O formulário usa Tesseract.js 6.0.1 localmente no navegador. A imagem não é enviada a uma API de inteligência artificial para extração. O leitor baixa seus arquivos públicos e o modelo de inglês na primeira utilização. Não exige outra chave, mas precisa de internet para esse primeiro carregamento.

São lidas separadamente as áreas de nome, identificação, habilidade e atributos. Em prints largos do visualizador do jogo, a seleção inicial tenta enquadrar a carta central; use Ajustar área se necessário. A leitura não traduz nem interpreta a habilidade: o texto reconhecido mantém o idioma do print. A aparência das cartas, contornos, texto pequeno, cortes e compressão podem produzir letras e números errados. Todos os campos precisam ser conferidos antes do salvamento.

Quando a imagem é idêntica a um print já transcrito e confirmado, hashes SHA-256 dos bytes ou dos pixels permitem recuperar o registro existente sem tentar adivinhar letras. Isso só funciona para imagens com fingerprint cadastrado; uma foto parecida ou outra variante não é aceita como correspondência. Novos cadastros passam a guardar o hash dos bytes do print para repetições futuras.

Os campos preenchidos automaticamente ficam destacados. Alterações manuais são preservadas, inclusive durante uma leitura em andamento. Trocar de print remove sugestões anteriores que não foram editadas, para não carregar HP ou habilidade de outra carta. Nenhuma caixa de confirmação é marcada automaticamente. Erros de carregamento e tempos excessivos liberam o preenchimento manual; o botão de salvar aguarda o término da leitura.

Suportes podem ser selecionados ou detectados no print. Campos de HP/DMG e elemento ficam desativados para suportes; borda/raridade e tipo de suporte permanecem separados quando confirmados. Suportes retornam ao catálogo e não substituem cartas principais nos slots. Duplicatas são identificadas por variante ou por imagem idêntica, preservando o registro existente.

Validação: `node scripts/test-card-reader.js` e `node scripts/test-card-registration.js` cobrem ausência de dados, números ambíguos, preservação de edições, área de recorte, identidade de suportes e deduplicação pelo print. Conferência real do formulário e limites da leitura são registrados no Google Docs.

Referência técnica primária: [API do Tesseract.js](https://github.com/naptha/tesseract.js/blob/master/docs/api.md).
