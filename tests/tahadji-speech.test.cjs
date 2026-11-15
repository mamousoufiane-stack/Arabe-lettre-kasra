const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {compare,normalize}=require('../mission-mots/ha/tahadji/speech-check.js');
assert.equal(normalize(' وَأُكِلَ، '),'واكل');
assert.equal(compare('كَتَبَ','كتب').accepted,true);
assert.equal(compare('وَحَمَدَ','و حمد').accepted,true);
assert.equal(compare('خَلَقَ','خُلِقَ').accepted,true); // Documented: ASR text cannot grade vowels.
assert.equal(compare('سَجَدَ','سجد كلام').accepted,false);
assert.equal(compare('سَجَدَ','').accepted,false);
assert.equal(compare('كَتَبَ','كتاب').accepted,false);
assert.equal(compare('حَمَدَ','همد').accepted,false);
assert.equal(compare('بَسَرَ','بصر').accepted,false);
assert.deepEqual(compare('كَتَبَ','كب').matched,[true,false,true]);
assert.deepEqual(compare('سَجَدَ','سحد').matched,[true,false,true]);
assert.equal(compare('سَجَدَ','hello').accepted,false);
function harness(){
 const nodes=new Map();const get=s=>{if(!nodes.has(s))nodes.set(s,{textContent:'',hidden:false,disabled:false,innerHTML:'',classList:{add(){},remove(){},toggle(){}},replaceChildren(){},appendChild(){},setAttribute(){}});return nodes.get(s)};
 const instances=[];class Recognition{constructor(){instances.push(this)}start(){}stop(){}abort(){this.aborted=true}}
 const sandbox={LESSON:{phrases:[],letters:{}},window:{SpeechRecognition:Recognition},SpeechCheck:{compare,normalize},document:{querySelector:get,querySelectorAll:()=>[],createElement:()=>get(Symbol())},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>1,clearTimeout(){},URL:{revokeObjectURL(){}},navigator:{},Audio:class{pause(){}}};
 vm.createContext(sandbox);let source=fs.readFileSync(require('node:path').join(__dirname,'../mission-mots/ha/tahadji/app.js'),'utf8');source=source.slice(0,source.lastIndexOf("document.querySelectorAll('[data-mode]')"));vm.runInContext(source,sandbox);
 return {sandbox,nodes,get,instances,run:s=>vm.runInContext(s,sandbox)};
}
const h=harness();h.run("toggleRecognition({ar:'كَتَبَ'})");let rec=h.instances.at(-1);assert.equal(rec.lang,'ar-SA');
function result(text,isFinal=true){const row=[{transcript:text}];row.isFinal=isFinal;return {results:[row]}}
rec.onresult(result('كتب',false));assert.equal(h.run('stars'),0,'interim must not award');
rec.onresult(result('كتب'));assert.equal(h.run('stars'),1);assert.equal(h.get('#speech-next').hidden,false);
rec.onresult(result('كتب'));assert.equal(h.run('stars'),1,'duplicate results must not award');
h.run("cleanup();solved=false;toggleRecognition({ar:'سَجَدَ'})");rec=h.instances.at(-1);rec.onresult(result('سحد'));assert.equal(h.run('stars'),1);assert.match(h.get('#feedback').textContent,/م|différent/);
const stale=rec.onresult;h.run('cleanup()');stale(result('سجد'));assert.equal(h.run('stars'),1,'stale recognition must be ignored');
h.run("solved=false;toggleRecognition({ar:'سَجَدَ'})");rec=h.instances.at(-1);rec.onerror({error:'not-allowed'});assert.equal(h.run('recognition'),null);assert.match(h.get('#feedback').textContent,/Autorise/);assert.equal(h.get('#recognize').disabled,false);
h.run("toggleRecognition({ar:'سَجَدَ'})");rec=h.instances.at(-1);rec.onend();assert.match(h.get('#feedback').textContent,/Aucun mot/);
h.run("toggleRecognition({ar:'سَجَدَ'})");rec=h.instances.at(-1);h.run('cleanup()');assert.equal(rec.aborted,true);assert.equal(rec.onresult,null);
console.log('Passed normalization, letter alignment, strict match, interim/duplicate/stale result, permission, empty result and abort tests.');
