/* GA4 basic consent mode: no Google request until analytics consent. */
(() => {
 'use strict';
 const config=window.COLLART_ANALYTICS||{};
 if(!config.enabled||!/^G-[A-Z0-9]+$/.test(config.measurementId||''))return;
 const key='collart_analytics_consent_v1';let active=false,loaded=false;
 const allowed=new Set(['prompt_copy_succeeded','creation_outbound_clicked','pricing_outbound_clicked']);
 const cases=new Set(['catalog','cafe','gift','beauty','craft','illustration','general']);
 const placements=new Set(['case','studio','hero','footer','pricing','unknown']);
 function read(){try{return localStorage.getItem(key);}catch{return null;}}
 function write(v){try{localStorage.setItem(key,v);}catch{}}
 function gtag(){window.dataLayer=window.dataLayer||[];window.dataLayer.push(arguments);}
 function cleanRef(){try{return document.referrer?new URL(document.referrer).origin+'/':'';}catch{return '';}}
 // Only these public campaign labels may leave the page. Never forward arbitrary query text.
 const contentIds=new Set(['x_20261123_shop_01','x_20261125_cafe_02','x_20261127_gift_03','qa_channel_check']);
 const query=new URLSearchParams(location.search||'');
 const tagged=['twitter','x'].includes(query.get('utm_source'))&&query.get('utm_medium')==='social'&&query.get('utm_campaign')==='jp_product_202611'&&contentIds.has(query.get('utm_content'));
 const contentId=tagged?query.get('utm_content'):'unattributed';
 const campaign=tagged?{campaign_source:'twitter',campaign_medium:'social',campaign_name:'jp_product_202611',campaign_content:contentId}:{};
 const safeQuery=tagged?'?'+new URLSearchParams({utm_source:'twitter',utm_medium:'social',utm_campaign:'jp_product_202611',utm_content:contentId}).toString():'';
 const page=location.origin+location.pathname+safeQuery;
 function start(){
  if(active)return;active=true;window['ga-disable-'+config.measurementId]=false;
  if(!loaded){
   gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   gtag('consent','update',{analytics_storage:'granted'});
   gtag('js',new Date());
   gtag('config',config.measurementId,{...campaign,content_id:contentId,send_page_view:true,page_location:page,page_referrer:cleanRef(),allow_google_signals:false,allow_ad_personalization_signals:false});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+config.measurementId;document.head.appendChild(script);loaded=true;
  }else gtag('consent','update',{analytics_storage:'granted'});
  gtag('event','jp_landing_view',{send_to:config.measurementId,source_page:'jp_product',content_id:contentId});
 }
 function stop(){active=false;window['ga-disable-'+config.measurementId]=true;if(loaded)gtag('consent','update',{analytics_storage:'denied'});}
 window.addEventListener('collart:conversion',e=>{
  const d=e.detail||{};if(!active||!allowed.has(d.event)||d.simulated!==false)return;
  gtag('event',d.event,{send_to:config.measurementId,source_page:'jp_product',content_id:contentId,use_case:cases.has(d.use_case)?d.use_case:'general',placement:placements.has(d.placement)?d.placement:'unknown',page_location:page});
 });
 const banner=document.createElement('aside');banner.className='analytics-choice';banner.setAttribute('aria-label','アクセス解析の設定');
 banner.innerHTML='<strong>アクセス解析へのご協力</strong><p>Google Analyticsで、訪問元やボタンの利用状況を分析します。写真・入力した文章は送信しません。拒否してもすべての機能を使えます。<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googleのプライバシーポリシー</a> · <a href="/analytics-privacy.html" target="_blank" rel="noopener">アクセス解析について</a></p><div><button type="button" data-consent="yes">解析を許可</button><button type="button" data-consent="no">許可しない</button></div>';
 banner.addEventListener('click',e=>{const v=e.target.dataset.consent;if(!v)return;write(v);v==='yes'?start():stop();banner.hidden=true;});document.body.appendChild(banner);
 const settings=document.createElement('button');settings.type='button';settings.className='analytics-settings';settings.textContent='アクセス解析の設定';settings.addEventListener('click',()=>{banner.hidden=false;banner.querySelector('button').focus();});document.querySelector('footer').appendChild(settings);
 const saved=read();banner.hidden=saved==='yes'||saved==='no';if(saved==='yes')start();
})();
