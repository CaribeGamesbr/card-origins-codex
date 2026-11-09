(() => {
'use strict';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>e(s).replace(/\n/g,'<br>');
const card=(name,description,meta='')=>'<article class="mc-card"><header><strong>'+e(name)+'</strong>'+(meta?'<small>'+e(meta)+'</small>':'')+'</header><p>'+fmt(description)+'</p></article>';
const grid=items=>'<div class="mc-cards">'+items.map(x=>card(...x)).join('')+'</div>';
const para=s=>'<p class="mc-prose">'+fmt(s)+'</p>';
const strip=(label,text)=>'<div class="mc-strip"><strong>'+e(label)+'</strong><span>'+fmt(text)+'</span></div>';
const table=(headers,rows)=>'<div class="mc-table-scroll"><table class="mc-table"><thead><tr>'+headers.map(x=>'<th>'+e(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+fmt(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const header=(name,sub)=>'<div class="mc-heading"><span>CODEX / GUIA DO JOGO</span><h2>'+e(name)+'</h2>'+(sub?'<p>'+e(sub)+'</p>':'')+'</div>';
const colosseumSections={
'Visão geral':()=>{
 const cards=[
 ['1 · Monte o time','São 4 slots. Cada um oferece 4 cartas aleatórias: escolha 1 por slot. Sua coleção não determina as opções do draft.','DRAFT'],
 ['2 · Todos lutam nivelados','Cada carta entra com 1.000 HP e 500 DMG, independentemente da borda ou raridade; Blessings e Supports distinguem as builds.','STATS EQUALIZADOS'],
 ['3 · Progrida pelas waves','Dano e HP restante persistem; sobreviventes curam um pouco após cada vitória e cartas derrotadas permanecem fora. Blessings e Elite Dice fortalecem a equipe.','14 WAVES'],
 ['4 · Receba durante a run','Cada wave limpa paga imediatamente. A wave 14 é contra um Champion. Se Endless estiver ativado, é possível continuar após o Champion com waves mais difíceis.','BANK AS YOU GO']
 ];return header('Como funciona o Colosseum','Gauntlet de 14 waves com um Champion na última luta.')+grid(cards)+strip('Elite Dice','Após waves 3, 6, 9 e 12.')+strip('Seu registro na captura','303 runs, 145 full clears, melhor wave 14/14, streak +15%, Protection 2/2. Valores são do print, não do jogo em geral.');
},
'Colosseum Decks':()=>header('Quatro decks separados','Não alteram suas equipes normais de Infinite, Bosses ou Tower.')+grid([
 ['Decks 1–4','Quatro decks próprios para Colosseum, salvos automaticamente. A equipe marcada “IN USE” será usada ao entrar.'],
 ['Editar cartas','Toque no deck no lobby; toque numa carta para adicionar no slot selecionado ou primeiro slot livre. Para substituir, escolha o slot e depois a carta. X vermelho remove. “Auto-fill Best” usa as quatro cartas mais poderosas.'],
 ['Cópias','Pode adicionar a mesma carta até a quantidade de cópias do mesmo border que possui; duas cópias Normal permitem duas no deck.'],
 ['Travamento da run','Quatro slots devem estar preenchidos; durante a run, alterações no deck só afetam a próxima entrada. Carta vendida/fundida aparece como NOT OWNED.'],
 ['Power registrado','Power é a soma de HP+DMG das quatro cartas, incluindo Songstress Power Up; isso não substitui os stats equalizados das batalhas.']
 ]),
'Elementos':()=>{
 const rows=[
 ['Fire','2,5%','Burn por 2 turnos; não funciona contra Wind.'],
 ['Ice','2,5%','Adiciona 1 stack Frostbite; não funciona contra Fire.'],
 ['Lightning','2,5%','Chain causa 2,5% do DMG por passo de borda ao próximo inimigo; não funciona contra Ice.'],
 ['Wind','2,5%','Bleed por 2 turnos; não funciona contra Lightning.'],
 ['Quantum','0,5%','Ataque extra imediato; não funciona contra Physical.'],
 ['Imaginary','2,5%','Reduz permanentemente DMG do alvo em 5% (+0,5% por passo de borda), uma vez por alvo; não funciona contra Quantum.'],
 ['Physical','1%','No começo da wave, chance de ganhar +5% DMG (+0,5% por passo de borda) durante a wave; não funciona contra Imaginary.']
 ];return header('Elementos e vantagens','No Colosseum os efeitos elementais seguem chances-base específicas.')+strip('Ciclo 1','Fire → Ice → Lightning → Wind → Fire')+strip('Ciclo 2','Quantum → Imaginary → Physical → Quantum')+strip('Vantagem','+50% DMG contra elemento dominado; −30% contra elemento que domina você. Entre ciclos diferentes, matchup neutro. Champions não têm elemento.')+table(['Elemento','Chance Normal','Efeito'],rows)+strip('Multiplicador da chance','Guia do Colosseum: Normal ×1, Calamity ×2, Umbral ×3, Astral ×4, Origin ×5. O print não detalha Paradox nesta tabela; não confundir com multiplicadores de outros modos.');
},
'Debuffs':()=>{
 const list=[
 ['Burn','7,5% do DMG do aplicador a cada turno, ignorando Damage Reduction. Como Devil Play curse, 4% Max HP por turno por 3 turnos.'],
 ['Poison','Reduz 15% DMG imediatamente; a partir do 3º turno causa 10% Max HP por turno. Dura 4 turnos.'],
 ['Bleed','Cada turno: 75% de chance de sofrer 7,5% Max HP; caso contrário, aplica bandage e perde 5% DMG.'],
 ['Frostbite','Até 3 stacks: corta Max HP (2%/3%/5%) e aumenta dano recebido em +5% por stack. Com 3 stacks congela e perde turnos alternados; dura toda a wave.'],
 ['Shock','−5% DMG e Stun ao aplicar. Regra Colosseum: 25% chance de perder turno a cada turno, por 2 turnos.'],
 ['Stun','Perde o próximo turno.'],
 ['Fatigue','−10% DMG causado e +10% dano recebido, durante 3 turnos.'],
 ['Blinding','40% de chance de errar seus ataques durante 2 turnos.'],
 ['Charmed','A cada turno pode atacar um aliado próprio (chance inicial 7,5%, até 30%); dura toda a wave.'],
 ['Confusion','30% de chance, a cada turno, de atingir a si próprio por 50% do DMG em vez de atacar; dura 2 turnos.'],
 ['Lifeleech','Até 3 stacks; cada um drena 4% Max HP e cura quem aplicou (ou dá shield se estiver cheio).'],
 ['Immolation','Até 2 stacks; causa 7,5% Max HP por stack por turno, metade contra Champions.']
 ];return header('Debuffs do Colosseum','Eles também surgem de efeitos elementais, Devil Play, Champions e reações.')+grid(list)+strip('Quando os efeitos avançam','Ticks acontecem no início do turno da carta afetada, só contam durante a batalha dela, e todos limpam quando a wave acaba.')+strip('Imunidade','Status Immunity (Sacred Blessing) e Man of Men bloqueiam todos os debuffs.');
},
'Reações':()=>{
 const reactionRows=[
 ['Blinding Impact','Blinding + Stun','+15% chance de Stun no próximo hit sofrido.'],
 ['Blindside','Blinding + Bleed','5% Max HP; próximo ataque contra o alvo +10%.'],
 ['Blood Feast','Bleed + Lifeleech','Próximo Lifeleech drena +7,5% Max HP.'],
 ['Blood Freeze','Lifeleech + Frostbite','5% Max HP e +1 stack Frostbite.'],
 ['Blood in the Eyes','Bleed + Blinding','40% chance de errar próximo turno.'],
 ['Burning Exhaustion','Fatigue + Immolation','5% Max HP e +1 stack Immolation.'],
 ['Captivated','Stun + Charmed','+15% chance de Charmed no próximo hit sofrido.'],
 ['Chilled Heart','Charmed + Frostbite','+1 Frostbite; alvo sofre +10% dano por um turno.'],
 ['Cold Ambush','Blinding + Frostbite','+1 Frostbite; próximo ataque causa +10%.'],
 ['Collapse','Fatigue + Stun','+15% chance de Stun no próximo hit sofrido.'],
 ['Deep Freeze','Frostbite + Stun','+15% chance de Stun no próximo hit; −1 Frostbite.'],
 ['Disorientation','Blinding + Fatigue','Alvo causa 5% menos dano por um turno.'],
 ['Drained Strength','Lifeleech + Fatigue','Alvo causa 15% menos dano por um turno; aplicador cura 5% Max HP.'],
 ['Draining Current','Lifeleech + Shock','Causa 5% do DMG do aplicador; aplicador cura 5% Max HP.'],
 ['Electric Siphon','Shock + Lifeleech','5% Max HP; próximo Lifeleech drena +5%.'],
 ['Electrocution','Shock + Stun','3% do DMG do aplicador; +15% chance de Stun no próximo hit.'],
 ['Emotional Drain','Charmed + Fatigue','Alvo causa 15% menos dano por um turno.'],
 ['Emotional Surge','Charmed + Shock','5% DMG do aplicador; próximo Shock tem +10% chance de Stun.'],
 ['Exhausted Blood','Fatigue + Lifeleech','Próximo Lifeleech drena +5%.'],
 ['Flashbang','Shock + Blinding','40% chance de errar o próximo turno.'],
 ['Frostbound','Stun + Frostbite','5% Max HP e +1 Frostbite.'],
 ['Frozen Drain','Frostbite + Lifeleech','Próximo Lifeleech drena +5%; −1 Frostbite.'],
 ['Frozen Heart','Frostbite + Charmed','+15% chance de Charmed no próximo hit; −1 Frostbite.'],
 ['Heartbound','Charmed + Stun','Alvo causa 10% menos dano por um turno.'],
 ['Heartbreak','Charmed + Bleed','5% Max HP; cura do alvo −25% por um turno.'],
 ['Heavy Impact','Stun + Fatigue','Alvo causa 5% menos dano por um turno.'],
 ['Ice Blindness','Frostbite + Blinding','40% miss no próximo turno; −1 Frostbite.'],
 ['Lovesick Wound','Bleed + Charmed','+15% chance de Charmed no próximo hit.'],
 ['Mental Fog','Fatigue + Blinding','40% chance de errar próximo turno.'],
 ['Mind Shock','Shock + Charmed','+15% chance Charmed no próximo hit; Shock termina 1 turno antes.'],
 ['Paralyzed Feast','Stun + Lifeleech','Aplicador cura 5% Max HP; próximo Lifeleech drena +5%.'],
 ['Paralyzing Current','Stun + Shock','5% DMG do aplicador; próximo Shock +10% chance Stun.'],
 ['Plasma Burn','Shock + Immolation','7,5% Max HP e +1 Immolation.'],
 ['Sanguine Feast','Lifeleech + Bleed','5% Max HP; aplicador cura 5% Max HP.'],
 ['Scorched Exhaustion','Immolation + Fatigue','Alvo causa 15% menos dano por um turno.'],
 ['Seared Wound','Bleed + Immolation','5% Max HP e +1 Immolation.'],
 ['Siphoning Shock','Lifeleech + Stun','5% Max HP e +10% chance de Stun no próximo hit.'],
 ['Static Confusion','Blinding + Shock','5% do DMG do aplicador e +10% chance Stun no próximo Shock.'],
 ['Steam Burst','Immolation + Frostbite','7,5% do DMG do aplicador; −1 Frostbite.'],
 ['Stunning Sight','Stun + Blinding','40% chance de errar no próximo turno.'],
 ['Thermal Rupture','Frostbite + Immolation','7,5% Max HP e +1 Immolation.'],
 ['Voltaic Flame','Immolation + Shock','7,5% do DMG do aplicador; +10% chance Stun no próximo hit.'],
 ['Weak Will','Fatigue + Charmed','+15% chance de Charmed no próximo hit.']
 ];const root=header('Reações do Colosseum','A ordem importa: o primeiro debuff mostrado já precisa estar ativo, então o segundo dispara a reação.')+
 strip('Como ativar','Devil Play pode aplicar uma curse no começo de cada wave; depois um efeito elemental coloca o segundo debuff. Ex.: Blinding + Frostbite = Cold Ambush; Blinding + Bleed = Blindside.')+
 strip('Exceções','Burn, Poison e Confusion não reagem com nada neste modo. Uma reação não cria uma nova reação em cadeia.');
 return root+'<label class="mc-search-box"><span>Pesquisar reação</span><input type="search" id="coloReactionSearch" placeholder="Ex.: Frozen, Shock, Bleed..."></label><div id="coloReactionTable">'+table(['Reação','Par em ordem','Resultado'],reactionRows)+'</div><p class="mc-footnote">Lista transcrita das reações visíveis nas capturas. Outras combinações podem não ter aparecido. </p>'; 
},
'Blessings':()=>header('As quatro categorias de Blessing','Depois de determinadas waves, escolha uma bênção para o restante da run.')+grid([
 ['Blessing of the World','Escolha um buff global: +10% Max HP, +10% DMG, +10% Crit DMG ou +7,5% Damage Reduction.'],
 ["People's Blessing",'Sorteia 4 Supports temporários; escolha quem equipa cada um. Efeitos incluem DMG, Max HP, Dodge, Regen e Revives.'],
 ['Sacred Blessing','Vincule uma proteção especial a uma carta: First-Hit Dodge, Second Wind (revive uma vez com 25% HP), Opening Shield (20% Max HP no início) ou Status Immunity (imune a debuffs e reações).'],
 ['Devil Play','Amaldiçoe todos os inimigos no início de cada wave restante. Cada curse só pode ser escolhida uma vez, máximo 3 por run; ajuda a montar reações.']
 ])+strip('Cuidado com Man of Men','Ele bloqueia debuffs e ganha ataques extras por debuffs bloqueados. Devil Play pode ser prejudicial na luta final.'),
'Elite Dice':()=>header('Elite Dice','Após waves 3, 6, 9 e 12 você rola um dado e pode substituir uma carta da equipe.')+grid([
 ['Faces 1–4','Recebe uma carta da pool DEFAULT, com stats 10% acima da próxima wave. Pode substituí-la por uma carta atual; a nova conserva o Support do slot.'],
 ['Face 5','Carta do pool WEATHER / EVENT, com stats 15% acima da próxima wave.'],
 ['Face 6','Carta do pool BOSS, com stats 20% acima da próxima wave.']
 ])+strip('Escolha','Você pode aceitar a carta e escolher qual slot trocar, ou manter a equipe.'),
'Champions':()=>header('Champion da wave 14','O adversário é mostrado antes da run. Cada Champion pune um estilo de jogo.')+grid([
 ['Earth Serpent','3.900 HP • 285 DMG • 10% DR. Aplica Poison e Fatigue ao entrar; a cada 2 turnos espalha Poison à próxima carta. Ao matar, cura 12% Max HP e ganha +7,5% DMG e +5% DR (limites +22,5%/+15%). Poison de carta derrotada passa à próxima.','ATTRITION / VENOMOUS'],
 ['Realm Shaker','4.350 HP • 264 DMG • 15% DR. Ataques atingem outras cartas por 30% DMG; com apenas uma viva, seus ataques causam 1,35×. Reflete dano secundário a 60%; após 3 reflexões, próximo golpe fica 1,5×. Pune AOE, chains, double strikes, ticks e reações.','ANTI-AOE'],
 ['Man of Men','3.720 HP • 228 DMG • 15% DR. Imune a todos os debuffs e reações. Cura 3% Max HP por turno. A cada 4 debuffs bloqueados ganha ataque extra de +50% DMG; a cada 4 turnos remove buffs da carta ativa, curando 5% por buff (máximo 15%).','ANTI-DEBUFF']
 ]),
'Recompensas':()=>{
 const rows=[
 ['1','+1 Copper'],['2','+1 Copper'],['3','+3 Copper, +1 Silver'],['4','+2 Copper'],['5','+2 Copper'],['6','+4 Copper, +2 Silver'],['7','+3 Copper, +1 Silver'],['8','+3 Copper, +1 Silver'],['9','+5 Copper, +2 Silver'],['10','+4 Copper, +2 Silver'],['11','+4 Copper, +2 Silver'],['12','+6 Copper, +3 Silver, +1 Gold'],['13','+5 Copper, +2 Silver'],['14','+10 Copper, +4 Silver, +2 Gold']
 ];return header('Pagamento por wave','Cada prêmio é creditado imediatamente, mesmo que a run termine depois.')+table(['Wave','Pagamento-base'],rows)+grid([
 ['Victory Streak','Cada wave concluída acrescenta +1,2% ao streak bonus (máximo +15%). Perder antes do Champion reinicia o streak.'],
 ['Champion payout','Vencer Champion: +10% no payout. Perder para o Champion: −5% payout e −5% streak.'],
 ['Champion Protection','Com streak no máximo, cada wave concluída dá 1 charge; 10 cargas viram 1 Protection (até 2). Protection cancela automaticamente a penalidade ao perder contra Champion.'],
 ['Card generation','Cartas são geradas quando a run acaba, de acordo com Gold recebido, wave alcançada e streak; limite diário 250.000 cartas (reinício 00:00 UTC).']
 ]);
},
'Shop':()=>header('Colosseum Shop','As moedas Copper, Silver e Gold compram poções e itens; cada linha tem limite semanal indicado no print.')+table(['Item','Preço','Limite / função'],[
 ['Luck Potion T3','25 Copper','+3 Luck por 1 min • 100/semana'],
 ['Crazy Luck Potion','9 Silver','+15% Luck multiplier por 1 min; combina com T1–T3 • 100/semana'],
 ['Border Chance Potion','7 Silver','Aumenta chance de bordas melhores • 100/semana'],
 ['Weather Reroll','3 Gold','Reroll do clima • 100/semana'],
 ['Roll Speed Potion','25 Copper','Acelera rolls/abertura • 100/semana'],
 ['Boss Potion','2 Gold','Desbloqueia pool de cartas de Boss por 1 min • 100/semana'],
 ['Trait Crystal','120 Copper','Reroll do trait no NPC de Traits • 100/semana'],
 ['Shard of Origin','30 Gold','Substitui duplicata para Ascension I, II ou III • 3/semana']
 ])
};
const reactionsBackup=colosseumSections['Reações'];
const circuitRules=[
 ['Vizinhos','Apenas slots 1–2, 2–3 e 3–4 formam links. Um time de quatro cartas tem no máximo 3 links.'],
 ['Sempre ativos','Circuitos são passivos e exibidos antes do combate. Não precisam de botão.'],
 ['Afterglow','Se uma carta é derrotada, seus links permanecem acesos por mais 2 rodadas aliadas.'],
 ['Posição do meio','Slots 2 e 3 participam de dois links, mas um único gatilho não dispara dois efeitos iguais ao mesmo tempo.'],
 ['Ressonância','Dois elementos IGUAIS adjacentes: cada link ativo dá +6% de dano aos hits de ambas as cartas. Dois links iguais não multiplicam o tamanho do efeito.'],
 ['Conversão','Dois elementos DIFERENTES específicos ativam efeitos condicionais. Não existe +6% de ressonância por conversão.'],
 ['Limites','Bônus de dano de gatilho dos circuitos têm teto de +30% numa ação; bônus de chance crítica dos circuitos, máximo +25%. Efeitos secundários não podem ser copiados novamente.'],
 ['Bosses e PvP','Não movem slots, não removem turnos, não criam dano burst em %Max HP nem removem defesa permanentemente; não criam novos Extra Turns.'],
 ['Sem velocidade','Circuits não alteram Speed, iniciativa nem ordem dos turnos.'],
 ['Fighting Spirit','Físico: pode ser obtido quando Physical Surge ativa, num crítico ou num hit com 80% HP ou menos.']
];
const circuits=[
 ['Combustion Link','Fire + Fire','Ressonância','Fire aplica Burn','Esse Burn dura +1 turno (máximo 4).','Primeiro Burn por rodada aliada.'],
 ['Cryostasis Link','Ice + Ice','Ressonância','Ice vinculada recebe Shield','A outra ganha Shield equivalente a 40% do original.','Primeiro Shield por rodada; Shield copiado não ativa outro circuito.'],
 ['Conductor Link','Lightning + Lightning','Ressonância','Primeiro Chain Hit de Lightning','Chain salta a um terceiro inimigo com 60% do dano do chain.','Primeiro chain por rodada; não acerta duas vezes o mesmo inimigo.'],
 ['Razor Current','Wind + Wind','Ressonância','Wind vinculada aplica Bleed','Bleed em um inimigo diferente dura +1 turno (ou, se nenhum, o novo Bleed).','Uma vez por rodada; sem efeito de velocidade.'],
 ['Entangled Link','Quantum + Quantum','Ressonância','Quantum ganha Extra Turn real','20% de chance de parceiro ganhar +25% Crit DMG no próximo ataque.','Não acumula; não cria novo turno extra.'],
 ['Null Link','Imaginary + Imaginary','Ressonância','Imaginary aplica redução de atributo','Redução aplicada fica 40% mais forte (ex.: −10% vira −14%).','Primeira redução da rodada aliada.'],
 ['Warbound Link','Physical + Physical','Ressonância','Physical ganha Fighting Spirit','Acumula Warbound Points; 2 pontos ativam efeito cooperativo cujo texto completo não aparece no print.','Pontos expiram após 3 rodadas aliadas sem novo ponto.'],
 ['Thermal Shock','Fire + Ice','Conversão','Carta vinculada atinge alvo com Burn','Próximo tick de Burn causa +60%; consome 1 Frostbite se presente.','Uma vez por rodada; duração de Burn não muda.'],
 ['Wildfire','Fire + Wind','Conversão','Wind atinge inimigo com Burn','Espalha cópia do Burn para próximo inimigo com 90% da força.','Uma vez por rodada; cópia Secondary não se espalha.'],
 ['Flashover','Fire + Lightning','Conversão','Lightning encadeia de alvo com Burn','Chain Hit causa +20%; condição adicional com Shock parcialmente cortada no print.','Shock é atualizado uma vez por rodada; verificar detalhes.'],
 ['Superconductor','Ice + Lightning','Conversão','Gatilho não exibido nas capturas individuais','Efeito não confirmado; nome e combinação constam no Codex.','Pendente de print ampliado.'],
 ['Whiteout','Ice + Wind','Conversão','Hit em alvo com Frostbite ou Bleed','Próximo ataque desse alvo causa −15% DMG.','Primeiro alvo elegível por rodada; não acumula.'],
 ['Stormfront','Lightning + Wind','Conversão','Lightning encadeia de alvo com Bleed','Cópia de Bleed passa ao alvo do chain com 80% de força.','Uma vez por rodada; cópia Secondary.'],
 ['Paradox','Quantum + Imaginary','Conversão','Quantum ganha Extra Turn real','Uma redução de atributo removível no alvo fica 30% mais forte.','Uma vez por rodada.'],
 ['Breakpoint','Quantum + Physical','Conversão','Extra Turn de Quantum termina','Próximo hit da Physical recebe +15% de chance crítica.','Não acumula; consumido em uma ação.'],
 ['Oppression','Imaginary + Physical','Conversão','Imaginary aplica redução de atributo','Ganha 1 Pressure; em 2 Pressure, Physical ganha Fighting Spirit.','Máximo de um Fighting Spirit do circuito por rodada.'],
 ['Blood and Ash','Fire + Physical','Conversão','Physical atinge alvo com Burn','Ganha 1 Ember; com 2 Ember, próximo Burn de Fire fica 35% mais forte.','Primeiro hit elegível por rodada.'],
 ['Fractured Moment','Ice + Quantum','Conversão','Quantum ganha Extra Turn','Próximo hit de Ice no mesmo alvo recebe +15% Crit Chance.','Uma vez por rodada aliada.'],
 ['Withering Sky','Wind + Imaginary','Conversão','Wind atinge alvo com 2+ debuffs diferentes','Um Bleed nesse alvo dura +1 turno (máximo 4).','Primeiro hit elegível da rodada aliada.']
];
function circuitsContent(){
 const combos=table(['Circuito','Elementos','Tipo','Gatilho','Efeito','Limite'],circuits);
 return header('19 Origin Circuits','7 Resonances e 12 Conversions, sempre entre cartas vizinhas.')+grid(circuitRules)+strip('Exemplo ativo do seu Deck','Vector Storm → Ashey = Whiteout; Ashey → Blue Wolf = Cryostasis Link; Blue Wolf → Fullmetal Alchemist = Thermal Shock (3/3).')+combos;
}
const infiniteSections={
 'Visão geral':()=>header('The Endless Ascent','Run de quatro cartas. Cada andar fica mais difícil; completar andares aumenta a quantidade de cartas geradas ao final.')+grid([
 ['Andares e cartas','Runs sem limite de andares. Depois de terminar (queda ou encerramento), a run gera as cartas acumuladas; quanto mais alto, maiores as recompensas.'],
 ['Paths','Escolha um Path antes da run; seu efeito permanece ativo durante a run. Tier 1–5, cada nível aumenta o poder em 5% após cumprir objetivos com o Path equipado.'],
 ['Auto Swap','Na captura, Auto Swap está ON (3 times armados). O sistema pode alternar as formações configuradas.'],
 ['Registro mostrado','Melhor andar 494; 10 derrotas registradas; run ativa no andar 19. Equipe do print: Delusional, Idol, Game Princess, Blackwing; Path The Destruction Tier 5/5.']
 ]),
 'Elements Mode':()=>header('Elements Mode','Camada de risco e recompensa da Infinite. Deve ser definida antes do início e fica travada durante a run.')+grid([
 ['+10% Cards','O modo ligado gera 10% mais cartas ao terminar a run.'],
 ['+20% Enemies','Inimigos têm 20% mais HP e 20% mais DMG.'],
 ['Type Advantage','+50% de dano no elemento que você vence e −30% contra o elemento que vence você.'],
 ['Quando desligado','Sem vantagens/desvantagens elementais desse modo; recompensas normais.']
 ])+strip('Ciclo Fire','Fire → Ice → Lightning → Wind → Fire')+strip('Ciclo Quantum','Quantum → Imaginary → Physical → Quantum')+strip('Neutralidade','Elementos de anéis diferentes não têm vantagem ou desvantagem entre si.'),
 'Paths':()=>header('Sete Paths','Um Path equipado por run: upgrades de tier devem ser concluídos com o Path ativo.')+grid([
 ['The Destruction','Quanto mais HP faltar, mais DMG ganha (+2,2% por 10% HP ausente no Tier 5 mostrado). Chance de Fatigue a cada 25% HP ausente; ao matar recupera 8,8% Max HP.'],
 ['The Remembrance','Chance de Freeze; acerto num alvo frozen causa Shatter bônus e aplica Frostbite. Bom para equipes rápidas de Ice/Quantum.'],
 ['The Nihility','Cada hit adiciona Decay, até 5 stacks; dano por turno baseado em HP atual. Bom para dano ao longo do tempo; a árvore Unbound ajusta quantidade de ataques e percentuais.'],
 ['The Erudition','Hits de alvo único causam splash a outros inimigos, com buff de Max HP. Unbound leva debuffs ao splash.'],
 ['The Harmony','No início de cada turno ganha buff aleatório de Max HP, Overshield ou DMG; efeito termina no fim do turno.'],
 ['The Hunt','Abates acumulam buff de DMG (até 3 stacks), ótimo para limpar ondas rapidamente.'],
 ['The Abundance','Overheal vira Overhealth temporário, concede lifesteal e Overshield para último slot.']
 ]),
 'Skill Tree':()=>header('Infinite Skill Tree','A captura registra o caminho completo: 19/19 talentos aprendidos.')+grid([
 ['Infinite Core','+5% geração de cartas nas runs Infinite.'],
 ['Exile','+1 ban slot.'],
 ['Harvest','Abundant Harvest +2,5% cartas e Bountiful Harvest +2,5% cartas.'],
 ['Scavenger / Spoils','+5% taxa de drops de rerolls/crystals/fingers. Spoils: 5% de chance de recompensa extra ao terminar, 0,5% de ambos.'],
 ['Endless Vigor / Might','Cada um: +7,5% de Stats para suas cartas no Infinite.'],
 ['Second Wind / Relentless','15% de chance de curar 10% Max HP ao fim do turno; Relentless concede 5% chance de segundo ataque.'],
 ['Wayfarer','Paths ganham EXP 2× mais rápido e +5% de eficácia.'],
 ['Unbound','Sete especializações: Abundance, Hunt, Harmony, Erudition, Nihility, Remembrance e Destruction. Os 19 efeitos e custos estão na aba Skill Tree.']
 ])
};
function tabbed(rootId,sections,defaultTab){
 const mount=document.getElementById(rootId);if(!mount)return;
 let current=defaultTab;
 const tabs=Object.keys(sections);
 mount.innerHTML='<div class="mc-tabs" role="group" aria-label="Seções do guia">'+tabs.map(k=>'<button type="button" data-mode-tab="'+e(k)+'" aria-pressed="false">'+e(k)+'</button>').join('')+'</div><div class="mc-content" aria-live="polite"></div>';
 const paint=()=>{
  mount.querySelector('.mc-content').innerHTML=sections[current]();
  mount.querySelectorAll('[data-mode-tab]').forEach(b=>{const selected=b.dataset.modeTab===current;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
 };
 mount.addEventListener('click',event=>{const btn=event.target.closest('[data-mode-tab]');if(btn&&sections[btn.dataset.modeTab]){current=btn.dataset.modeTab;paint()}});
 paint();
}
function init(){tabbed('colosseumCodex',colosseumSections,'Visão geral');tabbed('infiniteCodex',infiniteSections,'Elements Mode');const c=document.getElementById('circuitCodex');if(c)c.innerHTML=circuitsContent();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();