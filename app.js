const $=s=>document.querySelector(s);
const defaults=()=>({logged:false,balance:60,scene:'catalog',ratio:'1:1',source:'assets/catalog.png',own:false,result:null,busy:false,paying:false,fail:false,filename:'collart-catalog-reference.png',drafts:{},fileBusy:false});
let state=defaults(),sessionVersion=0;
const dialogs=['studio','login','pay'], events=[];
const currentCase=()=>useCases.find(c=>c.id===state.scene);
function track(event,extra={}){events.push({event,fromapp:new URLSearchParams(location.search).get('fromapp'),time:new Date().toISOString(),use_case:state.scene,asset_id:state.scene+'_v3',origin:state.own?'own':'sample',simulated:true,...extra});console.info('[prototype]',event,extra);}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.display='none',5000);}
function locked(){return state.busy||state.paying||state.fileBusy;}
function show(id){if(!$('#'+id).open){$('#'+id).showModal();$('#'+id).scrollTop=0;}}
function close(id){if(locked()){toast('処理が終わるまでお待ちください。');return;}$('#'+id).close();}
function saveDraft(){state.drafts[state.scene]={prompt:$('#prompt').value,ratio:state.ratio};}
function update(){
 $('#balance').textContent=state.balance;$('#account').textContent=state.logged?'デモユーザー':'デモログイン';
 document.querySelectorAll('[data-preset]').forEach(b=>{const on=b.dataset.preset===state.scene;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 document.querySelectorAll('[data-ratio]').forEach(b=>{const on=b.dataset.ratio===state.ratio;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 const [w,h]=state.ratio.split(':').map(Number);$('#preview').style.aspectRatio=`${w}/${h}`;
 $('#preview').alt=state.own?'追加した画像のデモプレビュー':currentCase().label+'の参考作例';
 document.querySelectorAll('#studio button,#studio textarea,#pay button,#login button,.review-tools button').forEach(b=>b.disabled=locked());
 $('#studio').setAttribute('aria-busy',String(state.busy));
 $('#generate').textContent=state.busy?'デモ結果を準備中…':state.result?'この設定でもう一度試す':'この設定で生成を体験';
}
function resetResult(){state.result=null;$('#result-actions').hidden=true;$('#next-task').hidden=true;$('#error').hidden=true;$('#preview').src=state.source;$('#stage-label').textContent=state.own?'追加した写真':'参考作例（入力写真ではありません）';$('#result-note').textContent=state.own?'画像はこのブラウザ内だけで扱います。デモではAIによる画像の変更は行いません。':'外部ツールで制作した参考画像です。Collartの実測結果ではありません。';}
function studio({scene=state.scene,sample=false}={}){
 if(locked())return;
 const changed=scene!==state.scene;if($('#studio').open)saveDraft();state.scene=scene;
 if(sample){if(state.source.startsWith('blob:'))URL.revokeObjectURL(state.source);state.own=false;state.source=`assets/${scene}.png`;state.filename=`collart-${scene}-reference.png`;}
 if(!state.own){state.source=`assets/${scene}.png`;state.filename=`collart-${scene}-reference.png`;}
 const draft=state.drafts[scene];state.ratio=draft?.ratio||currentCase().ratio;$('#prompt').value=draft?.prompt??currentCase().prompt;
 resetResult();update();show('studio');track('creation_open',{scene_changed:changed});
}
function pricing(){if(locked())return;if($('#studio').open)saveDraft();$('#pay-title').textContent=state.balance<30?'クレジットが不足しています。':'クレジット追加を体験';$('#pay-message').textContent=`必要：30デモクレジット / 残高：${state.balance}。このタブ内で写真・入力内容・比率を保持しています。`;show('pay');track('paywall_viewed');}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{if(locked())return;const a=b.dataset.action;if(a==='upload')$('#file').click();if(a==='sample')studio({sample:true});if(a==='pricing')pricing();if(a==='login'){if(state.logged)toast('デモアカウントを使用中です。');else show('login');}});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{track('usecase_selected',{use_case:b.dataset.scene,asset_id:b.dataset.scene+'_v3'});studio({scene:b.dataset.scene,sample:true});});
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{if(locked())return;studio({scene:b.dataset.preset});track('preset_selected');});
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{if(locked())return;state.ratio=b.dataset.ratio;saveDraft();update();track('ratio_selected',{ratio:state.ratio});});
$('#prompt').oninput=saveDraft;
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});let count=0;document.querySelectorAll('[data-group]').forEach(c=>{c.hidden=b.dataset.filter!=='all'&&c.dataset.group!==b.dataset.filter;if(!c.hidden)count++;});$('#filter-count').textContent=`${count}件の用途を表示`;track('usecase_filter_selected',{filter:b.dataset.filter});});
$('#file').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file||locked())return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){toast('JPG・PNG・WebP、10MB以下の画像を選んでください。');track('upload_rejected',{reason:'type_or_size'});return;}
 if($('#studio').open)saveDraft();state.fileBusy=true;update();const url=URL.createObjectURL(file);const version=sessionVersion;
 try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>25000000)throw new Error('dimensions');if(version!==sessionVersion){URL.revokeObjectURL(url);return;}if(state.source.startsWith('blob:'))URL.revokeObjectURL(state.source);state.source=url;state.own=true;state.filename=file.name;state.fileBusy=false;studio();track('asset_upload_succeeded',{local_only:true});}
 catch{URL.revokeObjectURL(url);toast('画像を読み込めませんでした。破損していない25メガピクセル以下の画像をお試しください。');track('upload_rejected',{reason:'decode_or_dimensions'});}
 finally{state.fileBusy=false;update();}
};
$('#login-demo').onclick=()=>{if(locked())return;state.logged=true;close('login');update();toast('デモログイン完了。入力内容を保ったまま続けられます。');track('demo_login');};
$('#cancel-pay').onclick=()=>{if(locked())return;close('pay');if(!$('#studio').open){if(!$('#prompt').value)studio();else show('studio');}update();toast('写真と入力内容を保ったまま戻りました。');};
$('#pay-demo').onclick=async()=>{if(locked())return;state.paying=true;update();$('#pay-demo').textContent='デモ処理中…';const version=sessionVersion;await new Promise(r=>setTimeout(r,700));if(version!==sessionVersion)return;state.balance+=400;state.logged=true;state.paying=false;$('#pay-demo').textContent='デモ決済を完了する';close('pay');update();if(!$('#studio').open){if(!$('#prompt').value)studio();else show('studio');}toast('400デモクレジットを追加しました。請求・契約はありません。');track('demo_payment_succeeded');};
$('#generate').onclick=async()=>{
 if(locked())return;saveDraft();if(!$('#prompt').value.trim()){toast('作りたいイメージを入力してください。');$('#prompt').focus();return;}
 if(!state.logged){show('login');return;}if(state.balance<30){pricing();return;}
 const job={version:sessionVersion,source:state.source,own:state.own,scene:state.scene,ratio:state.ratio,fail:state.fail};state.fail=false;state.busy=true;$('#error').hidden=true;$('#result-actions').hidden=true;$('#next-task').hidden=true;$('#loading').hidden=false;update();track('generation_submitted',{ratio:job.ratio});
 await new Promise(r=>setTimeout(r,1200));if(job.version!==sessionVersion)return;
 if(job.fail){$('#error').textContent='生成に失敗した場合のデモです。クレジットは消費していません。設定を保ったまま再試行できます。';$('#error').hidden=false;track('generation_failed');}
 else{state.balance-=30;state.result=job.source;$('#preview').src=state.result;$('#stage-label').textContent='結果画面（シミュレーション）';$('#result-actions').hidden=false;$('#next-task').hidden=false;$('#result-note').textContent=job.own?'アップロードした元画像を表示しています。AI変換・リサイズは行われていません。':'掲載されている参考画像を表示しています。今回生成した画像ではありません。';track('generation_result_viewed',{use_case:job.scene});}
 state.busy=false;$('#loading').hidden=true;update();
};
$('#download').onclick=()=>{if(!state.result||locked())return;const a=document.createElement('a');a.href=state.result;a.download=state.filename;a.click();track('result_download_clicked');};
$('#another').onclick=()=>{if(!locked())$('#file').click();};
$('#low-credit').onclick=()=>{if(locked())return;state.balance=0;state.logged=true;if(!$('#prompt').value)studio();else show('studio');update();pricing();};
$('#fail-next').onclick=()=>{if(locked())return;state.fail=true;state.logged=true;state.balance=Math.max(60,state.balance);if(!$('#prompt').value)studio();else show('studio');update();toast('次の生成は失敗デモになります。');};
$('#reset').onclick=()=>{if(locked())return;sessionVersion++;dialogs.forEach(id=>$('#'+id).close());if(state.source.startsWith('blob:'))URL.revokeObjectURL(state.source);state=defaults();$('#prompt').value='';$('#loading').hidden=true;resetResult();update();toast('デモをリセットしました。');};
dialogs.forEach(id=>{const dialog=$('#'+id);dialog.addEventListener('cancel',e=>{if(locked()){e.preventDefault();toast('処理が終わるまでお待ちください。');}});dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(id);});});
const seen=new Set();if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!seen.has(e.target)){seen.add(e.target);const id=e.target.querySelector('[data-scene]').dataset.scene;track('usecase_impression',{use_case:id,asset_id:id+'_v3'});}}),{threshold:.5});document.querySelectorAll('.case-card').forEach(c=>observer.observe(c));}
update();track('landing_view');
