(() => {
  'use strict';
  const cfg = window.PHONE_STORY;
  const host = document.querySelector('#screen');
  const STORE = 'miu-fiction-v3-local';
  const initial = () => ({lineSent:[],smsSent:[],noteEdits:{},favoriteTrack:null,photosExtra:[]});
  let saved;
  try { saved = {...initial(), ...JSON.parse(localStorage.getItem(STORE)||'{}')}; }
  catch { saved = initial(); }
  let page = 'lock';
  let selected = null;
  let draft = '';
  let lastPage = 'home';
  const persist = () => {try{localStorage.setItem(STORE,JSON.stringify(saved));}catch{}};
  const elem = (tag,cls='',text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const click = (text,cls,action) => {const b=elem('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
  const img = (src,alt='') => {const i=elem('img');i.src=src;i.alt=alt;return i;};
  const setPage = (p, id=null) => {page=p; selected=id;draft='';render();};
  const svg = (name) => {
    if(name==='signal')return `<svg width="21" height="16" viewBox="0 0 21 16" aria-hidden="true"><rect x="1" y="9" width="4" height="7" rx="1" fill="currentColor" opacity=".6"/><rect x="6" y="6" width="4" height="10" rx="1" fill="currentColor" opacity=".75"/><rect x="11" y="3" width="4" height="13" rx="1" fill="currentColor" opacity=".9"/><rect x="16" y="0" width="4" height="16" rx="1" fill="currentColor"/></svg>`;
    if(name==='wifi')return `<svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true"><path d="M2 5C6 1 14 1 18 5M5 8c3-3 7-3 10 0M8 11c1.5-1.3 2.5-1.3 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1.4" fill="currentColor"/></svg>`;
    return '';
  };
  function status(time=cfg.phone.time,light=false){
    const b=elem('div','statusbar'+(light?' light':''));b.append(elem('span','',time));
    const icons=elem('div','status-icons');icons.innerHTML=svg('signal')+svg('wifi');
    const battery=elem('div','battery');battery.append(elem('span','',cfg.phone.battery));icons.append(battery);b.append(icons);return b;
  }
  function appShell(title,back='home',actions=[]){
    const root=elem('section','page app');root.append(status());
    const nav=elem('div','app-nav');nav.append(click('‹','back',()=>setPage(back)));
    nav.append(elem('div','nav-center'));nav.querySelector('.nav-center').append(elem('div','nav-title',title));
    const right=elem('div','nav-right');actions.forEach(a=>right.append(a));nav.append(right);
    root.append(nav);return root;
  }
  function appTile(label,type,graphic,count,target=type){
    const b=click('','home-app',()=>setPage(target));const icon=elem('div','tile '+type); if(graphic)icon.append(elem('span','',graphic));
    if(count){icon.append(elem('span','app-count',count));}b.append(icon,elem('div','app-caption',label));return b;
  }
  function lockscreen(){
    const root=elem('section','page lock-screen');
    root.setAttribute('aria-label','Lock screen. Swipe up to unlock.');
    root.style.backgroundImage="url('assets/lockscreen.jpg')";
    const date=elem('div','lock-date',cfg.lock.dateLabel);
    root.append(date);
    const hint=elem('div','lock-hint','Swipe up to unlock');
    root.append(hint);
    const unlock=()=>{
      if(page!=='lock')return;
      root.classList.add('unlocking');
      window.setTimeout(()=>setPage('home'),330);
    };
    let startY=null;
    root.addEventListener('pointerdown',e=>{startY=e.clientY;});
    root.addEventListener('pointerup',e=>{if(startY!==null && startY-e.clientY>55)unlock();startY=null;});
    root.addEventListener('pointercancel',()=>{startY=null;});
    root.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;},{passive:true});
    root.addEventListener('touchend',e=>{if(startY!==null && startY-e.changedTouches[0].clientY>55)unlock();startY=null;},{passive:true});
    root.addEventListener('wheel',e=>{if(e.deltaY>18)unlock();},{passive:true});
    const bar=click('','unlock-homebar',unlock);
    bar.setAttribute('aria-label','Unlock phone without password');
    root.append(bar);
    root.tabIndex=0;
    root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key==='ArrowUp'){e.preventDefault();unlock();}});
    host.append(root);
  }
  // Immersive iPhone-style cover. Swipe upwards (or press Enter / use
  // the accessibility control) to reveal the home screen; no passcode.
  function lockScreen(){
    const root=elem('section','page lock-screen');
    const scene=elem('div','lock-scene');
    const wallpaper=img(cfg.lockScreen.wallpaper,'');
    wallpaper.className='lock-wallpaper';
    wallpaper.draggable=false;
    wallpaper.onerror=()=>{wallpaper.src=cfg.phone.homePhoto;};
    scene.append(wallpaper);
    const date=elem('div','lock-date',cfg.lockScreen.date);
    scene.append(date);
    // The original lock-screen photograph includes a clock, status indicators,
    // torch/camera controls, and home bar. Keep them part of the photo.
    const unlock=click('Swipe up to unlock','lock-unlock',()=>completeUnlock());
    unlock.setAttribute('aria-label','Unlock phone without passcode');
    scene.append(unlock);
    root.append(scene);
    host.append(root);
    let startY=null;
    let locked=false;
    function completeUnlock(){
      if(locked)return;
      locked=true;
      scene.classList.add('unlocking');
      window.setTimeout(()=>setPage('home'),380);
    }
    function onStart(e){
      if(e.pointerType==='mouse'&&e.button!==0)return;
      startY=e.clientY;
      if(root.setPointerCapture)try{root.setPointerCapture(e.pointerId)}catch{}
    }
    function onMove(e){
      if(startY===null||locked)return;
      const upwards=Math.max(0,startY-e.clientY);
      scene.style.setProperty('--swipe-up',Math.min(upwards,130)+'px');
    }
    function onEnd(e){
      if(startY===null)return;
      const upwards=startY-e.clientY;
      startY=null;
      if(upwards>=65){completeUnlock();return;}
      scene.style.setProperty('--swipe-up','0px');
    }
    root.addEventListener('pointerdown',onStart);
    root.addEventListener('pointermove',onMove);
    root.addEventListener('pointerup',onEnd);
    root.addEventListener('pointercancel',()=>{startY=null;scene.style.setProperty('--swipe-up','0px')});
    root.tabIndex=0;
    root.setAttribute('aria-label','Locked phone. Swipe up or press Enter to unlock.');
    root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();completeUnlock()}});
  }
  function home(){
    const root=elem('section','page home');root.append(status(cfg.phone.time,true));
    const main=elem('div','home-content');
    const imageButton=click('','photo-widget',()=>setPage('photos'));imageButton.append(img(cfg.phone.homePhoto,'Photos'));main.append(imageButton);
    main.append(elem('div','photo-label','Photos'));
    const grid=elem('div','home-grid');const cal=click('','calendar-card',()=>setPage('calendar'));
    cal.append(elem('div','cal-weekday',cfg.phone.date.weekday),elem('div','cal-day',cfg.phone.date.day),elem('div','cal-detail',cfg.phone.date.detail));grid.append(cal);
    grid.append(appTile('Camera','camera'),appTile('Instagram','instagram'),appTile('LINE','line'),appTile('Notes','notes'));
    main.append(grid);main.append(elem('div','home-search','⌕  Search'));root.append(main);
    const dock=elem('div','dock');dock.append(appTile('','phoneicon','☎',cfg.phone.unreadPhone,'phone'),appTile('','safari','◉',null,'safari'),appTile('','messagesicon','●',cfg.phone.unreadMessages,'sms'),appTile('','music','♫',null,'music'));
    root.append(dock);host.append(root);
  }
  function avatar(src, sizeClass=''){
    const a=elem('div','avatar '+sizeClass,'K');
    if(src){const photo=img(src,'Kiddo');photo.onload=()=>{a.textContent='';a.append(photo)};photo.onerror=()=>{};}
    return a;
  }
  function line(){
    const root=appShell('', 'home');const navTitle=root.querySelector('.nav-center');
    navTitle.replaceChildren();const profile=click('','nav-center',()=>setPage('kiddo-profile'));
    profile.append(avatar(cfg.line.avatar),elem('div','nav-title',cfg.line.name));navTitle.replaceWith(profile);
    const right=root.querySelector('.nav-right');right.append(click('⌕','',()=>{const sc=root.querySelector('.scroll');sc?.scrollTo({top:0,behavior:'smooth'})}),click('☰','',()=>setPage('kiddo-profile')));
    const messages=elem('div','scroll chat-view line-chat');messages.style.background=cfg.line.background||'#91aed9';
    renderMessages(messages,[...(cfg.line.messages||[]),...saved.lineSent]);root.append(messages);
    root.append(composer('line','Message...'));host.append(root);scrollDown(messages);
  }
  function sms(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');contact.append(avatar(null));
    contact.append(elem('div','sms-number',cfg.sms.number||cfg.sms.name),elem('div','sms-meta',cfg.sms.service));root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    renderMessages(messages,[...(cfg.sms.messages||[]),...saved.smsSent]);root.append(messages);
    root.append(elem('div','sms-footer-note','Messages sent here are fictional and stored only in this browser.'));
    root.append(composer('sms','Text Message · SMS'));host.append(root);scrollDown(messages);
  }
  function renderMessages(container,messages){
    for(const item of messages){
      if(item.type==='date')container.append(elem('div','fake-date',item.text));
      else if(item.type==='notice')container.append(elem('div','inline-notice',item.text));
      else if(item.from==='me'||item.from==='them'){
        const row=elem('div','chat-row '+item.from);row.append(elem('div','bubble',item.text));container.append(row);
      }
    }
  }
  function composer(kind,placeholder){
    const form=elem('form','composer');form.setAttribute('autocomplete','off');
    const button=click('+','composer-icon',()=>{});button.setAttribute('aria-label','Attachment menu');button.title='Attachments can be added later';form.append(button);
    const input=elem('input','composer-field');input.type='text';input.placeholder=placeholder;input.autocomplete='off';input.maxLength=2500;input.setAttribute('aria-label','Type a message');
    const send=elem('button','send','Send');send.type='submit';send.disabled=true;
    input.addEventListener('input',()=>send.disabled=!input.value.trim());
    form.addEventListener('submit',event=>{
      event.preventDefault();const text=input.value.trim();if(!text)return;
      const key=kind==='line'?'lineSent':'smsSent';saved[key].push({from:'me',text});persist();
      input.value='';send.disabled=true;
      const container=form.previousElementSibling?.classList.contains('scroll')?form.previousElementSibling:form.parentElement.querySelector('.chat-view');
      if(container){const row=elem('div','chat-row me');row.append(elem('div','bubble',text));container.append(row);scrollDown(container);}
      input.focus();
    });
    form.append(input,send);return form;
  }
  function scrollDown(e){requestAnimationFrame(()=>{e.scrollTop=e.scrollHeight})}
  function kiddoProfile(){
    const root=appShell('Profile','line');const profile=elem('div','profile-top');profile.append(avatar(cfg.line.avatar));
    profile.append(elem('div','profile-name',cfg.line.name),elem('div','profile-meta','LINE contact · Remark: '+cfg.line.name),elem('div','profile-meta','Last conversation · '+cfg.line.lastChatDate));
    profile.append(click('Open chat','profile-action',()=>setPage('line')));root.append(profile);host.append(root);
  }
  function notes(){
    const root=appShell('Notes','home',[click('+','',()=>{const id='user-'+Date.now();saved.noteEdits[id]={title:'New Note',body:''};persist();setPage('note-editor',id)})]);
    const list=elem('div','app-list notes-list');
    // Preloaded notes appear first, newest to oldest. User-created notes follow.
    const entries=[
      ...cfg.notes.map(n=>({ ...n, ...saved.noteEdits[n.id], id:n.id, date:n.date, isStoryNote:true })),
      ...Object.entries(saved.noteEdits)
        .filter(([id])=>!cfg.notes.some(n=>n.id===id))
        .map(([id,n])=>({id,...n,date:'Personal note',isStoryNote:false}))
    ];
    entries.forEach(n=>{
      const b=click('','list-item note-list-item',()=>setPage('note-editor',n.id));
      const detail=elem('div','note-list-copy');
      const preview=(n.body||'').trim();
      const heading=n.isStoryNote ? (preview.split('\n')[0] || n.title) : (n.title||'New Note');
      detail.append(elem('strong','',heading),elem('small','',n.date||'Note'));
      b.append(detail,elem('div','chevron','›'));list.append(b);
    });
    root.append(list);host.append(root);
  }
  function noteEditor(){
    const config=cfg.notes.find(n=>n.id===selected);
    const record=saved.noteEdits[selected]||config||{title:'New Note',body:''};
    const root=appShell('Notes','notes',[click('Done','pill',()=>setPage('notes'))]);
    const isStoryNote=Boolean(config);
    const noteTime=elem('div','note-timestamp',config?.date||'Personal note');
    root.append(noteTime);
    let head=null;
    if(!isStoryNote){
      head=elem('input','note-heading');head.value=record.title||'';head.placeholder='Title';
      root.append(head);
    }
    const textarea=elem('textarea','note-editor');textarea.value=record.body||'';textarea.placeholder='Start writing...';
    textarea.setAttribute('aria-label','Note content');
    const save=()=>{
      saved.noteEdits[selected]={
        title:head?head.value:(config.title||''),
        body:textarea.value
      };
      persist();
    };
    if(head)head.addEventListener('input',save);
    textarea.addEventListener('input',save);
    root.append(textarea);host.append(root);
  }
  function photos(){const root=appShell('Photos','home');const container=elem('div','scroll');const grid=elem('div','photo-grid');for(const p of cfg.photos){const b=click('','photo-tile',()=>setPage('photo-detail',p.id));b.append(img(p.src,p.title));grid.append(b)}container.append(grid);root.append(container);host.append(root)}
  function photoDetail(){const p=cfg.photos.find(p=>p.id===selected)||cfg.photos[0];const root=appShell(p.title,'photos');const contents=elem('div','scroll photo-detail');contents.append(img(p.src,p.title),elem('p','',p.caption));root.append(contents);host.append(root)}
  function instagram(){const root=appShell('Instagram','home');const content=elem('div','scroll app-list');for(const p of cfg.instagram){const post=elem('div','insta-card');post.append(elem('strong','',p.handle),img(p.image,'Instagram post'),elem('p','',p.caption));content.append(post)}root.append(content);host.append(root)}
  function calendar(){const root=appShell('Calendar','home');const content=elem('div','app-list');for(const x of cfg.calendar){const b=elem('div','list-item');b.append(elem('div','',x.date),elem('strong','',x.title));content.append(b)}root.append(content);host.append(root)}
  function camera(){const root=appShell('Camera','home');const content=elem('div','scroll');const preview=img(cfg.phone.homePhoto,'Camera preview');preview.style.cssText='width:100%;height:70%;object-fit:cover';content.append(preview);
    const capture=click('● Capture','pill',()=>{alert('Camera is simulated. Add a photo to story-data.js to show it in Photos.');});capture.style.cssText='display:block;margin:25px auto';content.append(capture);root.append(content);host.append(root)}
  function phoneApp(){const root=appShell('Phone','home');const content=elem('div','app-list');for(const p of cfg.phoneLog){const item=click('','list-item',()=>alert('This is a fictional call log.'));const t=elem('div');t.append(elem('strong','',p.name),elem('small','',p.subtitle));item.append(t,elem('div','','ⓘ'));content.append(item)}root.append(content);host.append(root)}
  function safari(){const root=appShell('Safari','home');const content=elem('div','scroll');for(const p of cfg.safari){content.append(elem('div','safari-address',p.url));const card=elem('div','app-list');card.append(elem('h2','',p.title),elem('p','',p.body));content.append(card)}root.append(content);host.append(root)}
  function music(){const root=appShell('Music','home');const list=elem('div','app-list');for(const track of cfg.music){const b=click('','list-item',()=>{saved.favoriteTrack=track.title;persist();render()});const l=elem('div');l.append(elem('strong','',track.title),elem('small','',track.artist));b.append(l,elem('div','',saved.favoriteTrack===track.title?'♥':'♡'));list.append(b)}list.append(elem('p','empty-app','No audio is included yet. Tracks can be added when you supply files.'));root.append(list);host.append(root)}
  function render(){host.replaceChildren();switch(page){case'lock':return lockscreen();case'home':return home();case'line':return line();case'sms':return sms();case'kiddo-profile':return kiddoProfile();case'notes':return notes();case'note-editor':return noteEditor();case'photos':return photos();case'photo-detail':return photoDetail();case'instagram':return instagram();case'calendar':return calendar();case'camera':return camera();case'phone':return phoneApp();case'safari':return safari();case'music':return music();default:return home()}}
  render();
})();
