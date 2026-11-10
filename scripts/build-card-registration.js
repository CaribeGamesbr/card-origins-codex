const fs=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../integrations/card-registration');
const html=fs.readFileSync(path.join(base,'Index.html'),'utf8').replace('<!-- CARD_PRINT_READER -->',()=>'<script>'+fs.readFileSync(path.join(base,'GeminiClient.js'),'utf8')+'</script>').replace('<!-- CARD_PRINT_READER_UI -->',()=>'<script>'+fs.readFileSync(path.join(base,'ReaderUI.js'),'utf8')+'</script>');
const bundle=['/* Install this single file as Code.gs in a private Google Apps Script project. */',fs.readFileSync(path.join(base,'Core.gs'),'utf8'),fs.readFileSync(path.join(base,'GeminiCore.gs'),'utf8'),fs.readFileSync(path.join(base,'Gemini.gs'),'utf8'),fs.readFileSync(path.join(base,'Code.gs'),'utf8'),'var CARD_ADMIN_HTML='+JSON.stringify(html)+';',''].join('\n');
fs.writeFileSync(path.join(base,'Install.txt'),bundle);
console.log('Private registration installer generated (no credentials).');
