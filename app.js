(() => {
  'use strict';
  const cfg = window.PHONE_STORY;
  const host = document.querySelector('#screen');
  const STORE = 'miu-fiction-v3-local';
  // Each browser/profile keeps its own save; a refresh never wipes progress.
  // Explicit replay link: ?restart=1 clears only this game's local save.
  const initial = () => ({lineSent:[],smsSent:[],noteEdits:{},favoriteTrack:null,photosExtra:[]});
  let saved = initial();
  try {
    const params = new URLSearchParams(window.location.search);
    if(params.has('restart')){
      localStorage.removeItem(STORE);
      params.delete('restart');
      const remaining=params.toString();
      window.history.replaceState(null,'',window.location.pathname+(remaining?'?'+remaining:'')+window.location.hash);
    }
    const stored=JSON.parse(localStorage.getItem(STORE)||'null');
    if(stored && typeof stored==='object' && !Array.isArray(stored)){
      saved={...initial(),...stored};
    }
  }catch{ saved=initial(); }
  const allowedPages=new Set(['lock','home','line-list','line','sms','sms-contact','kiddo-profile','notes','note-editor','photos','recent-album','photo-detail','secret-album','secret-photo','instagram','instagram-post','calendar','camera','phone']);
  // Once the Valentine Instagram ending is unlocked, every reload starts on the new lock screen.
  // Keep all story progress and the saved last app intact; only the entry screen changes.
  const resumePage=saved.storyValentineUnlocked?'lock':(allowedPages.has(saved.currentPage)?saved.currentPage:'lock');
  const resumeSelection=saved.currentSelection??null;
  let page = 'lock';
  let selected = null;
  let draft = '';
  let lastPage = 'home';
  let storyTimer = null;
  let storyLastTick = 0;
  // Reconstruct any unread SMS banner after reopening the site.
  let notificationVisible = [
    ['storyFirstSmsDelivered','storyFirstSmsOpened'],
    ['storySecondSmsDelivered','storySecondSmsOpened'],
    ['storyThirdSmsDelivered','storyThirdSmsOpened'],
    ['storyFourthSmsDelivered','storyFourthSmsOpened'],
    ['storyFifthSmsDelivered','storyFifthSmsOpened'],
    ['storySixthSmsDelivered','storySixthSmsOpened'],
    ['storySeventhSmsDelivered','storySeventhSmsOpened'],
    ['storyEighthSmsDelivered','storyEighthSmsOpened'],
    ['storyNinthSmsDelivered','storyNinthSmsOpened']
  ].some(([delivered,opened])=>saved[delivered]&&!saved[opened]);
  let storyUiTimers = [];
  const scheduleStoryUi = (callback,delay) => {const id=window.setTimeout(callback,delay);storyUiTimers.push(id);return id;};
  const clearStoryUi = () => {storyUiTimers.forEach(window.clearTimeout);storyUiTimers=[];};
  const persist = () => {
    try {localStorage.setItem(STORE,JSON.stringify(saved));}catch{}
  };
  // Restore the secret note for players who already received this exact LINE reply.
  const kiddoSecretTrigger='hehehe I love you toooooo xxooxo';
  if(!saved.kiddoSecretNoteUnlocked && saved.storyValentineUnlocked &&
     saved.lineEasterMessages?.some(item=>item.from==='them'&&item.text===kiddoSecretTrigger)){
    saved.kiddoSecretNoteUnlocked=true;
    persist();
  }
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
    if(p==='notes' && (saved.storyPlot4Stage||0)>=5 && !saved.storyPlot5NoteAdded){
      saved.storyPlot5NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot5NoteAdded && !saved.storyFifthSmsDelivered){
      saved.storyPlot5Ready=true;
      saved.storyPlot5DateChanged=true;
      persist();
    }
    // Plot 6 begins only after the final Plot 5 reply has been sent.
    if(p==='notes' && (saved.storyPlot5Stage||0)>=4 && !saved.storyPlot6NoteAdded){
      saved.storyPlot6NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot6NoteAdded && !saved.storySixthSmsDelivered){
      saved.storyPlot6Ready=true;
      saved.storyPlot6DateChanged=true;
      persist();
    }
    // Plot 7 unlocks after both scripted Plot 6 replies have been sent.
    if(p==='notes' && (saved.storyPlot6Stage||0)>=1 && !saved.storyPlot7NoteAdded){
      saved.storyPlot7NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot7NoteAdded && !saved.storySeventhSmsDelivered){
      saved.storyPlot7Ready=true;
      saved.storyPlot7DateChanged=true;
      persist();
    }
    // Plots 8 and 9 continue only after the previous conversation completes.
    if(p==='notes' && (saved.storyPlot7Stage||0)>=6 && !saved.storyPlot8NoteAdded){
      saved.storyPlot8NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot8NoteAdded && !saved.storyEighthSmsDelivered){
      saved.storyPlot8Ready=true;saved.storyPlot8DateChanged=true;persist();
    }
    if(p==='notes' && (saved.storyPlot8Stage||0)>=3 && !saved.storyPlot9NoteAdded){
      saved.storyPlot9NoteAdded=true;persist();
    }
    if(p==='home' && previous==='notes' && saved.storyPlot9NoteAdded && !saved.storyNinthSmsDelivered){
      saved.storyPlot9Ready=true;saved.storyPlot9DateChanged=true;persist();
    }
    if(p==='notes' && (saved.storyPlot9Stage||0)>=3 && !saved.storyPlot10NoteAdded){
      saved.storyPlot10NoteAdded=true;saved.storyPlot10DateChanged=true;persist();
    }
    if(p==='sms'){
      if(saved.storyNinthSmsDelivered)saved.storyNinthSmsOpened=true;
      if(saved.storyEighthSmsDelivered)saved.storyEighthSmsOpened=true;
      if(saved.storySeventhSmsDelivered)saved.storySeventhSmsOpened=true;
      if(saved.storySixthSmsDelivered)saved.storySixthSmsOpened=true;
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
    saved.currentPage=p;
    saved.currentSelection=id;
    persist();
    render();
    if((unlocking || (p!=='lock' && !saved.storyFirstSmsDelivered)) && !saved.storyFirstSmsDelivered)startStoryBrowsing();
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
    if(p==='home' && saved.storyPlot6Ready && !saved.storySixthSmsDelivered){
      scheduleStoryUi(()=>{
        if(page!=='home' || saved.storySixthSmsDelivered)return;
        saved.storySixthSmsDelivered=true;
        saved.storyPlot6Stage=0;
        notificationVisible=true;
        persist();
        showStoryNotification();
      },cfg.story.plot6HomeDelayMs);
    }
    if(p==='home' && saved.storyPlot7Ready && !saved.storySeventhSmsDelivered){
      scheduleStoryUi(()=>{
        if(page!=='home' || saved.storySeventhSmsDelivered)return;
        saved.storySeventhSmsDelivered=true;
        saved.storyPlot7Stage=0;
        notificationVisible=true;
        persist();
        showStoryNotification();
      },cfg.story.plot7HomeDelayMs);
    }
    for(const n of [8,9]){
      const word=n===8?'Eighth':'Ninth';
      const ready='storyPlot'+n+'Ready';
      const delivered='story'+word+'SmsDelivered';
      if(p==='home' && saved[ready] && !saved[delivered]){
        scheduleStoryUi(()=>{
          if(page!=='home' || saved[delivered])return;
          saved[delivered]=true;
          saved['storyPlot'+n+'Stage']=0;
          notificationVisible=true;
          persist();
          showStoryNotification();
        },cfg.story['plot'+n+'HomeDelayMs']);
      }
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
    const ninth=saved.storyNinthSmsDelivered && !saved.storyNinthSmsOpened;
    const eighth=saved.storyEighthSmsDelivered && !saved.storyEighthSmsOpened;
    const seventh=saved.storySeventhSmsDelivered && !saved.storySeventhSmsOpened;
    const sixth=saved.storySixthSmsDelivered && !saved.storySixthSmsOpened;
    const fifth=saved.storyFifthSmsDelivered && !saved.storyFifthSmsOpened;
    const fourth=saved.storyFourthSmsDelivered && !saved.storyFourthSmsOpened;
    const third=saved.storyThirdSmsDelivered && !saved.storyThirdSmsOpened;
    const second=saved.storySecondSmsDelivered && !saved.storySecondSmsOpened;
    const first=saved.storyFirstSmsDelivered && !saved.storyFirstSmsOpened;
    if(!ninth && !eighth && !seventh && !sixth && !fifth && !fourth && !third && !second && !first)return;
    const msg=ninth?cfg.story.plot9Notification:eighth?cfg.story.plot8Notification:seventh?cfg.story.plot7Notification:(sixth?cfg.story.plot6Notification:(fifth?cfg.story.plot5Notification:(fourth?cfg.story.plot4Notification:(third?cfg.story.plot3Message:(second?cfg.story.secondMessage:cfg.story.firstMessage)))));
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
  function storyClock(){
    for(const n of [10,9,8,7,6,5,4,3,2]){
      if(saved['storyPlot'+n+'DateChanged'])return cfg.story['plot'+n+'Date'].time;
    }
    return saved.storyFirstSmsDelivered?'9:28':cfg.phone.time;
  }
  function storyCalendarDate(){
    for(const n of [10,9,8,7,6,5,4,3,2]){
      if(saved['storyPlot'+n+'DateChanged'])return cfg.story['plot'+n+'Date'];
    }
    return cfg.phone.date;
  }
  function status(time=storyClock(),light=false){
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
  // A journal update stays unread until its entry is actually opened.
  // Opening the Notes list alone must not clear the indicator.
  function unreadStoryNotes(){
    const read=new Set(saved.readStoryNoteIds||[]);
    const notes=[2,3,4,5,6,7,8,9,10]
      .filter(n=>saved['storyPlot'+n+'NoteAdded'])
      .map(n=>cfg.story['plot'+n+'Note']);
    if(saved.kiddoSecretNoteUnlocked)notes.push(cfg.story.kiddoSecretNote);
    return notes.filter(n=>n&&!read.has(n.id));
  }
  function hasUnreadStoryNotes(){return unreadStoryNotes().length>0;}
  function appTile(label,type,graphic,count,target=type){
    const decorative=type==='safari'||type==='music';
    const b=decorative?elem('div','home-app home-app-decorative'):click('','home-app',()=>setPage(target));
    if(decorative)b.setAttribute('aria-hidden','true');
    const icon=elem('div','tile '+type); if(graphic)icon.append(elem('span','',graphic));
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
    const postEnding=!!saved.storyValentineUnlocked;
    if(postEnding)root.classList.add('post-ending-lock');
    const wallpaper=postEnding?'assets/post-ending-lockscreen.jpg':cfg.lockScreen.wallpaper;
    const scene=elem('div','lock-scene');
    const backdrop=img(wallpaper,'');
    backdrop.className='lock-backdrop';
    backdrop.draggable=false;
    const portrait=img(wallpaper,postEnding?'Lalee and Miu together':'Lock screen portrait');
    portrait.className='lock-portrait';
    portrait.draggable=false;
    // Keep the original wallpaper as a safe fallback until the new photo asset is uploaded.
    if(postEnding){
      const fallback=()=>{backdrop.src=cfg.lockScreen.wallpaper;portrait.src=cfg.lockScreen.wallpaper;};
      backdrop.addEventListener('error',fallback,{once:true});
      portrait.addEventListener('error',fallback,{once:true});
    }
    scene.append(backdrop,portrait);

    const indicators=elem('div','lock-indicators');
    indicators.innerHTML=svg('signal')+svg('wifi');
    const battery=elem('div','lock-battery battery-full');battery.setAttribute('aria-label','Battery full');
    indicators.append(battery);
    scene.append(indicators);
    scene.append(elem('div','lock-date',postEnding?'February 14, 2028':cfg.lockScreen.date));
    scene.append(elem('div','lock-clock',postEnding?'11:25':cfg.lockScreen.time));

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
    const root=elem('section','page home');root.append(status(storyClock(),true));
    const main=elem('div','home-content');
    const imageButton=click('','photo-widget',()=>setPage('photos'));imageButton.append(img(cfg.phone.homePhoto,'Photos'));main.append(imageButton);
    main.append(elem('div','photo-label','Photos'));
    const grid=elem('div','home-grid');const cal=click('','calendar-card',()=>setPage('calendar'));
    const homeDate=storyCalendarDate();
    cal.append(elem('div','cal-weekday',homeDate.weekday),elem('div','cal-day',homeDate.day),elem('div','cal-detail',(saved.storyPlot2DateChanged||saved.storyPlot3DateChanged||saved.storyPlot4DateChanged||saved.storyPlot5DateChanged||saved.storyPlot6DateChanged||saved.storyPlot7DateChanged||saved.storyPlot8DateChanged||saved.storyPlot9DateChanged||saved.storyPlot10DateChanged)?homeDate.month:homeDate.detail));grid.append(cal);
    const notesTile=appTile('Notes','notes');
    if(hasUnreadStoryNotes()){
      const redDot=elem('span','notes-home-unread-dot');
      redDot.setAttribute('aria-label','Unread journal update');
      notesTile.querySelector('.tile')?.append(redDot);
    }
    grid.append(appTile('Camera','camera'),appTile('Instagram','instagram'),appTile('LINE','line','',null,'line-list'),notesTile);
    main.append(grid);main.append(elem('div','home-search','⌕  Search'));root.append(main);
    const dock=elem('div','dock');dock.append(appTile('','phoneicon','☎',null,'phone'),appTile('','safari','◉',null,'safari'),appTile('','messagesicon','●',cfg.phone.unreadMessages,'sms'),appTile('','music','♫',null,'music'));
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
    let last=entries.length?entries[entries.length-1].text:'';
    if((saved.storyPlot10LineStage||0)>=2)last=cfg.story.plot10LineAnswer;
    else if(saved.storyPlot10LineSentCount>0)last=cfg.story.plot10LineReplies[saved.storyPlot10LineSentCount-1];
    if(saved.storyValentineUnlocked && saved.lineEasterMessages?.length)last=saved.lineEasterMessages[saved.lineEasterMessages.length-1].text;
    details.append(elem('span','line-conversation-preview',last));
    conversation.append(details);
    const when=elem('div','line-conversation-date',saved.storyPlot10NoteAdded?'22 Jan 2028':'25 Nov 2027');
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

  // Post-ending LINE Easter eggs: these never run during the six scripted confession messages.
  // The outgoing messages, queued replies and one-time discoveries live in the existing local save.
  const lineEasterFallbacks=[
    "Laleee, you're cute when you text me for no reason.",
    "Baby, come tell me that in person 🧸",
    "I'm listening, my love~",
    "You know you can just come cuddle me, right?",
    "Hehehe. What is my girlfriend up to now?",
    "I'll reply properly after one kiss. That's the rule."
  ];
  const lineEasterNormalize=value=>value.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  // Phrase-aware matching prevents "miss" matching unrelated words such as "dismiss".
  const lineEasterHas=(normalized,...phrases)=>phrases.some(phrase=>(' '+normalized+' ').includes(' '+phrase+' '));
  function lineEasterReplies(message){
    const n=lineEasterNormalize(message);
    const has=(...phrases)=>lineEasterHas(n,...phrases);
    const fallback=()=>[lineEasterFallbacks[Math.floor(Math.random()*lineEasterFallbacks.length)]];
    const stage=saved.lineEasterContext||'';
    const context=value=>{saved.lineEasterContext=value;};
    const hug=()=>[
      "Cominggggggg 🐙🐙🐙",
      "*squeeeeeze 👾🫂*",
      "Charging my Lalee... 10%",
      "... 50%",
      "... 99%！",
      "Oops. Battery stuck at 99%. One kiss required to complete charging 😗"
    ];
    const waterReward=()=>[
      "REALLY????",
      "MY LALEE DRANK WATER?????",
      "EVERYONE PLEASE CLAP 👏👏👏",
      "Hehehe good girl. Now come get your reward 😚"
    ];
    // Miu is deliberately silent after a plea to skip water: only an apology ends the read-without-reply state.
    if(stage==='water-apology'){
      if(has('sorry','i am sorry','i m sorry','apologize','apologise','forgive me')){
        context('water-wait');
        return ["Okayyyy. Apology accepted, Lalee. 🥺","Now one glass of water, please. I'll wait.","Then you can have your goodnight kiss 😚"];
      }
      return [];
    }
    // Preserve the original one-time discoveries and their exact unlock text.
    if(n==='if we never met'){
      context('');
      if(saved.lineEasterUniverseSeen)return fallback();
      saved.lineEasterUniverseSeen=true;
      return [
        "Then I would've found you in some other way.",
        "Maybe at a coffee shop. Or on a train.",
        "I don't know, Lalee.",
        "But I think I would've fallen in love with you in every universe ✨",
        "Stop making me emotional. Come kiss meeeeee😠"
      ];
    }
    if(n==='marry me'){
      context('');
      return ["Lalee, I said that “I really do” years ago…","Ask me in person, I will say that again."];
    }
    // Contextual follow-ups take priority over generic yes/no, love, or cuddle triggers.
    if(stage==='sad-choice'){
      if(has('hug','hugs','cuddle','cuddles','hold me','squeeze me','just hold me')){
        context('sad-recharging');return hug();
      }
      if(has('talk','listen','i wanna talk','i want to talk','tell you')){
        context('sad-talk');
        return ["Of course, babe. I'm all ears. 🧸","Did you have a long day at work again? Or did something happen?"];
      }
      if(has('nothing','i don t know','i dont know','idk','not sure')){
        context('');
        return ["That's okay na Lalee.","You don't have to explain everything to me.","Just come sit next to me, okay?","I'll hold you until your little brain stops being mean to yourself. 🤎"];
      }
    }
    if(stage==='sad-talk'){
      if(has('work','working','worked','tired','exhausted','long day','busy','stress','stressed')){
        context('sad-food');
        return ["My poor Lalee 🥺","Have you eaten anything today?"];
      }
      if(has('nothing','i don t know','i dont know','idk')){
        context('');
        return ["That's okay na Lalee.","You don't have to explain everything to me.","Just come sit next to me, okay?","I'll hold you until your little brain stops being mean to yourself. 🤎"];
      }
      context('');
      return ["I'm listening, babe. 🧸","Come here. You don't have to handle everything by yourself."];
    }
    if(stage==='sad-food'){
      if(has('no','nope','nah','not yet','haven t','havent','didn t','didnt','not eaten','i forgot')){
        context('');
        return ["LALEEEEEEEE 😠","I'm ordering you food. RIGHT NOW.","And don't you dare tell me you're not hungry.","You can be sad, babe. But you cannot be sad AND starving. Not on my watch."];
      }
      if(has('yes','yeah','yep','i did','already ate','i ate','of course')){
        context('');
        return ["That's more like it~~ 😌","Now come cuddle me pleassseeee!","That's an order from Ms. Schuett.😠"];
      }
    }
    if(stage==='water-choice'||stage==='water-wait'){
      if(has('coffee is water')){
        context('water-choice');
        return ["Lalee.","Don't make me start.","I have said a million of times...COFFEE IS NOT WATER!!! 😠"];
      }
      if(has('done','i drank water','drank water','had water','i had water','finished','i did it')){
        context('');return waterReward();
      }
      if(has('please','pretty please','baby','babe','plsss','pleassse')){
        context('water-apology');
        return ["...","Don't try. 😑","One glass of water first. THEN we will talk."];
      }
      if(has('no','nope','nah','not yet','haven t','havent')){
        context('water-wait');
        return ["I KNEW IT!!!!!","Two litres of water every day! YOU PROMISED! 😤","Go get a glass RIGHT NOW.","I'll wait. Otherwise, no goodnight kiss tonight!🥱"];
      }
    }
    if(stage==='flirt-kiss' && has('100 please','100','yes','yeah','yep','please','okay','ok')){
      context('');
      return ["MWAH MWAH MWAH MWAH 😚😚😚","That's five. 95 more to go.","Come here. This might take a while."];
    }
    if(stage==='mad-followup'){
      if(has('you ignored me','ignored me','ignore me','you disappeared','disappeared')){
        context('');
        return ["Oh baby, I'm sorry.","I didn't mean to make you feel that way.","I should've told you I was busy instead of disappearing.","Can I make it up to you? 🥺"];
      }
      if(has('nothing','never mind','nevermind')){context('');return ["Okay, baby. I'm here when you're ready. 🥺"];}
    }
    if(stage==='sad-recharging' && has('kiss','kiss me','mwah')){
      context('');return ["MWAHHHH 😚","Charging complete! Hehehe. Feeling a little better now, my Lalee? 🥺"];
    }
    // Strong, specific emotions override the ordinary romantic and teasing responses.
    if(has('do you still love me','do you love me anymore','you still love me')){
      context('');
      return ["Lalee...","Of course I do.","I loved you when I was eighteen.","I loved you when I thought I couldn't have you.","And I love you even more now that I get to call you mine.","Come here naaaa. Let me kiss that overthinking brain of yours. 🦋"];
    }
    if(has('i m mad at you','i am mad at you','mad at you','i m angry','i am angry','i m upset with you','angry at you')){
      context('mad-followup');
      return ["Baby? 🥺","Did I do something wrong?","Tell me, Lalee. I'm listening.","OKAY, if you don't answer, I will be mad too!🙄"];
    }
    if(has('you ignored me','ignored me','you disappeared')){
      context('');
      return ["Oh baby, I'm sorry.","I didn't mean to make you feel that way.","I should've told you I was busy instead of disappearing.","Can I make it up to you? 🥺"];
    }
    if(has('jealous','jealousy')){
      context('');
      return ["Jealous? Why? What happened?","Is this about someone I was talking to?","Lalee, look at me.","You're my girlfriend! My one and only.","There's nobody else Ms. Schuett wanna comes home to. Just you. 🤎"];
    }
    if(has('sad','upset','unhappy','crying','cry','feeling down','feel down','heartbroken','feeling low')){
      context('sad-choice');
      return ["Laleeeee 🥺","I am here~ come over and I will give u a recharge☺️🔋","Do you wanna talk about it or do you just need a bigggg hug?🥺"];
    }
    if(has('coffee is water')){
      context('water-choice');
      return ["Lalee.","Don't make me start.","I have said a million of times...COFFEE IS NOT WATER!!! 😠"];
    }
    if(has('bubble tea','boba','coffee','milk tea','matcha')){
      context('water-choice');
      return ["NOOOOOOOOO 😠","Lalee. WATER. W-A-T-E-R.","Have you had even ONE glass of water today???"];
    }
    if(has('stop teasing me','stop teasing','don t tease me','dont tease me')){
      context('');
      return ["But it's my favourite hobby 🥺","Okay okay I'll behave.","...","For approximately 3 seconds. 😈"];
    }
    if(has('bumbum','your butt','your bum','booty')){
      context('');
      return ["LALEEEEE 😳","Why are you so obsessed with my bumbum???","...","Okay fine. I'm obsessed with yours too 🍑😈"];
    }
    if(has('you re cute','you are cute','so pretty','you re pretty','you are pretty','so cute','beautiful')){
      context('');
      return ["I know ka 😌","But you know what's even cuter?","My girlfriend when she gets all shy and her ears turn red.","Hehehehe. Is that happening right now, Lalee? 🤭"];
    }
    if(has('kiss me','i want a kiss','give me a kiss','i need a kiss','kisses','kiss')){
      context('flirt-kiss');
      return ["Just one? 🥺","You don't love me? Lalee.","I was planning on giving you at least 100."];
    }
    if(has('hug me','i need a hug','i want a hug','cuddle me','hold me')){
      context('sad-recharging');return hug();
    }
    // Keep previously available post-ending replies.
    if(n==='where are you'){context('');return ["???","I am right next to you on this bed?"];}
    if(n==='what are you doing'){context('');return ["Thinking about your bumbum 🍑😈"];}
    if(n==='good night'){context('');return ["Good night, Laleee~","Wait!","Where’s my goodnight kiss~~~🐙"];}
    if(has('miss','missing')){context('');return ["Didn't I just kiss you goodbye 20 minutes ago?","......","I miss you more lalee~~~ Come home early tonight 🫣"];}
    if(has('hungry')){context('');return ["I “fed” you last night already!!!","Babe, there is literally food in the fridge🫠"];}
    if(has('love')){
      context('');
      if(n==='i love you'){
        saved.lineEasterLoveCount=(saved.lineEasterLoveCount||0)+1;
        if(saved.lineEasterLoveCount>=2)return ["hehehe I love you toooooo xxooxo"];
      }
      return ["I know ka","Say it one more time. I like hearing it."];
    }
    context('');
    return fallback();
  }
  function lineEasterTyping(messages){
    const row=elem('div','story-typing-row line-easter-typing');
    const bubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)bubble.append(elem('span','story-typing-dot'));
    row.append(bubble,elem('span','story-typing-label','Kiddo is typing...'));
    messages.append(row);scrollDown(messages);
    return row;
  }
  function lineEasterContinue(messages,refreshComposer){
    if(page!=='line'||!messages.isConnected||!saved.lineEasterPending?.replies?.length)return;
    let typing=lineEasterTyping(messages);
    const deliver=()=>{
      if(page!=='line'||!messages.isConnected)return;
      const pending=saved.lineEasterPending;
      if(!pending?.replies?.length){typing.remove();refreshComposer();return;}
      typing.remove();
      const next=pending.replies.shift();
      const response={from:'them',text:next.text};
      saved.lineEasterMessages.push(response);
      // Unlock only after Kiddo's special second "I love you" response arrives.
      if(saved.storyValentineUnlocked && next.text===kiddoSecretTrigger){
        saved.kiddoSecretNoteUnlocked=true;
      }
      if(pending.replies.length){
        const isLastUniverseReply=pending.universe && pending.replies.length===1;
        pending.nextAt=Date.now()+(isLastUniverseReply?2000:1200);
      }else saved.lineEasterPending=null;
      persist();
      renderMessages(messages,[response]);
      messages.lastElementChild?.classList.add('story-bubble-enter');
      scrollDown(messages);
      refreshComposer();
      if(saved.lineEasterPending?.replies?.length){
        typing=lineEasterTyping(messages);
        scheduleStoryUi(deliver,Math.max(0,saved.lineEasterPending.nextAt-Date.now()));
      }
    };
    scheduleStoryUi(deliver,Math.max(0,saved.lineEasterPending.nextAt-Date.now()));
  }
  function lineEasterComposer(messages){
    const form=elem('form','composer');
    form.setAttribute('autocomplete','off');
    form.append(elem('span','composer-icon','+'));
    const input=elem('input','composer-field');
    input.type='text';input.placeholder='Message...';input.maxLength=2500;
    input.autocomplete='off';input.setAttribute('aria-label','Message Kiddo');
    const send=elem('button','send','Send');send.type='submit';
    const refresh=()=>{
      const busy=!!saved.lineEasterPending?.replies?.length;
      input.disabled=busy;send.disabled=busy||!input.value.trim();
    };
    input.addEventListener('input',refresh);
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const message=input.value.trim();
      if(!message||saved.lineEasterPending?.replies?.length)return;
      const normalized=lineEasterNormalize(message);
      const universe=normalized==='if we never met'&&!saved.lineEasterUniverseSeen;
      const replies=lineEasterReplies(message);
      if(!Array.isArray(saved.lineEasterMessages))saved.lineEasterMessages=[];
      const outgoing={from:'me',text:message,read:true};
      saved.lineEasterMessages.push(outgoing);
      saved.lineEasterPending=replies.length?{replies:replies.map(text=>({text})),nextAt:Date.now()+2000,universe}:null;
      persist();
      renderMessages(messages,[outgoing]);
      messages.lastElementChild?.classList.add('story-bubble-enter');
      input.value='';refresh();scrollDown(messages);
      if(saved.lineEasterPending)lineEasterContinue(messages,refresh);
    });
    form.append(input,send);
    refresh();
    return {form,refresh};
  }
  function line(){
    const root=appShell('', 'line-list');const navTitle=root.querySelector('.nav-center');
    navTitle.replaceChildren();const profile=click('','nav-center',()=>setPage('kiddo-profile'));
    profile.append(avatar(cfg.line.avatar),elem('div','nav-title',cfg.line.name));navTitle.replaceWith(profile);
    const right=root.querySelector('.nav-right');right.append(click('⌕','',()=>{const sc=root.querySelector('.scroll');sc?.scrollTo({top:0,behavior:'smooth'})}),click('☰','',()=>setPage('kiddo-profile')));
    const messages=elem('div','scroll chat-view line-chat');
    messages.style.background=cfg.line.background||'#91aed9';
    const history=[...(cfg.line.messages||[]),...saved.lineSent];
    if(saved.storyPlot10NoteAdded){
      history.push({type:'date',text:'January 22, 2028'});
      const count=Math.min(saved.storyPlot10LineSentCount||0,cfg.story.plot10LineReplies.length);
      for(let i=0;i<count;i++)history.push({from:'me',text:cfg.story.plot10LineReplies[i],plot10:true});
      if((saved.storyPlot10LineStage||0)>=2)history.push({from:'them',text:cfg.story.plot10LineAnswer});
    }
    if(saved.storyValentineUnlocked && Array.isArray(saved.lineEasterMessages))history.push(...saved.lineEasterMessages);
    renderMessages(messages,history);root.append(messages);
    if(saved.storyPlot10NoteAdded){
      const stage=saved.storyPlot10LineStage||0;
      if(stage===0)root.append(plot10LineComposer(messages));
      else{
        const inactive=elem('div','composer story-composer story-composer-inactive');
        inactive.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Message...'));
        root.append(inactive);
      }
      if(stage===1)scheduleStoryUi(()=>plot10LineReadAndAnswer(messages),3000);
      if(stage>=2)markPlot10Read(messages);
      if(stage>=2 && saved.storyValentineUnlocked){
        const easter=lineEasterComposer(messages);
        root.lastElementChild.remove();
        root.append(easter.form);
        host.append(root);scrollDown(messages);
        if(saved.lineEasterPending?.replies?.length)lineEasterContinue(messages,easter.refresh);
        return;
      }
    }else root.append(composer('line','Message...'));
    host.append(root);scrollDown(messages);
  }
  function plot10LineComposer(messages){
    const form=elem('div','composer story-composer plot10-line-composer');
    form.append(elem('span','composer-icon','+'));
    const replies=cfg.story.plot10LineReplies;
    const valid=()=>page==='line'&&messages.isConnected&&(saved.storyPlot10LineStage||0)===0;
    const field=click('Message...','composer-field story-scripted-input',()=>{
      if(!valid())return;
      const index=saved.storyPlot10LineSentCount||0;
      if(index>=replies.length)return;
      storyDraft(field,replies[index],send,valid,'line');
    });
    const send=storySendArrow(form,()=>{
      if(!valid()||send.disabled||field.dataset.ready!=='yes')return;
      const index=saved.storyPlot10LineSentCount||0;
      if(index>=replies.length)return;
      send.disabled=true;field.dataset.ready='no';
      send.classList.remove('story-send-ready');
      renderMessages(messages,[{from:'me',text:replies[index],plot10:true}]);
      messages.lastElementChild?.classList.add('story-bubble-enter');
      saved.storyPlot10LineSentCount=index+1;persist();
      field.textContent='Message...';scrollDown(messages);
      if(index+1===replies.length){
        saved.storyPlot10LineStage=1;persist();
        scheduleStoryUi(()=>plot10LineReadAndAnswer(messages),3000);
      }
    });
    field.setAttribute('aria-label','Tap to type each LINE message, then tap Send');
    form.insertBefore(field,send);
    return form;
  }
  function markPlot10Read(messages){
    // No individual Read receipts while the six-message confession is in progress.
    // Once all six have been sent, reveal all six receipts together.
    const total=cfg.story.plot10LineReplies.length;
    if((saved.storyPlot10LineSentCount||0)<total)return;
    const rows=[...messages.querySelectorAll('.chat-row.me.plot10-outgoing')];
    if(rows.length!==total)return;
    rows.forEach(row=>{
      if(row.querySelector('.plot10-read'))return;
      const meta=row.querySelector('.line-message-meta');
      const mark=elem('span','plot10-read','Read');
      (meta||row).append(mark);
    });
  }
  function plot10LineReadAndAnswer(messages){
    if(page!=='line' || !messages.isConnected || (saved.storyPlot10LineStage||0)!==1)return;
    markPlot10Read(messages);
    const root=messages.parentElement;
    const banner=elem('div','plot10-line-typing',cfg.line.name+' is typing...');
    root.insertBefore(banner,messages);
    scheduleStoryUi(()=>{
      if(page!=='line' || !messages.isConnected || (saved.storyPlot10LineStage||0)!==1)return;
      banner.remove();
      const reply={from:'them',text:cfg.story.plot10LineAnswer};
      renderMessages(messages,[reply]);
      messages.lastElementChild?.classList.add('story-bubble-enter');
      saved.storyPlot10LineStage=2;
      saved.storyValentineUnlocked=true;
      persist();
      // Unlock free chat immediately after Kiddo's final scripted reply.
      const inactive=root.querySelector('.story-composer-inactive');
      if(inactive){
        const easter=lineEasterComposer(messages);
        inactive.replaceWith(easter.form);
      }
      scrollDown(messages);
    },2500);
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
    return storyReplyComposer({plot:'plot4',stage,messageStage:stage===0?1:3,nextStage:stage===0?1:4,messages,className:'plot4-composer'});
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
  // Deliver each incoming SMS bubble separately, with a short typing pause.
  // Persist the number already delivered so leaving and reopening Messages
  // never repeats a bubble within the current session.
  // One source of truth for scripted bubble visibility: a bubble is visible
  // only after its individual typing/delivery animation has completed.
  function storyVisibleMessages(plot,stage,items){
    const counts=saved.storyBubbleCounts||{};
    const incomingSeen={};
    const outgoingSeen={};
    return items.filter(item=>{
      const key=plot+':'+item.stage;
      if(item.from==='them'){
        if(item.stage<stage)return true;
        if(item.stage>stage)return false;
        const n=incomingSeen[key]||0;
        incomingSeen[key]=n+1;
        return n<(counts[key]||0);
      }
      if(item.from==='me'){
        if(item.stage<stage)return true;
        const n=outgoingSeen[key]||0;
        outgoingSeen[key]=n+1;
        return n<(counts[key+':sent']||0) ||
          // Plot 3 uses its own single-message typing sequence.
          (plot==='plot3' && stage===7 && item.stage===7) ||
          // Existing completed Plot 6 sessions predate per-bubble counts.
          (plot==='plot6' && stage===1 && item.stage===1);
      }
      return false;
    });
  }
  // A scripted draft is never sent until the player taps the arrow.
  function storySendArrow(form,onSend){
    const send=click('↑','story-send-arrow',onSend);
    send.disabled=true;
    send.setAttribute('aria-label','Send message');
    form.append(send);
    return send;
  }
  function storyDraft(field,text,send,valid=()=>true,context='sms'){
    if(field.dataset.typing==='yes'||field.dataset.ready==='yes')return;
    field.dataset.typing='yes';field.dataset.ready='no';
    field.classList.add('story-typing-active');field.textContent='';
    send.disabled=true;let pos=0;
    const step=()=>{
      if(page!==context||!field.isConnected||!valid())return;
      pos++;field.textContent=text.slice(0,pos);
      if(pos<text.length)scheduleStoryUi(step,Math.max(14,Math.min(38,Math.floor(2600/Math.max(text.length,1)))));
      else{
        field.dataset.typing='no';field.dataset.ready='yes';
        send.disabled=false;field.classList.remove('story-typing-active');
        send.classList.add('story-send-ready');
      }
    };
    scheduleStoryUi(step,130);
  }
  function storyReplyComposer({plot,stage,messageStage,nextStage,messages,className}){
    const form=elem('div','composer story-composer '+className);
    form.append(elem('span','composer-icon','+'));
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>startDraft());
    const key=plot+':'+messageStage+':sent';
    const replies=cfg.story[plot+'Messages'].filter(m=>m.stage===messageStage&&m.from==='me');
    const stageKey='story'+plot[0].toUpperCase()+plot.slice(1)+'Stage';
    const count=()=>((saved.storyBubbleCounts||{})[key]||0);
    const valid=()=>page==='sms'&&(saved[stageKey]||0)===stage;
    const send=storySendArrow(form,()=>{
      if(!valid()||field.dataset.ready!=='yes'||send.disabled)return;
      const index=count(),item=replies[index];if(!item)return;
      send.disabled=true;send.classList.remove('story-send-ready');
      field.dataset.ready='no';field.textContent='Text Message · SMS';
      renderMessages(messages,[item]);
      const row=messages.lastElementChild;
      if(row?.classList.contains('chat-row'))row.classList.add('story-bubble-enter');
      if(!saved.storyBubbleCounts)saved.storyBubbleCounts={};
      saved.storyBubbleCounts[key]=index+1;persist();scrollDown(messages);
      if(index+1>=replies.length)scheduleStoryUi(()=>{
        if(!valid())return;
        saved[stageKey]=nextStage;persist();render();
      },420);
    });
    function startDraft(){
      if(!valid()||count()>=replies.length)return;
      storyDraft(field,replies[count()].text,send,valid);
    }
    field.setAttribute('aria-label','Tap to type reply, then tap Send');
    form.insertBefore(field,send);
    return form;
  }
  function storyIncomingSequence(messages,plot,stage,nextStage=null){
    const items=cfg.story[plot+'Messages'].filter(item=>item.stage===stage && item.from==='them');
    const key=plot+':'+stage;
    const stageKey='story'+plot[0].toUpperCase()+plot.slice(1)+'Stage';
    let delivered=(saved.storyBubbleCounts||{})[key]||0;
    if(delivered>=items.length){
      // Resume the final Plot 3 reaction only after Natsha's name is visible.
      if(plot==='plot3' && stage===6){
        scheduleStoryUi(()=>{
          if(page!=='sms' || !messages.isConnected || (saved[stageKey]||0)!==6)return;
          const root=messages.parentElement;
          const idle=root?.querySelector('.story-composer-inactive');
          if(idle){
            idle.replaceWith(plot3Composer(6));
            plot3FinalDraft(root);
          }
        },480);
      }else if(nextStage!==null)scheduleStoryUi(()=>{
        if(page!=='sms' || (saved[stageKey]||0)!==stage)return;
        saved[stageKey]=nextStage;
        persist();render();
      },480);
      return;
    }

    // Keep the same message list mounted during a batch. Rebuilding the
    // entire screen for every bubble caused scroll jumps and delayed replies.
    const indicator=elem('div','story-typing-row');
    indicator.setAttribute('aria-label',(saved.storyContactName||'Unknown Number')+' is typing');
    const typingBubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)typingBubble.append(elem('span','story-typing-dot'));
    indicator.append(typingBubble,elem('span','story-typing-label',(saved.storyContactName||'Unknown Number')+' is typing…'));

    const stillHere=()=>page==='sms' && messages.isConnected && (saved[stageKey]||0)===stage;
    const finish=()=>{
      if(!stillHere())return;
      indicator.remove();
      // The reply field only becomes clickable after the final incoming
      // bubble has actually appeared and had a moment to settle.
      scheduleStoryUi(()=>{
        if(!stillHere())return;
        if(nextStage!==null){
          saved[stageKey]=nextStage;
          persist();
          render();
          return;
        }
        const idle=messages.parentElement?.querySelector('.story-composer-inactive');
        if(!idle)return;
        let composer=null;
        if(plot==='plot3' && (stage===0 || stage===3 || stage===6))composer=plot3Composer(stage);
        if(plot==='plot4' && stage===0)composer=plot4Composer(messages,0);
        if(plot==='plot5' && stage===0)composer=plot5Composer(messages,0);
        if(plot==='plot6' && stage===0)composer=plot6Composer(messages);
        if(composer){
          idle.replaceWith(composer);
          if(plot==='plot3' && stage===6)plot3FinalDraft(messages.parentElement);
        }
      },480);
    };
    const showNext=()=>{
      if(!stillHere())return;
      if(delivered>=items.length){finish();return;}
      messages.append(indicator);
      scrollDown(messages);
      scheduleStoryUi(()=>{
        if(!stillHere())return;
        indicator.remove();
        const item=items[delivered];
        renderMessages(messages,[item]);
        const row=messages.lastElementChild;
        if(row?.classList.contains('chat-row'))row.classList.add('story-bubble-enter');
        delivered++;
        if(!saved.storyBubbleCounts)saved.storyBubbleCounts={};
        saved.storyBubbleCounts[key]=delivered;
        persist();
        scrollDown(messages);
        if(delivered<items.length){
          scheduleStoryUi(showNext,380);
        }else{
          finish();
        }
      },delivered===0?850:720);
    };
    showNext();
  }
  function smsFinalArc(plotNumber){
    const plot='plot'+plotNumber;
    const stage=Number(saved['storyPlot'+plotNumber+'Stage'])||0;
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');
    contact.append(smsAvatar(),click(saved.storyContactName||'Natsha','sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    const priorDates={3:'December 5, 2027',4:'December 12, 2027',5:'December 19, 2027',6:'December 26, 2027',7:'January 1, 2028',8:'January 8, 2028',9:'January 15, 2028'};
    for(let n=3;n<=plotNumber;n++){
      history.push({type:'date',text:priorDates[n]});
      if(n<plotNumber)history.push(...cfg.story['plot'+n+'Messages']);
      else history.push(...storyVisibleMessages(plot,stage,cfg.story[plot+'Messages']));
    }
    renderMessages(messages,history);
    root.append(messages);
    if(stage===1){
      root.append(finalArcComposer(messages,plot,stage));
    }else{
      const idle=elem('div','composer story-composer story-composer-inactive');
      idle.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly',stage>=3?'Text Message':'Waiting for message…'));
      root.append(idle);
    }
    host.append(root);
    scrollDown(messages);
    if(stage===0 || stage===2)storyIncomingSequence(messages,plot,stage,stage===0?1:3);
  }
  function finalArcComposer(messages,plot,stage){
    return storyReplyComposer({plot,stage,messageStage:1,nextStage:2,messages,className:'final-arc-composer'});
  }
  function smsPlot7(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');
    contact.append(smsAvatar(),click(saved.storyContactName||'Natsha','sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'December 5, 2027'});
    for(const msg of cfg.story.plot3Messages)if(msg.stage<=(saved.storyPlot3Stage||0))history.push(msg);
    history.push({type:'date',text:'December 12, 2027'});
    for(const msg of cfg.story.plot4Messages)if(msg.stage<=(saved.storyPlot4Stage||0))history.push(msg);
    history.push({type:'date',text:'December 19, 2027'});
    for(const msg of cfg.story.plot5Messages)if(msg.stage<=(saved.storyPlot5Stage||0))history.push(msg);
    history.push({type:'date',text:'December 26, 2027'});
    for(const msg of cfg.story.plot6Messages)if(msg.stage<=(saved.storyPlot6Stage||0))history.push(msg);
    history.push({type:'date',text:'January 1, 2028'});
    const stage=Number(saved.storyPlot7Stage)||0;
    history.push(...storyVisibleMessages('plot7',stage,cfg.story.plot7Messages));
    renderMessages(messages,history);
    root.append(messages);
    if([1,3,5].includes(stage)){
      root.append(plot7Composer(messages,stage));
    }else{
      const inactive=elem('div','composer story-composer story-composer-inactive');
      inactive.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(inactive);
    }
    host.append(root);scrollDown(messages);
    if([0,2,4].includes(stage)){
      storyIncomingSequence(messages,'plot7',stage,stage+1);
    }
  }
  function plot7Composer(messages,stage){
    return storyReplyComposer({plot:'plot7',stage,messageStage:stage,nextStage:stage+1,messages,className:'plot7-composer'});
  }
  function smsPlot6(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');
    contact.append(smsAvatar(),click(saved.storyContactName||'Natsha','sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'December 5, 2027'});
    for(const msg of cfg.story.plot3Messages)if(msg.stage<=(saved.storyPlot3Stage||0))history.push(msg);
    history.push({type:'date',text:'December 12, 2027'});
    for(const msg of cfg.story.plot4Messages)if(msg.stage<=(saved.storyPlot4Stage||0))history.push(msg);
    history.push({type:'date',text:'December 19, 2027'});
    for(const msg of cfg.story.plot5Messages)if(msg.stage<=(saved.storyPlot5Stage||0))history.push(msg);
    history.push({type:'date',text:'December 26, 2027'});
    const stage=Number(saved.storyPlot6Stage)||0;
    history.push(...storyVisibleMessages('plot6',stage,cfg.story.plot6Messages));
    renderMessages(messages,history);
    root.append(messages);
    const allIncomingShown=(saved.storyBubbleCounts||{})['plot6:0']>=4;
    if(stage===0 && allIncomingShown){
      root.append(plot6Composer(messages));
    }else{
      const idle=elem('div','composer story-composer story-composer-inactive');
      idle.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(idle);
    }
    host.append(root);scrollDown(messages);
    if(stage===0 && !allIncomingShown)storyIncomingSequence(messages,'plot6',0);
  }
  function plot6Composer(messages){
    return storyReplyComposer({plot:'plot6',stage:0,messageStage:1,nextStage:1,messages,className:'plot6-composer'});
  }
  function smsPlot5(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');
    contact.append(smsAvatar(),click(saved.storyContactName||'Natsha','sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'December 5, 2027'});
    for(const msg of cfg.story.plot3Messages)if(msg.stage<=(saved.storyPlot3Stage||0))history.push(msg);
    history.push({type:'date',text:'December 12, 2027'});
    for(const msg of cfg.story.plot4Messages)if(msg.stage<=(saved.storyPlot4Stage||0))history.push(msg);
    history.push({type:'date',text:'December 19, 2027'});
    const stage=Number(saved.storyPlot5Stage)||0;
    history.push(...storyVisibleMessages('plot5',stage,cfg.story.plot5Messages));
    renderMessages(messages,history);root.append(messages);
    if((stage===0 && (saved.storyBubbleCounts||{})['plot5:0']>=2) || stage===3)root.append(plot5Composer(messages,stage));
    else{
      const idle=elem('div','composer story-composer story-composer-inactive');
      idle.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(idle);
    }
    host.append(root);scrollDown(messages);
    if(stage===0 || stage===2)storyIncomingSequence(messages,'plot5',stage,stage===2?3:null);
    if(stage===1)plot5Incoming(messages);
  }
  function plot5Composer(messages,stage){
    return storyReplyComposer({plot:'plot5',stage,messageStage:stage===0?1:3,nextStage:stage===0?1:4,messages,className:'plot5-composer'});
  }
  function plot5Incoming(messages){
    const indicator=elem('div','story-typing-row');
    const bubble=elem('div','story-typing-bubble');
    for(let i=0;i<3;i++)bubble.append(elem('span','story-typing-dot'));
    indicator.append(bubble,elem('span','story-typing-label','Natsha is typing…'));
    messages.append(indicator);scrollDown(messages);
    scheduleStoryUi(()=>{
      if(page!=='sms')return;
      saved.storyPlot5Stage=2;
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
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered)history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'December 5, 2027'});
    for(const msg of cfg.story.plot3Messages)if(msg.stage<=(saved.storyPlot3Stage||0))history.push(msg);
    history.push({type:'date',text:'December 12, 2027'});
    const stage=Number(saved.storyPlot4Stage)||0;
    history.push(...storyVisibleMessages('plot4',stage,cfg.story.plot4Messages));
    renderMessages(messages,history);root.append(messages);
    if((stage===0 && (saved.storyBubbleCounts||{})['plot4:0']>=2) || stage===3)root.append(plot4Composer(messages,stage));
    else{
      const idle=elem('div','composer story-composer story-composer-inactive');
      idle.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(idle);
    }
    host.append(root);scrollDown(messages);
    if(stage===0 || stage===2 || stage===4)storyIncomingSequence(messages,'plot4',stage,stage===0?null:stage+1);
    if(stage===1)plot4Incoming(messages,stage);
  }
  function smsPlot3(){
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');contact.append(smsAvatar());
    const nameButton=click(saved.storyContactName||cfg.sms.name,'sms-number sms-name-button',()=>setPage('sms-contact'));
    contact.append(nameButton,elem('div','sms-meta',cfg.sms.service));
    root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered){
      history.push({type:'date',text:'November 28, 2027'},cfg.story.secondMessage);
    }
    if(saved.storySecondPlayerReplied)history.push({from:'me',text:cfg.story.secondPlayerReply});
    if(saved.storySecondStrangerReplied)history.push({from:'them',text:cfg.story.secondStrangerReply});
    history.push({type:'date',text:'December 5, 2027'});
    const stage=Number(saved.storyPlot3Stage)||0;
    history.push(...storyVisibleMessages('plot3',stage,cfg.story.plot3Messages));
    renderMessages(messages,history);
    root.append(messages);
    if((stage===0 && (saved.storyBubbleCounts||{})['plot3:0']>=2) || (stage===3 && (saved.storyBubbleCounts||{})['plot3:3']>=1) || (stage===6 && (saved.storyBubbleCounts||{})['plot3:6']>=1)){
      root.append(plot3Composer(stage));
    }else{
      const inactive=elem('div','composer story-composer story-composer-inactive');
      inactive.append(elem('span','composer-icon','+'),elem('div','composer-field story-readonly','Text Message'));
      root.append(inactive);
    }
    host.append(root);scrollDown(messages);
    if([0,2,3,5,6].includes(stage))storyIncomingSequence(messages,'plot3',stage,[0,3,6].includes(stage)?null:stage+1);
    if([1,4].includes(stage))plot3Incoming(messages,stage);
    if(stage===6 && (saved.storyBubbleCounts||{})['plot3:6']>=1)plot3FinalDraft(root);
    // Stage 6's three-second reaction starts after the "I am Natsha" bubble
    // is actually mounted, not when the prior "beautiful name" bubble ends.
  }
  function plot3Composer(stage){
    const form=elem('div','composer story-composer plot3-composer');
    form.append(elem('span','composer-icon','+'));
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>{
      if(stage===6||Number(saved.storyPlot3Stage)!==stage)return;
      const text=stage===0?cfg.story.plot3Messages[2].text:'Lena';
      storyDraft(field,text,send,()=>Number(saved.storyPlot3Stage)===stage);
    });
    const send=storySendArrow(form,()=>{
      if(send.disabled||field.dataset.ready!=='yes'||Number(saved.storyPlot3Stage)!==stage)return;
      const text=stage===0?cfg.story.plot3Messages[2].text:stage===3?'Lena':cfg.story.plot3Drafts[2];
      send.disabled=true;field.dataset.ready='no';
      const key='plot3:'+(stage===0?1:stage===3?4:7)+':sent';
      if(!saved.storyBubbleCounts)saved.storyBubbleCounts={};
      saved.storyBubbleCounts[key]=1;
      saved.storyPlot3Stage=stage===0?1:stage===3?4:7;
      persist();render();
    });
    field.setAttribute('aria-label',stage===6?'The final draft is being composed; tap Send when ready':'Tap to type the scripted reply, then Send');
    if(stage===6){field.textContent='Text Message';}
    form.insertBefore(field,send);
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
    const send=root.querySelector('.plot3-composer .story-send-arrow');
    if(!field||!send||field.dataset.reactionStarted==='yes')return;
    field.dataset.reactionStarted='yes';
    const [first,second,final]=cfg.story.plot3Drafts;
    const valid=()=>page==='sms'&&field.isConnected&&(saved.storyPlot3Stage||0)===6;
    send.disabled=true;
    scheduleStoryUi(()=>{
      if(!valid())return;
      plot3Type(field,first,()=>{
        if(!valid())return;
        scheduleStoryUi(()=>plot3Erase(field,()=>{
          if(!valid())return;
          plot3Type(field,second,()=>{
            if(!valid())return;
            scheduleStoryUi(()=>plot3Erase(field,()=>{
              if(!valid())return;
              plot3Type(field,final,()=>{
                if(!valid())return;
                field.classList.remove('story-typing-active');
                field.dataset.ready='yes';send.disabled=false;
                send.classList.add('story-send-ready');
              });
            }),400);
          });
        }),500);
      });
    },cfg.story.plot3ReactionPauseMs);
  }
  function sms(){
    if(saved.storyNinthSmsDelivered)return smsFinalArc(9);
    if(saved.storyEighthSmsDelivered)return smsFinalArc(8);
    if(saved.storySeventhSmsDelivered)return smsPlot7();
    if(saved.storySixthSmsDelivered)return smsPlot6();
    if(saved.storyFifthSmsDelivered)return smsPlot5();
    if(saved.storyFourthSmsDelivered)return smsPlot4();
    if(saved.storyThirdSmsDelivered)return smsPlot3();
    const root=appShell('Messages','home');
    const contact=elem('div','sms-contact');contact.append(smsAvatar());
    contact.append(click(saved.storyContactName||cfg.sms.name,'sms-number sms-name-button',()=>setPage('sms-contact')),elem('div','sms-meta',cfg.sms.service));root.append(contact);
    const messages=elem('div','scroll chat-view sms-chat');
    const history=[...(cfg.sms.messages||[])];
    if(saved.storyFirstSmsDelivered)history.push({type:'date',text:'November 25, 2027'},cfg.story.firstMessage);
    if(saved.storyPlayerReplied)history.push({from:'me',text:cfg.story.playerReply});
    if(saved.storyStrangerReplied)history.push({from:'them',text:cfg.story.strangerReply});
    if(saved.storySecondSmsDelivered){
      history.push({type:'date',text:'November 28, 2027'});
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
    const message=phase===2?cfg.story.secondPlayerReply:cfg.story.playerReply;
    const sent=()=>phase===2?saved.storySecondPlayerReplied:saved.storyPlayerReplied;
    const field=click('Text Message · SMS','composer-field story-scripted-input',()=>{
      if(sent())return;
      storyDraft(field,message,send,()=>!sent());
    });
    const send=storySendArrow(form,()=>{
      if(sent()||field.dataset.ready!=='yes'||send.disabled)return;
      send.disabled=true;field.dataset.ready='no';
      if(phase===2)saved.storySecondPlayerReplied=true;
      else saved.storyPlayerReplied=true;
      persist();
      renderMessages(messages,[{from:'me',text:message}]);
      messages.lastElementChild?.classList.add('story-bubble-enter');
      scrollDown(messages);
      field.textContent='Text Message';field.classList.remove('story-scripted-input');
      field.classList.add('story-readonly');
      scheduleStoryUi(()=>{
        if(page==='sms'&&messages.isConnected)showStrangerTyping(messages,phase);
      },550);
    });
    field.setAttribute('aria-label','Tap to type your reply, then tap Send');
    form.insertBefore(field,send);
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
      else if(item.type==='photo'){
        const row=elem('div','chat-row '+(item.from||'them'));
        const bubble=elem('div','bubble sms-photo-bubble');
        if(item.src){
          const photo=img(item.src,'Photo from Natsha');
          photo.className='sms-story-photo';
          bubble.append(photo);
        }else{
          const placeholder=elem('div','sms-photo-placeholder');
          placeholder.append(elem('div','sms-photo-symbol','▧'),elem('div','sms-photo-caption','Image'));
          bubble.append(placeholder);
        }
        row.append(bubble);container.append(row);
      }
      else if(item.from==='me'||item.from==='them'){
        const row=elem('div','chat-row '+item.from);
        if(item.plot10)row.classList.add('plot10-outgoing');
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
  // Notes are fixed story documents. Players can read them but never add,
  // edit, delete, or overwrite a journal entry.
  function notes(){
    const root=appShell('Notes','home');
    const list=elem('div','app-list notes-list');
    const storyNotes=[10,9,8,7,6,5,4,3,2]
      .filter(n=>saved['storyPlot'+n+'NoteAdded'])
      .map(n=>cfg.story['plot'+n+'Note']);
    const entries=[
      ...(saved.kiddoSecretNoteUnlocked?[cfg.story.kiddoSecretNote]:[]),
      ...storyNotes,...cfg.notes
    ];
    entries.forEach(n=>{
      const b=click('','list-item note-list-item',()=>setPage('note-editor',n.id));
      const detail=elem('div','note-list-copy');
      const preview=(n.body||'').trim();
      detail.append(elem('strong','',preview.split(/\r?\n/)[0]||n.title||'Note'),
        elem('small','',n.date||'Note'));
      b.append(detail);
      if(unreadStoryNotes().some(entry=>entry.id===n.id)){
        const dot=elem('span','note-list-unread-dot');
        dot.setAttribute('aria-label','Unread');
        b.append(dot);
        b.setAttribute('aria-label',(n.title||'Journal entry')+' · Unread');
      }
      b.append(elem('div','chevron','›'));
      list.append(b);
    });
    root.append(list);host.append(root);
  }
  function noteEditor(){
    const config=cfg.notes.find(n=>n.id===selected)
      || (saved.kiddoSecretNoteUnlocked && cfg.story.kiddoSecretNote.id===selected
          ? cfg.story.kiddoSecretNote : null)
      || [10,9,8,7,6,5,4,3,2]
        .filter(n=>saved['storyPlot'+n+'NoteAdded'])
        .map(n=>cfg.story['plot'+n+'Note'])
        .find(n=>n.id===selected);
    if(!config){setPage('notes');return;}
    if(unreadStoryNotes().some(n=>n.id===config.id)){
      saved.readStoryNoteIds=[...new Set([...(saved.readStoryNoteIds||[]),config.id])];
      persist();
    }
    const root=appShell('Notes','notes');
    root.append(elem('div','note-timestamp',config.date||''));
    const body=elem('div','note-readonly',config.body||'');
    body.setAttribute('role','document');
    body.setAttribute('aria-label','Read-only journal entry');
    root.append(body);
    host.append(root);
  }


  function photos(){
    const root=appShell('Albums','home');
    const content=elem('div','scroll photos-album-browser');
    const albums=elem('div','photos-album-list');
    const addAlbum=(title,count,source,target)=>{
      const tile=click('','photos-album-item',()=>setPage(target));
      const cover=elem('div','photos-album-cover');
      cover.append(img(source,title+' album cover'));
      tile.append(cover,elem('strong','photos-album-name',title),elem('span','photos-album-size',count+' '+(count===1?'Photo':'Photos')));
      albums.append(tile);
    };
    addAlbum('Recent',cfg.photos.length,cfg.photos[0].src,'recent-album');
    if(saved.storyValentineUnlocked){
      addAlbum(cfg.secretAlbum.title,cfg.secretAlbum.photos.length,cfg.secretAlbum.photos[0].src,'secret-album');
    }
    content.append(albums);root.append(content);host.append(root);
  }
  function recentAlbum(){
    const root=appShell('Recent','photos');
    const content=elem('div','scroll secret-album-scroll');
    content.append(elem('div','secret-album-count',cfg.photos.length+' '+(cfg.photos.length===1?'Photo':'Photos')));
    const grid=elem('div','secret-album-grid');
    for(const p of cfg.photos){
      const tile=click('','secret-album-tile',()=>setPage('photo-detail',p.id));
      tile.append(img(p.src,p.title));grid.append(tile);
    }
    content.append(grid);root.append(content);host.append(root);
  }
  function photoDetail(){
    const p=cfg.photos.find(p=>p.id===selected)||cfg.photos[0];
    const root=appShell('Recent','recent-album');
    const contents=elem('div','scroll photo-detail');
    contents.append(img(p.src,p.title));
    if(p.caption)contents.append(elem('p','',p.caption));
    root.append(contents);host.append(root);
  }
  function secretAlbum(){
    if(!saved.storyValentineUnlocked){setPage('photos');return;}
    const root=appShell(cfg.secretAlbum.title,'photos');
    root.classList.add('secret-album-page');
    const content=elem('div','scroll secret-album-scroll');
    content.append(elem('div','secret-album-count',cfg.secretAlbum.photos.length+' Photos'));
    const grid=elem('div','secret-album-grid');
    cfg.secretAlbum.photos.forEach((photo,i)=>{
      const tile=click('','secret-album-tile',()=>setPage('secret-photo',photo.id));
      tile.setAttribute('aria-label','View photo '+(i+1)+' — '+photo.date);
      const picture=img(photo.src,'Memory '+(i+1));
      picture.loading='lazy';
      tile.append(picture);grid.append(tile);
    });
    content.append(grid);root.append(content);host.append(root);
  }
  function secretPhoto(){
    if(!saved.storyValentineUnlocked){setPage('photos');return;}
    const pictures=cfg.secretAlbum.photos;
    let index=pictures.findIndex(photo=>photo.id===selected);
    if(index<0)index=0;
    const photo=pictures[index];
    const root=appShell(cfg.secretAlbum.title,'secret-album');
    root.classList.add('secret-photo-page');
    const viewer=elem('div','secret-photo-viewer');
    viewer.append(elem('div','secret-photo-date',photo.date));
    const frame=elem('div','secret-photo-frame');
    const picture=img(photo.src,'Memory '+(index+1)+' of '+pictures.length);
    picture.draggable=false;
    frame.append(picture);viewer.append(frame);
    const footer=elem('div','secret-photo-footer');
    const previous=click('‹','secret-photo-arrow',()=>setPage('secret-photo',pictures[(index+pictures.length-1)%pictures.length].id));
    previous.setAttribute('aria-label','Previous photo');
    const next=click('›','secret-photo-arrow',()=>setPage('secret-photo',pictures[(index+1)%pictures.length].id));
    next.setAttribute('aria-label','Next photo');
    footer.append(previous,elem('span','secret-photo-counter',(index+1)+' / '+pictures.length),next);
    viewer.append(footer);
    let startX=null;
    frame.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null;},{passive:true});
    frame.addEventListener('touchend',e=>{
      if(startX===null)return;
      const delta=(e.changedTouches[0]?.clientX??startX)-startX;
      startX=null;
      if(Math.abs(delta)>45)setPage('secret-photo',pictures[(index+(delta<0?1:pictures.length-1))%pictures.length].id);
    },{passive:true});
    root.append(viewer);host.append(root);
  }
  function storyInstagramPosts(){
    return saved.storyValentineUnlocked?[cfg.story.valentinePost,...cfg.instagram]:cfg.instagram;
  }
  function instaPhoto(index, cls=''){
    const p=elem('div','ig-photo '+cls);
    const avatarMode=cls.includes('avatar');
    const source=avatarMode ? cfg.instagramAvatar : storyInstagramPosts()[index]?.src;
    p.style.setProperty('--ig-col',index%3);
    p.style.setProperty('--ig-row',Math.floor(index/3));
    p.style.backgroundPosition=['0%','50%','100%'][index%3]+' '+(Math.floor(index/3)*100)+'%';
    if(source){
      const isEnding=!avatarMode && saved.storyValentineUnlocked && index===0;
      if(isEnding)p.classList.add('ig-valentine-photo');
      const photo=img(source,avatarMode?'lalinalena profile photo':'Instagram post photo');
      photo.className='ig-photo-image';
      photo.loading=avatarMode?'eager':'lazy';
      photo.onerror=()=>{
        photo.remove();
        if(isEnding)p.append(elem('div','ig-valentine-placeholder','🤍🤎'));
      };
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
    [[saved.storyValentineUnlocked?'2,009':'2,008','posts'],['1.8 M','followers'],['1,293','following']].forEach(([num,label])=>{
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
    storyInstagramPosts().forEach((p,i)=>{
      const tile=click('','ig-tile',()=>setPage('instagram-post',i));
      tile.append(instaPhoto(i));
      tile.setAttribute('aria-label','View '+p.date+' post');
      grid.append(tile);
    });
    content.append(grid);
    root.append(content);host.append(root);
  }
  function instagramPost(){
    const posts=storyInstagramPosts();
    const p=posts[Number(selected)]||posts[0];
    const index=Math.max(0,posts.indexOf(p));
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
    if(saved.storyValentineUnlocked && p===cfg.story.valentinePost){
      const ending=elem('div','story-ending');
      ending.append(elem('div','story-ending-heart','🤍🤎'),elem('strong','story-ending-title','THE END'),elem('span','story-ending-subtitle','Brings U Back'));
      content.append(ending);
    }
    root.append(content);host.append(root);
  }
  function calendar(){const root=appShell('Calendar','home');const content=elem('div','app-list');for(const x of cfg.calendar){const b=elem('div','list-item');b.append(elem('div','',x.date),elem('strong','',x.title));content.append(b)}root.append(content);host.append(root)}
  function camera(){const root=appShell('Camera','home');const content=elem('div','scroll');const preview=img(cfg.phone.homePhoto,'Camera preview');preview.style.cssText='width:100%;height:70%;object-fit:cover';content.append(preview);
    const capture=click('● Capture','pill',()=>{alert('Camera is simulated. Add a photo to story-data.js to show it in Photos.');});capture.style.cssText='display:block;margin:25px auto';content.append(capture);root.append(content);host.append(root)}
  function phoneApp(){const root=appShell('Phone','home');const content=elem('div','app-list');for(const p of cfg.phoneLog){const item=click('','list-item',()=>alert('This is a fictional call log.'));const t=elem('div');t.append(elem('strong','',p.name),elem('small','',p.subtitle));item.append(t,elem('div','','ⓘ'));content.append(item)}root.append(content);host.append(root)}
  function safari(){const root=appShell('Safari','home');const content=elem('div','scroll');for(const p of cfg.safari){content.append(elem('div','safari-address',p.url));const card=elem('div','app-list');card.append(elem('h2','',p.title),elem('p','',p.body));content.append(card)}root.append(content);host.append(root)}
  function music(){const root=appShell('Music','home');const list=elem('div','app-list');for(const track of cfg.music){const b=click('','list-item',()=>{saved.favoriteTrack=track.title;persist();render()});const l=elem('div');l.append(elem('strong','',track.title),elem('small','',track.artist));b.append(l,elem('div','',saved.favoriteTrack===track.title?'♥':'♡'));list.append(b)}list.append(elem('p','empty-app','No audio is included yet. Tracks can be added when you supply files.'));root.append(list);host.append(root)}
  function render(){host.replaceChildren();switch(page){case'lock':return lockScreen();case'home':return home();case'line-list':return lineList();case'line':return line();case'sms':return sms();case'sms-contact':return smsContact();case'kiddo-profile':return kiddoProfile();case'notes':return notes();case'note-editor':return noteEditor();case'photos':return photos();case'recent-album':return recentAlbum();case'photo-detail':return photoDetail();case'secret-album':return secretAlbum();case'secret-photo':return secretPhoto();case'instagram':return instagram();case'instagram-post':return instagramPost();case'calendar':return calendar();case'camera':return camera();case'phone':return phoneApp();default:return home()}}
  // Restore the last screen and resume any unfinished story timer/animation.
  // The story state, not transient DOM typing, is the source of truth.
  if(resumePage==='lock')render();
  else setPage(resumePage,resumeSelection);
})();
