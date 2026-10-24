(function(){
  var ICONS=["images/ico0.png", "images/ico1.png", "images/ico2.png", "images/ico3.png", "images/ico4.png", "images/ico5.png", "images/ico6.png", "images/ico7.png", "images/ico8.png", "images/ico9.png"];
  var DISHES=[
    {id:'poulet-mayo',n:'Poulet Mayo',p:30},
    {id:'ntaba',n:'Ntaba',p:40},
    {id:'cuisse',n:'Cuisse de Poulet',p:30},
    {id:'brochette',n:'Brochette',p:30},
    {id:'mipanzi',n:'Mipanzi',p:30},
    {id:'poisson',n:'Poisson Braisé',p:30},
    {id:'dindon',n:'Dindon',p:30},
    {id:'liboke-mbisi',n:'Liboke Mbisi',p:30},
    {id:'liboke-ngulu',n:'Libok Ngulu',p:30},
    {id:'mitsopo',n:'Ya Mitsopo',p:40}
  ];
  var KEY='lamaindor-cart-v2',cart={};
  try{var s=JSON.parse(localStorage.getItem(KEY)||'{}');if(s&&typeof s==='object')cart=s}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
  function $(id){return document.getElementById(id)}
  function money(n){return '$'+n}
  var byId={};DISHES.forEach(function(d,i){d.img=ICONS[i];byId[d.id]=d});
  Object.keys(cart).forEach(function(k){if(!byId[k]||!(cart[k]>0))delete cart[k]});

  var list=$('list');
  DISHES.forEach(function(d){
    var li=document.createElement('li');li.className='card';li.dataset.id=d.id;
    li.innerHTML='<img alt="" src="'+d.img+'"><div class="nm"><span class="kind">Plat</span><h3>'+d.n+'</h3><div class="price gold"><sup>$</sup>'+d.p+'</div></div><div class="ctl"></div>';
    list.appendChild(li);
  });
  var PLUS='<svg viewBox="0 0 20 20"><path d="M10 3v14M3 10h14"/></svg>';
  function renderCtl(id){
    var card=list.querySelector('[data-id="'+id+'"]'),ctl=card.querySelector('.ctl'),q=cart[id]||0,d=byId[id];
    card.classList.toggle('in',q>0);
    if(!q){ctl.innerHTML='<button type="button" class="plus" data-act="inc" data-id="'+id+'" aria-label="Ajouter '+d.n+' au panier">'+PLUS+'</button>';return}
    ctl.innerHTML='<span class="step"><button type="button" data-act="dec" data-id="'+id+'" aria-label="Retirer un '+d.n+'">−</button><output aria-live="polite">'+q+'</output><button type="button" data-act="inc" data-id="'+id+'" aria-label="Ajouter un '+d.n+'">+</button></span>';
  }
  function totals(){var c=0,t=0;Object.keys(cart).forEach(function(k){c+=cart[k];t+=cart[k]*byId[k].p});return{c:c,t:t}}
  function renderBar(bump){
    var x=totals(),bar=$('bar');
    bar.classList.toggle('on',x.c>0);
    $('barN').textContent=x.c;$('barTotal').textContent=money(x.t);
    $('barLabel').textContent=x.c>1?'Voir ma commande':'Voir ma commande';
    var nb=$('navBadge');nb.hidden=!x.c;nb.textContent=x.c;
    if(bump){bar.classList.remove('bump');void bar.offsetWidth;bar.classList.add('bump')}
  }
  function renderLines(){
    var ul=$('lines');ul.innerHTML='';
    Object.keys(cart).forEach(function(k){
      var d=byId[k],q=cart[k],li=document.createElement('li');
      li.innerHTML='<img alt="" src="'+d.img+'"><span class="t">'+d.n+'<small>'+money(d.p)+' le plat</small></span><span class="lt">'+money(q*d.p)+'</span><span class="step"><button type="button" data-act="dec" data-id="'+k+'" aria-label="Retirer un '+d.n+'">−</button><output>'+q+'</output><button type="button" data-act="inc" data-id="'+k+'" aria-label="Ajouter un '+d.n+'">+</button></span>';
      ul.appendChild(li);
    });
    $('total').textContent=money(totals().t);
    if(!totals().c)closeSheet();
    updateLinks();
  }
  function change(id,delta){
    var q=(cart[id]||0)+delta;
    if(q<=0)delete cart[id];else cart[id]=Math.min(q,50);
    save();renderCtl(id);renderBar(delta>0);$('done').hidden=true;
    if(!$('scrim').hidden)renderLines();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-act]');if(!t)return;
    change(t.dataset.id,t.dataset.act==='inc'?1:-1);
  });
  DISHES.forEach(function(d){renderCtl(d.id)});renderBar(false);

  /* drawer */
  var scrim=$('scrim'),lastFocus=null;
  function openSheet(){if(!totals().c){toast('Ajoutez d’abord un plat');return}lastFocus=document.activeElement;scrim.hidden=false;document.body.style.overflow='hidden';renderLines();$('name').focus({preventScroll:true})}
  function closeSheet(){if(scrim.hidden)return;scrim.hidden=true;document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
  $('open').addEventListener('click',openSheet);
  $('navCart').addEventListener('click',openSheet);
  $('close').addEventListener('click',closeSheet);
  scrim.addEventListener('click',function(e){if(e.target===scrim)closeSheet()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
  $('clear').addEventListener('click',function(){var ids=Object.keys(cart);cart={};save();ids.forEach(renderCtl);renderBar(false);renderLines()});

  /* date */
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function plus(n){var d=new Date();d.setDate(d.getDate()+n);return d}
  var dateEl=$('date');dateEl.min=iso(plus(1));dateEl.value=iso(plus(1));
  function dayState(){$('d1').setAttribute('aria-pressed',String(dateEl.value===iso(plus(1))));$('d2').setAttribute('aria-pressed',String(dateEl.value===iso(plus(2))))}
  $('d1').addEventListener('click',function(){dateEl.value=iso(plus(1));dayState();updateLinks();$('err').textContent=''});
  $('d2').addEventListener('click',function(){dateEl.value=iso(plus(2));dayState();updateLinks();$('err').textContent=''});
  dayState();
  try{var sv=JSON.parse(localStorage.getItem('lamaindor-contact')||'{}');if(sv.name)$('name').value=sv.name;if(sv.phone)$('phone').value=sv.phone}catch(e){}

  function frDate(v){var p=v.split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
  function message(){
    var l=['Bonjour La main d’Or, je voudrais passer la commande suivante :',''];
    Object.keys(cart).forEach(function(k){l.push('• '+cart[k]+' × '+byId[k].n+' ('+money(cart[k]*byId[k].p)+')')});
    l.push('','Total : '+money(totals().t));
    var n=$('name').value.trim();if(n)l.push('Nom : '+n);
    var p=$('phone').value.trim();if(p)l.push('Téléphone : '+p);
    if(dateEl.value)l.push('Pour le : '+frDate(dateEl.value));
    var no=$('notes').value.trim();if(no)l.push('Précisions : '+no);
    return l.join('\n');
  }
  function updateLinks(){$('wa').href='https://wa.me/12145422273?text='+encodeURIComponent(message())}
  ['name','phone','date','notes'].forEach(function(id){$(id).addEventListener('input',function(){
    updateLinks();$('err').textContent='';this.classList.remove('bad');dayState();
    if(id==='name'||id==='phone'){try{localStorage.setItem('lamaindor-contact',JSON.stringify({name:$('name').value,phone:$('phone').value}))}catch(e){}}
  })});
  function valid(){
    var e=$('err');
    if(!totals().c){e.textContent='Ajoutez au moins un plat.';return false}
    if(!$('name').value.trim()){e.textContent='Entrez votre nom pour que nous puissions préparer la commande.';$('name').classList.add('bad');$('name').focus();return false}
    if(!dateEl.value||dateEl.value<dateEl.min){e.textContent='Choisissez un jour à partir de demain.';dateEl.classList.add('bad');dateEl.focus();return false}
    e.textContent='';return true;
  }
  $('wa').addEventListener('click',function(e){updateLinks();if(!valid()){e.preventDefault();return}$('doneTxt').textContent='Message prêt dans WhatsApp. Envoyez-le pour terminer votre commande.';$('done').hidden=false});
  $('form').addEventListener('submit',function(e){e.preventDefault()});

  var tt;function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},2200)}
  function copy(text,msg){
    function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);toast(ok?msg:'Copie impossible, sélectionnez le texte.');return ok}
    try{navigator.clipboard.writeText(text).then(function(){toast(msg)},fb)}catch(e){fb()}
  }
  $('copyOrder').addEventListener('click',function(){if(!valid())return;copy(message(),'Commande copiée');$('doneTxt').textContent='Commande copiée. Collez-la dans un message ou appelez le restaurant pour confirmer.';$('done').hidden=false});
  $('copyPhone').addEventListener('click',function(){copy('+12145422273','Numéro copié')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeCall()});
  $('copyAddr').addEventListener('click',function(){copy('10524 Weeding Passage Way, Fort Worth, TX 76131','Adresse copiée')});
})();
