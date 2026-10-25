(() => {
  'use strict';
  const cfg = window.PHONE_STORY;
  const host = document.querySelector('#screen');
  const STORE = 'miu-fiction-v3-local';
  // DEVELOPMENT MODE: refresh always starts a fresh playthrough.
  // Switch to false at launch to restore per-browser saves.
  const DEV_RESET_ON_REFRESH = true;
  const initial = () => ({lineSent:[],smsSent:[],noteEdits:{},favoriteTrack:null,photosExtra:[]});
  let saved = initial();
  if(DEV_RESET_ON_REFRESH){
    try { localStorage.removeItem(STORE); } catch {}
  } else {
    try { saved = {...initial(), ...JSON.parse(localStorage.getItem(STORE)||'{}')}; }
    catch { saved = initial(); }
  }
  let page = 'lock';
  let selected = null;
  let draft = '';
  let lastPage = 'home';
  let storyTimer = null;
  let storyLastTick = 0;
  let notificationVisible = false;
  let storyUiTimers = [];
  const scheduleStoryUi = (callback,delay) => {const id=window.setTimeout(callback,delay);storyUiTimers.push(id);return id;};
  const clearStoryUi = () => {storyUiTimers.forEach(window.clearTimeout);storyUiTimers=[];};
  const persist = () => {
    if(DEV_RESET_ON_REFRESH)return;
    try {localStorage.setItem(STORE,JSON.stringify(saved));}catch{}
  };
  const elem = (tag,cls='',text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
  const click = (text,cls,action) => {const b=elem('button',cls,text);b.type='button';b.addEventListener('click',action);return b;};
  const img = (src,alt='') => {const i=elem('img');i.src=src;i.alt=alt;return i;};
  const setPage = (p, id=null) => {
    const previous=page;
    const unlocking=page==='lock' && p==='home';
    clearStoryUi();
    page=p;selected=id;draft='';
    if(p==='notes' && !saved.storyNotesOpenedAt && !saved.storyFirstSmsDelivered){
      saved.storyNotesOpenedAt=Date.now();
      persist();
    }
    // Plot 2: the new journal entry appears when Notes is reopened after "Sorry!".
    if(p==='notes' && saved.storyStrangerReplied && !saved.storyPlot2NoteAdded){
      saved.storyPlot2NoteAdded=true;
      persist();
    }
    // The next text is released only on returning home after discovering the note.
    if(p==='home' && previous==='notes' && saved.storyPlot2NoteAdded && !saved.storySecondSmsDelivered){
      saved.storyPlot2DateChanged=true;
      saved.storySecondSmsDelivered=true;
      notificationVisible=true;
      persist();
    }
    // Plot 3: only unlock the next diary after the second conversation ends.
    if(p==='notes' && saved.storySecondStrangerReplied && !saved.storyPlot3NoteAdded){
      saved.storyPlot3NoteAdded=true;persist();
    }
    if(p==='note-editor' && id===cfg.story.plot3Note.id && saved.storyPlot3NoteAdded){
      saved.storyPlot3NoteViewed=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot3NoteAdded && !saved.storyThirdSmsDelivered){
      saved.storyPlot3Ready=true;
      saved.storyPlot3DateChanged=true;
      persist();
    }
    // Plot 4 is gated on the player explicitly renaming the contact.
    if(p==='notes' && saved.storyContactName==='Natsha' && (saved.storyPlot3Stage||0)>=7 && !saved.storyPlot4NoteAdded){
      saved.storyPlot4NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot4NoteAdded && !saved.storyFourthSmsDelivered){
      saved.storyPlot4Ready=true;
      saved.storyPlot4DateChanged=true;
      persist();
    }
    // Plot 5: opening Notes after the kiddo exchange reveals the next entry.
    if(p==='notes' && (saved.storyPlot4Stage||0)>=4 && !saved.storyPlot5NoteAdded){
      saved.storyPlot5NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot5NoteAdded && !saved.storyFifthSmsDelivered){
      saved.storyPlot5Ready=true;
      saved.storyPlot5DateChanged=true;
      persist();
    }
    if(p==='sms'){
      if(saved.storyFifthSmsDelivered)saved.storyFifthSmsOpened=true;
      if(saved.storyFourthSmsDelivered)saved.storyFourthSmsOpened=true;
      if(saved.storyThirdSmsDelivered)saved.storyThirdSmsOpened=true;
      if(saved.storySecondSmsDelivered && !saved.storySecondSmsOpened){
        saved.storySecondSmsOpened=true;
      }
      if(saved.storyFirstSmsDelivered) saved.storyFirstSmsOpened=true;
      notificationVisible=false;
      persist();
    }
    render();
    if(unlocking)startStoryBrowsing();
    if(notificationVisible && p!=='sms')showStoryNotification();
    if(p==='home' && saved.storyPlot3Ready && !saved.storyThirdSmsDelivered){
      scheduleStoryUi(()=>{
        if(page!=='home' || saved.storyThirdSmsDelivered)return;
        saved.storyThirdSmsDelivered=true;
        saved.storyPlot3Stage=0;
        notificationVisible=true;
        persist();
        showStoryNotification();
      },cfg.story.plot3HomeDelayMs);
    }
    if(p==='home' && saved.storyPlot4Ready && !saved.storyFourthSmsDelivered){
      scheduleStoryUi(()=>{
        if(page!=='home' || saved.storyFourthSmsDelivered)return;
        saved.storyFourthSmsDelivered=true;
        saved.storyPlot4Stage=0;
        notificationVisible=true;
        persist();
        showStoryNotification();
      },cfg.story.plot4HomeDelayMs);
    }
    if(p==='home' && saved.storyPlot5Ready && !saved.storyFifthSmsDelivered){
      scheduleStoryUi(()=>{
        if(page!=='home' || saved.storyFifthSmsDelivered)return;
        saved.storyFifthSmsDelivered=true;
        saved.storyPlot5Stage=0;
        notificationVisible=true;
        persist();
        showStoryNotification();
      },cfg.story.plot5HomeDelayMs);
    }
  };
  // Browsing time only accumulates while the phone is unlocked and the tab is visible.
  // The event fires once per saved playthrough, including across page navigation.
  function startStoryBrowsing(){
    if(saved.storyFirstSmsDelivered)return;
    if(!Number.isFinite(saved.storyBrowseMs))saved.storyBrowseMs=0;
    if(storyTimer!==null)return;
    storyLastTick=Date.now();
    storyTimer=window.setInterval(()=>{
      const now=Date.now();
      const elapsed=Math.min(now-storyLastTick,1000);
      storyLastTick=now;
      if(document.hidden || page==='lock')return;
      saved.storyBrowseMs+=Math.max(0,elapsed);
      // Either a 30-second browse or 10 seconds after first opening Notes.
      const notesReady=Number.isFinite(saved.storyNotesOpenedAt) && now-saved.storyNotesOpenedAt>=cfg.story.notesTriggerDelayMs;
      if(saved.storyBrowseMs>=cfg.story.firstMessageDelayMs || notesReady){
        window.clearInterval(storyTimer);storyTimer=null;
        saved.storyFirstSmsDelivered=true;
        notificationVisible=true;
        persist();
        if(page==='sms')render();
        showStoryNotification();
      } else if(Math.floor(saved.storyBrowseMs/5000)!==Math.floor((saved.storyBrowseMs-elapsed)/5000))persist();
    },500);
  }
  function showStoryNotification(){
    document.querySelector('.story-notification')?.remove();
    if(!notificationVisible || page==='lock')return;
    const fifth=saved.storyFifthSmsDelivered && !saved.storyFifthSmsOpened;
    const fourth=saved.storyFourthSmsDelivered && !saved.storyFourthSmsOpened;
    const third=saved.storyThirdSmsDelivered && !saved.storyThirdSmsOpened;
    const second=saved.storySecondSmsDelivered && !saved.storySecondSmsOpened;
    const first=saved.storyFirstSmsDelivered && !saved.storyFirstSmsOpened;
    if(!fifth && !fourth && !third && !second && !first)return;
    const msg=fifth?cfg.story.plot5Notification:(fourth?cfg.story.plot4Notification:(third?cfg.story.plot3Message:(second?cfg.story.secondMessage:cfg.story.firstMessage)));
    const banner=click('','story-notification',()=>setPage('sms'));
    banner.setAttribute('aria-label','Open text message from '+msg.sender);
    const head=elem('div','story-notification-head');
    head.append(elem('span','story-notification-app','✉  MESSAGES'),elem('span','story-notification-time',msg.time));
    banner.append(head,elem('div','story-notification-sender',msg.sender),elem('div','story-notification-body',msg.text));
    host.append(banner);
    window.requestAnimationFrame(()=>banner.classList.add('story-notification-visible'));
  }
  const svg = (name) => {
    if(name==='signal')return `<svg width="21" height="16" viewBox="0 0 21 16" aria-hidden="true"><rect x="1" y="9" width="4" height="7" rx="1" fill="currentColor" opacity=".6"/><rect x="6" y="6" width="4" height="10" rx="1" fill="currentColor" opacity=".75"/><rect x="11" y="3" width="4" height="13" rx="1" fill="currentColor" opacity=".9"/><rect x="16" y="0" width="4" height="16" rx="1" fill="currentColor"/></svg>`;
    if(name==='wifi')return `<svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true"><path d="M2 5C6 1 14 1 18 5M5 8c3-3 7-3 10 0M8 11c1.5-1.3 2.5-1.3 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1.4" fill="currentColor"/></svg>`;
    return '';
  };
  function status(time=(saved.storyPlot5DateChanged?cfg.story.plot5Date.time:(saved.storyPlot4DateChanged?cfg.story.plot4Date.time:(saved.storyPlot3DateChanged?cfg.story.plot3Date.time:(saved.storyPlot2DateChanged?cfg.story.plot2Date.time:cfg.phone.time)))),light=false){
    const b=elem('div','statusbar'+(light?' light':''));b.append(elem('span','',time));
    const icons=elem('div','status-icons');icons.innerHTML=svg('signal')+svg('wifi');
    const battery=elem('div','battery battery-full');battery.setAttribute('aria-label','Battery full');icons.append(battery);b.append(icons);return b;
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
  // Fictional iPhone lock screen. All interface elements are rendered
  // separately from the original photo, so there is no duplicated UI.
  function lockScreen(){
    const root=elem('section','page lock-screen');
    const scene=elem('div','lock-scene');
    const backdrop=img(cfg.lockScreen.wallpaper,'');
    backdrop.className='lock-backdrop';
    backdrop.draggable=false;
    const portrait=img(cfg.lockScreen.wallpaper,'Lock screen portrait');
    portrait.className='lock-portrait';
    portrait.draggable=false;
    scene.append(backdrop,portrait);

    const indicators=elem('div','lock-indicators');
    indicators.innerHTML=svg('signal')+svg('wifi');
    const battery=elem('div','lock-battery battery-full');battery.setAttribute('aria-label','Battery full');
    indicators.append(battery);
    scene.append(indicators);
    scene.append(elem('div','lock-date',cfg.lockScreen.date));
    scene.append(elem('div','lock-clock',cfg.lockScreen.time));

    const hint=click('Swipe up to unlock','lock-unlock',unlock);
    hint.setAttribute('aria-label','Unlock phone without a password');
    const bar=click('','lock-homebar',unlock);
    bar.setAttribute('aria-label','Unlock phone');
    scene.append(hint,bar);
    root.append(scene);
    host.append(root);

    let startY=null;
    let unlocking=false;
    function unlock(){
      if(unlocking)return;
      unlocking=true;
      scene.classList.add('unlocking');
      window.setTimeout(()=>setPage('home'),330);
    }
    root.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0)return;
      startY=event.clientY;
      try{root.setPointerCapture(event.pointerId)}catch{}
    });
    root.addEventListener('pointermove',event=>{
      if(startY===null || unlocking)return;
      const delta=Math.max(0,startY-event.clientY);
      scene.style.setProperty('--swipe-up',Math.min(delta,125)+'px');
    });
    root.addEventListener('pointerup',event=>{
      if(startY===null)return;
      const delta=startY-event.clientY;
      startY=null;
      if(delta>=45){unlock();return;}
      scene.style.setProperty('--swipe-up','0px');
    });
    root.addEventListener('pointercancel',()=>{
      startY=null;
      scene.style.setProperty('--swipe-up','0px');
    });
    // Desktop visitors can click anywhere, scroll up, or press Enter.
    root.addEventListener('click',unlock);
    root.addEventListener('wheel',event=>{
      if(event.deltaY>18)unlock();
    },{passive:true});
    root.tabIndex=0;
    root.setAttribute('aria-label','Locked phone. Swipe up, click, or press Enter to unlock.');
    root.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '||event.key==='ArrowUp'){
        event.preventDefault();unlock();
      }
    });
  }
  function home(){
    const root=elem('section','page home');root.append(status(saved.storyPlot5DateChanged?cfg.story.plot5Date.time:(saved.storyPlot4DateChanged?cfg.story.plot4Date.time:(saved.storyPlot3DateChanged?cfg.story.plot3Date.time:(saved.storyPlot2DateChanged?cfg.story.plot2Date.time:cfg.phone.time))),true));
    const main=elem('div','home-content');
    const imageButton=click('','photo-widget',()=>setPage('photos'));imageButton.append(img(cfg.phone.homePhoto,'Photos'));main.append(imageButton);
    main.append(elem('div','photo-label','Photos'));
    const grid=elem('div','home-grid');const cal=click('','calendar-card',()=>setPage('calendar'));
    const homeDate=saved.storyPlot5DateChanged?cfg.story.plot5Date:(saved.storyPlot4DateChanged?cfg.story.plot4Date:(saved.storyPlot3DateChanged?cfg.story.plot3Date:(saved.storyPlot2DateChanged?cfg.story.plot2Date:cfg.phone.date)));
    cal.append(elem('div','cal-weekday',homeDate.weekday),elem('div','cal-day',homeDate.day),elem('div','cal-detail',(saved.storyPlot2DateChanged||saved.storyPlot3DateChanged||saved.storyPlot4DateChanged||saved.storyPlot5DateChanged)?homeDate.month:homeDate.detail));grid.append(cal);
    grid.append(appTile('Camera','camera'),appTile('Instagram','instagram'),appTile('LINE','line','',null,'line-list'),appTile('Notes','notes'));
    main.append(grid);main.append(elem('div','home-search','⌕  Search'));root.append(main);
    const dock=elem('div','dock');dock.append(appTile('','phoneicon','☎',cfg.phone.unreadPhone,'phone'),appTile('','safari','◉',null,'safari'),appTile('','messagesicon','●',cfg.phone.unreadMessages,'sms'),appTile('','music','♫',null,'music'));
    root.append(dock);host.append(root);
  }
  function avatar(src, sizeClass=''){
    const a=elem('div','avatar '+sizeClass,'K');
    if(src){const photo=img(src,'Kiddo');photo.onload=()=>{a.textContent='';a.append(photo)};photo.onerror=()=>{};}
    return a;
  }

  // LINE inbox: tapping LINE on the home screen opens the contact list first.
  function lineList(){
    const root=appShell('LINE','home');
    root.classList.add('line-inbox-page');
    const top=elem('div','line-inbox-header');
    top.append(elem('h1','line-inbox-heading','Chats'));
    const search=elem('div','line-inbox-search','⌕  Search chats');
    root.append(top,search);
    const list=elem('div','scroll line-inbox-list');
    const conversation=click('','line-conversation',()=>setPage('line'));
    conversation.setAttribute('aria-label','Open chat with Kiddo');
    conversation.append(avatar(cfg.line.avatar,'line-inbox-avatar'));
    const details=elem('div','line-conversation-details');
    details.append(elem('strong','line-conversation-name',cfg.line.name));
    const entries=[...(cfg.line.messages||[]),...saved.lineSent].filter(x=>x.from==='me'||x.from==='them');
    const last=entries.length?entries[entries.length-1].text:'';
    details.append(elem('span','line-conversation-preview',last));
    conversation.append(details);
    const when=elem('div','line-conversation-date','25 Nov 2027');
    conversation.append(when);
    list.append(conversation);
    root.append(list);
    host.append(root);
  }
  // Explicit inline bubble styling avoids a stale or conflicting CSS selector
  // silently stripping the white/green backgrounds in GitHub Pages.
  function styleLineBubble(bubble,from){
    bubble.style.setProperty('background-color',from==='me'?'#b7e76d':'#ffffff','important');
    bubble.style.setProperty('color','#141414','important');
    bubble.style.setProperty('border-radius',from==='me'?'18px 18px 5px 18px':'18px 18px 18px 5px');
    bubble.style.setProperty('padding','11px 14px');
    bubble.style.setProperty('display','block');
    bubble.style.setProperty('width','fit-content');
    bubble.style.setProperty('max-width','76%');
    bubble.style.setProperty('box-shadow','0 1px 2px rgba(30,40,70,.15)');
    bubble.style.setProperty('font-family','-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple Color Emoji", "Segoe UI Emoji", sans-serif');
  }
  function line(){
    const root=appShell('', 'line-list');const navTitle=root.querySelector('.nav-center');
    navTitle.replaceChildren();const profile=click('','nav-center',()=>setPage('kiddo-profile'));
    profile.append(avatar(cfg.line.avatar),elem('div','nav-title',cfg.line.name));navTitle.replaceWith(profile);
    const right=root.querySelector('.nav-right');right.append(click('⌕','',()=>{const sc=root.querySelector('.scroll');sc?.scrollTo({top:0,behavior:'smooth'})}),click('☰','',()=>setPage('kiddo-profile')));
    const messages=elem('div','scroll chat-view line-chat');messages.style.background=cfg.line.background||'#91aed9';
    renderMessages(messages,[...(cfg.line.messages||[]),...saved.lineSent]);root.append(messages);
    root.append(composer('line','Message...'));host.append(root);scrollDown(messages);
  }
  // Plot 3 is a small, resumable state machine. Each stage is committed only
  // when a message is sent/received, never while a draft is being animated.
  function smsAvatar(){
    const a=avatar(null);
    a.textContent=(saved.storyContactName||'K').charAt(0).toUpperCase();
    return a;
  }
  function smsContact(){
    const root=appShell('Contact','sms');
    const area=elem('div','sms-contact-editor');
    const label=elem('label','sms-contact-label','Name');
    const field=elem('input','sms-contact-input');
    field.type='text';field.value=saved.storyContactName||'';
    field.placeholder='Tap to enter name';field.maxLength=60;
    field.readOnly=true;
    field.setAttribute('aria-label','Tap to automatically type Natsha');
    const initial=smsAvatar();
    let typing=false;
    const done=click('Done','sms-contact-done',()=>{
      if(typing)return;
      const name=field.value.trim();
      if(name){saved.storyContactName=name;persist();}
      setPage('sms');
    });
    const begin=()=>{
      if(typing || field.value==='Natsha')return;
      typing=true;field.value='';
      field.classList.add('story-contact-typing');
      let index=0;
      const tick=()=>{
        if(page!=='sms-contact')return;
        field.value='Natsha'.slice(0,++index);
        if(index<6)scheduleStoryUi(tick,115);
        else{
          typing=false;
          field.classList.remove('story-contact-typing');
          initial.textContent='N';
        }
      };
      scheduleStoryUi(tick,200);
    };
    field.addEventListener('click',begin);
    field.addEventListener('focus',begin);
    label.append(field);
    area.append(initial,label,done);
    root.append(area);host.append(root);
  }
  function plot4Composer(messages,stage){
    const form=elem('div','composer story-composer plot4-composer');
    form.append(elem('span','composer-icon','+'));
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>{
      if(field.disabled)return;
      field.disabled=true;
      const replies=stage===0?[cfg.story.plot4Messages[2].text]:
        [cfg.story.plot4Messages[4].text,cfg.story.plot4Messages[5].text];
      const next=(index)=>{
        plot3Type(field,replies[index],()=>{
          scheduleStoryUi(()=>{
            if(page!=='sms')return;
            if(index+1<replies.length){
              const row=elem('div','chat-row me');
              row.append(elem('div','bubble',replies[index]));
              messages.append(row);scrollDown(messages);
              field.textContent='';field.classList.remove('story-typing-active');
              scheduleStoryUi(()=>next(index+1),450);
            }else{
              saved.storyPlot4Stage=stage===0?1:3;
              persist();render();
            }
          },600);
        });
      };
      next(0);
    });
    field.setAttribute('aria-label','Tap to type scripted reply');
    form.append(field,elem('span','story-send-decoration','↑'));
    return form;
  }
  function plot4Incoming(messages,stage){
    const indicator=elem('div','story-typing-row');
    const bubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)bubble.append(elem('span','story-typing-dot'));
    indicator.append(bubble,elem('span','story-typing-label','Natsha is typing…'));
    messages.append(indicator);scrollDown(messages);
    scheduleStoryUi(()=>{
      if(page!=='sms')return;
      saved.storyPlot4Stage=stage+1;
      persist();render();
    },cfg.story.strangerTypingDelayMs);
  }
  function smsPlot4(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');
    contact.append(smsAvatar(),click(saved.storyContactName||'Unknown Number','sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push(cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'October 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'October 31, 2027'});
    for(const msg of cfg.story.plot3Messages)if(msg.stage<=(saved.storyPlot3Stage||0))history.push(msg);
    history.push({type:'date',text:'November 7, 2027'});
    const stage=Number(saved.storyPlot4Stage)||0;
    for(const msg of cfg.story.plot4Messages)if(msg.stage<=stage)history.push(msg);
    renderMessages(messages,history);root.append(messages);
    if(stage===0 || stage===2)root.append(plot4Composer(messages,stage));
    else{
      const idle=elem('div','composer story-composer story-composer-inactive');
      idle.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(idle);
    }
    host.append(root);scrollDown(messages);
    if(stage===1 || stage===3)plot4Incoming(messages,stage);
  }
  function smsPlot3(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');contact.append(smsAvatar());
    const nameButton=click(saved.storyContactName||cfg.sms.name,'sms-number sms-name-button',()=>setPage('sms-contact'));
    contact.append(nameButton,elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push(cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered){
      history.push({type:'date',text:'October 28, 2027'},cfg.story.secondMessage);
    }
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'October 31, 2027'});
    const stage=Number(saved.storyPlot3Stage)||0;
    for(const msg of cfg.story.plot3Messages){
      if(msg.stage<=stage)history.push({from:msg.from,text:msg.text});
    }
    renderMessages(messages,history);
    root.append(messages);
    if(stage===0 || stage===3 || stage===6){
      root.append(plot3Composer(stage));
    }else{
      const inactive=elem('div','composer story-composer story-composer-inactive');
      inactive.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(inactive);
    }
    host.append(root);scrollDown(messages);
    if([1,2,4,5].includes(stage))plot3Incoming(messages,stage);
    if(stage===6)plot3FinalDraft(root);
  }
  function plot3Composer(stage){
    const form=elem('div','composer story-composer plot3-composer');
    form.append(elem('span','composer-icon','+'));
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>{
      if(field.disabled || stage===6)return;
      field.disabled=true;
      const text=stage===0?cfg.story.plot3Messages[2].text:'Lena';
      plot3Type(field,text,()=>{
        scheduleStoryUi(()=>{
          if(page!=='sms')return;
          saved.storyPlot3Stage=stage===0?1:4;
          persist();render();
        },550);
      });
    });
    field.setAttribute('aria-label',stage===6?'Scripted reply is about to be typed':'Tap to type the next scripted reply');
    if(stage===6){field.disabled=true;field.textContent='Text Message';}
    form.append(field,elem('span','story-send-decoration','↑'));
    return form;
  }
  function plot3Type(field,message,onDone,interval=cfg.story.replyTypingIntervalMs){
    field.classList.add('story-typing-active');
    field.textContent='';
    let i=0;
    const tick=()=>{
      if(page!=='sms')return;
      i++;
      field.textContent=message.slice(0,i);
      if(i<message.length)scheduleStoryUi(tick,interval);
      else onDone();
    };
    scheduleStoryUi(tick,170);
  }
  function plot3Erase(field,onDone){
    let text=field.textContent;
    const tick=()=>{
      if(page!=='sms')return;
      text=text.slice(0,-1);
      field.textContent=text;
      if(text.length)scheduleStoryUi(tick,24);
      else scheduleStoryUi(onDone,300);
    };
    scheduleStoryUi(tick,170);
  }
  function plot3Incoming(messages,stage){
    const indicator=elem('div','story-typing-row');
    indicator.setAttribute('aria-label','Unknown Number is typing');
    const bubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)bubble.append(elem('span','story-typing-dot'));
    indicator.append(bubble,elem('span','story-typing-label','Unknown Number is typing…'));
    messages.append(indicator);scrollDown(messages);
    const wait=(stage===1||stage===4)?cfg.story.strangerTypingDelayMs:1200;
    scheduleStoryUi(()=>{
      if(page!=='sms')return;
      saved.storyPlot3Stage=stage+1;
      persist();render();
    },wait);
  }
  function plot3FinalDraft(root){
    const field=root.querySelector('.plot3-composer .story-scripted-input');
    if(!field)return;
    const [first,second,final]=cfg.story.plot3Drafts;
    // Three seconds of silence after "I am Natsha".
    scheduleStoryUi(()=>{
      if(page!=='sms')return;
      plot3Type(field,first,()=>{
        scheduleStoryUi(()=>plot3Erase(field,()=>{
          plot3Type(field,second,()=>{
            scheduleStoryUi(()=>plot3Erase(field,()=>{
              plot3Type(field,final,()=>{
                scheduleStoryUi(()=>{
                  if(page!=='sms')return;
                  saved.storyPlot3Stage=7;
                  persist();render();
                },800);
              });
            }),500);
          });
        }),650);
      });
    },cfg.story.plot3ReactionPauseMs);
  }
  function sms(){
    if(saved.storyFifthSmsDelivered)return smsPlot5();
    if(saved.storyFourthSmsDelivered)return smsPlot4();
    if(saved.storyThirdSmsDelivered)return smsPlot3();
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');contact.append(smsAvatar());
    contact.append(click(saved.storyContactName||cfg.sms.name,'sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push(cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered){
      history.push({type:'date',text:'October 28, 2027'});
      history.push(cfg.story.secondMessage);
    }
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    renderMessages(messages,history);
    root.append(messages);
    const phase=saved.storySecondSmsDelivered?2:1;
    const replyDone=phase===2?saved.storySecondPlayerReplied:saved.storyPlayerReplied;
    const responseDone=phase===2?saved.storySecondStrangerReplied:saved.storyStrangerReplied;
    if(replyDone && !responseDone)showStrangerTyping(messages,phase);
    if(saved.storyFirstSmsDelivered && !replyDone){
      root.append(storySmsComposer(messages,phase));
    }else{
      const inactive=elem('div','composer story-composer story-composer-inactive');
      inactive.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly',replyDone?'Text Message':'Waiting for message…'));
      root.append(inactive);
    }
    host.append(root);scrollDown(messages);
  }
  function storySmsComposer(messages,phase){
    const form=elem('div','composer story-composer');
    form.append(elem('span','composer-icon','+'));
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>{
      if(field.disabled)return;
      if(phase===1 && saved.storyPlayerReplied)return;
      if(phase===2 && saved.storySecondPlayerReplied)return;
      field.disabled=true;
      field.textContent='';
      field.classList.add('story-typing-active');
      const message=phase===2?cfg.story.secondPlayerReply:cfg.story.playerReply;
      let pos=0;
      const typeNext=()=>{
        if(page!=='sms')return;
        pos++;
        field.textContent=message.slice(0,pos);
        if(pos<message.length)scheduleStoryUi(typeNext,cfg.story.replyTypingIntervalMs);
        else scheduleStoryUi(sendReply,650);
      };
      const sendReply=()=>{
        if(page!=='sms')return;
        if(phase===2)saved.storySecondPlayerReplied=true;
        else saved.storyPlayerReplied=true;
        persist();
        field.classList.remove('story-typing-active');
        const row=elem('div','chat-row me');
        row.append(elem('div','bubble',message));
        messages.append(row);scrollDown(messages);
        field.textContent='Text Message';
        field.classList.remove('story-scripted-input');
        field.classList.add('story-readonly');
        showStrangerTyping(messages,phase);
      };
      scheduleStoryUi(typeNext,250);
    });
    field.setAttribute('aria-label','Tap to automatically type the scripted reply');
    form.append(field);
    form.append(elem('span','story-send-decoration','↑'));
    return form;
  }
  function showStrangerTyping(messages,phase=1){
    const alreadyReplied=phase===2?saved.storySecondStrangerReplied:saved.storyStrangerReplied;
    if(messages.querySelector('.story-typing-row') || alreadyReplied)return;
    const indicator=elem('div','story-typing-row');
    indicator.setAttribute('aria-label','Unknown Number is typing');
    const bubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)bubble.append(elem('span','story-typing-dot'));
    indicator.append(bubble,elem('span','story-typing-label','Unknown Number is typing…'));
    messages.append(indicator);scrollDown(messages);
    scheduleStoryUi(()=>{
      if(page!=='sms')return;
      indicator.remove();
      if(phase===2)saved.storySecondStrangerReplied=true;
      else saved.storyStrangerReplied=true;
      persist();
      const replyRow=elem('div','chat-row them');
      replyRow.append(elem('div','bubble',phase===2?cfg.story.secondStrangerReply:cfg.story.strangerReply));
      messages.append(replyRow);scrollDown(messages);
    },cfg.story.strangerTypingDelayMs);
  }
  function renderMessages(container,messages){
    for(const item of messages){
      if(item.type==='date')container.append(elem('div','fake-date',item.text));
      else if(item.type==='notice')container.append(elem('div','inline-notice',item.text));
      else if(item.from==='me'||item.from==='them'){
        const row=elem('div','chat-row '+item.from);
        const bubble=elem('div','bubble',item.text);
        if(container.classList.contains('line-chat')){
          styleLineBubble(bubble,item.from);
          const meta=elem('div','line-message-meta');
          if(item.read)meta.append(elem('span','line-read','Read'));
          if(item.time)meta.append(elem('span','line-time',item.time));
          if(item.from==='me')row.append(meta,bubble);
          else row.append(bubble,meta);
        }else{
          if(container.classList.contains('sms-chat') && item.time){
            const time=elem('div','sms-message-time',item.time);
            container.append(time);
          }
          row.append(bubble);
        }
        container.append(row);
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
      const key=kind==='line'?'lineSent':'smsSent';saved[key].push({from:'me',text,...(kind==='line'?{read:true}:{})});persist();
      input.value='';send.disabled=true;
      const container=form.previousElementSibling?.classList.contains('scroll')?form.previousElementSibling:form.parentElement.querySelector('.chat-view');
      if(container){
        const row=elem('div','chat-row me');
        const bubble=elem('div','bubble',text);
        if(kind==='line'){
          styleLineBubble(bubble,'me');
          const meta=elem('div','line-message-meta');
          meta.append(elem('span','line-read','Read'));
          row.append(meta,bubble);
        }else row.append(bubble);
        container.append(row);scrollDown(container);
      }
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
    const plot2Notes=saved.storyPlot2NoteAdded?[cfg.story.plot2Note]:[];
    const plot3Notes=saved.storyPlot3NoteAdded?[cfg.story.plot3Note]:[];
    const plot4Notes=saved.storyPlot4NoteAdded?[cfg.story.plot4Note]:[];
    const plot5Notes=saved.storyPlot5NoteAdded?[cfg.story.plot5Note]:[];
    const entries=[
      ...plot5Notes.map(n=>({...n,...saved.noteEdits[n.id],id:n.id,isStoryNote:true})),
      ...plot4Notes.map(n=>({...n,...saved.noteEdits[n.id],id:n.id,isStoryNote:true})),
      ...plot3Notes.map(n=>({...n,...saved.noteEdits[n.id],id:n.id,isStoryNote:true})),
      ...plot2Notes.map(n=>({...n,...saved.noteEdits[n.id],id:n.id,isStoryNote:true})),
      ...cfg.notes.map(n=>({ ...n, ...saved.noteEdits[n.id], id:n.id, date:n.date, isStoryNote:true })),
      ...Object.entries(saved.noteEdits)
        .filter(([id])=>!cfg.notes.some(n=>n.id===id) && id!==cfg.story.plot2Note.id && id!==cfg.story.plot3Note.id && id!==cfg.story.plot4Note.id && id!==cfg.story.plot5Note.id)
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
    const config=cfg.notes.find(n=>n.id===selected)
      || (saved.storyPlot5NoteAdded && selected===cfg.story.plot5Note.id?cfg.story.plot5Note:null)
      || (saved.storyPlot4NoteAdded && selected===cfg.story.plot4Note.id?cfg.story.plot4Note:null)
      || (saved.storyPlot3NoteAdded && selected===cfg.story.plot3Note.id?cfg.story.plot3Note:null)
      || (saved.storyPlot2NoteAdded && selected===cfg.story.plot2Note.id?cfg.story.plot2Note:null);
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
  function instaPhoto(index, cls=''){
    const p=elem('div','ig-photo '+cls);
    const avatarMode=cls.includes('avatar');
    const source=avatarMode ? cfg.instagramAvatar : cfg.instagram[index]?.src;
    p.style.setProperty('--ig-col',index%3);
    p.style.setProperty('--ig-row',Math.floor(index/3));
    p.style.backgroundPosition=['0%','50%','100%'][index%3]+' '+(Math.floor(index/3)*100)+'%';
    if(source){
      const photo=img(source,avatarMode?'lalinalena profile photo':'Instagram post photo');
      photo.className='ig-photo-image';
      photo.loading=avatarMode?'eager':'lazy';
      photo.onerror=()=>photo.remove();
      p.append(photo);
    }
    return p;
  }
  function instagram(){
    const root=elem('section','page ig-page');
    root.append(status());
    const nav=elem('div','ig-nav');
    nav.append(click('‹','ig-back',()=>setPage('home')));
    const username=elem('div','ig-username');username.append(elem('strong','','lalinalena'),elem('span','ig-verified','✿'));
    nav.append(username,elem('div','ig-nav-actions','♧  ···'));
    root.append(nav);
    const content=elem('div','scroll ig-scroll');
    const overview=elem('div','ig-overview');
    const summary=elem('div','ig-summary');
    summary.append(instaPhoto(5,'ig-avatar'));
    const stats=elem('div','ig-stats');
    [['2,008','posts'],['1.8 M','followers'],['1,293','following']].forEach(([num,label])=>{
      const stat=elem('div','ig-stat');stat.append(elem('strong','',num),elem('span','',label));stats.append(stat);
    });
    summary.append(stats);overview.append(summary);
    overview.append(elem('div','ig-display-name','Lorena Schuett ⌘ ·°'));
    const bio=elem('div','ig-bio');
    ['Actor','✿ BKK'].forEach(line=>bio.append(elem('div','',line)));
    overview.append(bio);
    const tags=elem('div','ig-tags');tags.append(elem('span','','◎ lalinalena'),elem('span','','LaLi’sLoveLetters 💌 📮'));overview.append(tags);
    const actions=elem('div','ig-actions');actions.append(elem('div','','Following ⌄'),elem('div','','Message'),elem('div','','♙'));overview.append(actions);
    const highlights=elem('div','ig-highlights');
    [['🪩','👯'],['·ᴥ·','🤍'],['♡','💗'],['💪','🌷'],['LLN','🌊']].forEach(([label,emoji])=>{
      const h=elem('div','ig-highlight');h.append(elem('div','ig-highlight-circle',emoji),elem('span','',label));highlights.append(h);
    });
    overview.append(highlights);content.append(overview);
    const tabs=elem('div','ig-tabs');tabs.append(elem('span','ig-tab-selected','▦'),elem('span','','▷'),elem('span','','↻'),elem('span','','♙'));content.append(tabs);
    const grid=elem('div','ig-grid');
    cfg.instagram.forEach((p,i)=>{
      const tile=click('','ig-tile',()=>setPage('instagram-post',i));
      tile.append(instaPhoto(i));
      tile.setAttribute('aria-label','View '+p.date+' post');
      grid.append(tile);
    });
    content.append(grid);
    root.append(content);host.append(root);
  }
  function instagramPost(){
    const p=cfg.instagram[Number(selected)]||cfg.instagram[0];
    const index=Math.max(0,cfg.instagram.indexOf(p));
    const root=elem('section','page ig-page');
    root.append(status());
    const nav=elem('div','ig-nav');
    nav.append(click('‹','ig-back',()=>setPage('instagram')));
    nav.append(elem('strong','ig-post-title','Posts'));
    root.append(nav);
    const content=elem('div','scroll ig-post-scroll');
    const header=elem('div','ig-post-header');
    header.append(instaPhoto(5,'ig-post-avatar'),elem('strong','','lalinalena'),elem('span','ig-verified','✿'));
    content.append(header);
    content.append(instaPhoto(index,'ig-post-image'));
    const likeRow=elem('div','ig-post-likes');likeRow.append(elem('span','','♥'),elem('strong','',p.likes+' likes'));content.append(likeRow);
    const caption=elem('div','ig-post-caption');caption.append(elem('strong','','lalinalena '),document.createTextNode(p.caption));content.append(caption);
    content.append(elem('div','ig-post-date',p.date));
    root.append(content);host.append(root);
  }
  function calendar(){const root=appShell('Calendar','home');const content=elem('div','app-list');for(const x of cfg.calendar){const b=elem('div','list-item');b.append(elem('div','',x.date),elem('strong','',x.title));content.append(b)}root.append(content);host.append(root)}
  function camera(){const root=appShell('Camera','home');const content=elem('div','scroll');const preview=img(cfg.phone.homePhoto,'Camera preview');preview.style.cssText='width:100%;height:70%;object-fit:cover';content.append(preview);
    const capture=click('● Capture','pill',()=>{alert('Camera is simulated. Add a photo to story-data.js to show it in Photos.');});capture.style.cssText='display:block;margin:25px auto';content.append(capture);root.append(content);host.append(root)}
  function phoneApp(){const root=appShell('Phone','home');const content=elem('div','app-list');for(const p of cfg.phoneLog){const item=click('','list-item',()=>alert('This is a fictional call log.'));const t=elem('div');t.append(elem('strong','',p.name),elem('small','',p.subtitle));item.append(t,elem('div','','ⓘ'));content.append(item)}root.append(content);host.append(root)}
  function safari(){const root=appShell('Safari','home');const content=elem('div','scroll');for(const p of cfg.safari){content.append(elem('div','safari-address',p.url));const card=elem('div','app-list');card.append(elem('h2','',p.title),elem('p','',p.body));content.append(card)}root.append(content);host.append(root)}
  function music(){const root=appShell('Music','home');const list=elem('div','app-list');for(const track of cfg.music){const b=click('','list-item',()=>{saved.favoriteTrack=track.title;persist();render()});const l=elem('div');l.append(elem('strong','',track.title),elem('small','',track.artist));b.append(l,elem('div','',saved.favoriteTrack===track.title?'♥':'♡'));list.append(b)}list.append(elem('p','empty-app','No audio is included yet. Tracks can be added when you supply files.'));root.append(list);host.append(root)}
  function render(){host.replaceChildren();switch(page){case'lock':return lockScreen();case'home':return home();case'line-list':return lineList();case'line':return line();case'sms':return sms();case'sms-contact':return smsContact();case'kiddo-profile':return kiddoProfile();case'notes':return notes();case'note-editor':return noteEditor();case'photos':return photos();case'photo-detail':return photoDetail();case'instagram':return instagram();case'instagram-post':return instagramPost();case'calendar':return calendar();case'camera':return camera();case'phone':return phoneApp();case'safari':return safari();case'music':return music();default:return home()}}
  render();
  // The countdown starts on first unlock; returning to the site resumes it.
  if(saved.storyBrowseMs>0 && !saved.storyFirstSmsDelivered){
    // Keep the phone locked until the player swipes up again.
  }
})();
