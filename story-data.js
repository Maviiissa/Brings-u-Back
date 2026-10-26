/**
 * CONTENT EDITOR — future story text can be replaced here.
 * This file contains the content only. Interface mechanics are in app.js.
 *
 * {from:'them', text:'...'} = a received message
 * {from:'me',   text:'...'} = a message sent by the phone owner
 * {type:'date', text:'...'} = a centered date label
 *
 * The typed demo messages are saved in this browser's localStorage. They are
 * NOT sent to any server or real person.
 */
window.PHONE_STORY = {
  lockScreen: {
    date: 'Thu 25 Nov 2027',
    year: '2027',
    wallpaper: 'assets/lockscreen-wallpaper.jpg',
    time: '9:00'
  },
  lock: { dateLabel: 'Thu 25 Nov', fullDate: 'November 25, 2027', time: '9:00' },
  phone: {
    time: '9:00',
    battery: '31',
    date: { weekday: 'THURSDAY', day: '25', detail: 'No Events Today' },
    unreadPhone: '1',
    unreadMessages: '2,290',
    homePhoto: 'assets/home-photo.jpg'
  },
  line: {
    name: 'Kiddo🧸',  // LINE contact's saved name / remark
    avatar: 'assets/kiddo-avatar.jpg', // Avatar from your second uploaded photograph
    lastChatDate: '2027/11/25',
    background: '#91aed9',
    messages: [
      {"type":"date","text":"July 2, 2026"},
      {"from":"them","time":"10:21 am","text":"Mom bought some super delicious cookies today! 🍪","read":true},
      {"from":"them","time":"10:33 am","text":"Do you want to come over and have some with me tonightttt?","read":true},
      {"from":"me","time":"12:21 pm","text":"😺Of course! I’ll come over tonight.","read":true},
      {"from":"me","time":"12:22 pm","text":"Gonna bring my fav pajamas 55555 😉✨","read":true},
      {"from":"them","time":"1:12 pm","text":"Yay! Let’s come home together from the set! ❤️","read":true},
      {"type":"date","text":"August 26, 2026"},
      {"from":"them","time":"9:00 pm","text":"Lalee, I rlly need to be recharged~~~","read":true},
      {"from":"me","time":"10:21 pm","text":"Come here and huggggg 🫂","read":true},
      {"from":"me","time":"10:59 pm","text":"Is everything alright???","read":true},
      {"from":"them","time":"11:17 pm","text":"Yean…","read":true},
      {"from":"them","time":null,"text":"I just miss u.","read":true},
      {"from":"me","time":"11:38 pm","text":"How about brunch tmr?? Would that make you feel better?","read":true},
      {"from":"them","time":null,"text":"Sure is!","read":true},
      {"from":"me","time":"11:49 pm","text":"Deal! I will pick you up tmr morning heheh. 🤭","read":true},
      {"from":"them","time":null,"text":"Lalee I know you’re the best! 👄Have a good dream na, dream of me~","read":true},
      {"type":"date","text":"August 27, 2026"},
      {"from":"me","time":"00:05 am","text":"Good Night 😴✨ Sweet dreams💗","read":true},
      {"type":"date","text":"October 16, 2026"},
      {"from":"them","time":"5:19 pm","text":"P’Na, let me know when you get home! Stay safe on your way back. 🌙❤️","read":true},
      {"from":"me","time":"7:38 pm","text":"Just got inside! Safe and sound. Thank you, my sweetness, get some good rest tonight~ 💖","read":true},
      {"type":"date","text":"October 23, 2026"},
      {"from":"them","time":"1:39 am","text":"Lalee, I couldn’t sleep…","read":true},
      {"from":"me","time":"1:43 am","text":"Just finished shower haha","read":true},
      {"from":"me","time":null,"text":"I couldn’t sleep as well… had too much bubble tea 🥹","read":true},
      {"from":"them","time":"1:46 am","text":"55555 you had three!","read":true},
      {"from":"me","time":null,"text":"5555555","read":true},
      {"from":"them","time":"2:14 am","text":"Lalee, can I come over to your room? I am scared….","read":true},
      {"from":"me","time":"2:17 am","text":"5555 wanna hug? come on~ come over 🤓","read":true},
      {"type":"date","text":"November 25, 2026"},
      {"from":"them","time":"00:00 am","text":"Happy Birthday, P’Na! 🎂✨","read":true},
      {"from":"them","time":null,"text":"I wish with all my heart that we can stay together like this forever... I hope nothing in this world will ever tear us apart. 💕","read":true},
      {"from":"me","time":null,"text":"Happy Birthday kiddo 🎂🤍That’s actually my birthday wish, too. 🥰","read":true},
      {"from":"them","time":"00:02 am","text":"Hey! You’re not supposed to say your birthday wish out loud! It won't come true now! 😱","read":true},
      {"from":"me","time":null,"text":"55555","read":true},
      {"from":"me","time":null,"text":"Don't worry. It will.","read":true},
      {"from":"me","time":"01:02 am","text":"I’ll always be right here, Kiddo. I will always stay right by your side.","read":true},
      {"type":"date","text":"January 1, 2027"},
      {"from":"them","time":"8:30 am","text":"Happy New Year, P'Na! 🎉✨","read":true},
      {"from":"them","time":null,"text":"I hope your career keeps booming this year, just like last year! I hope more and more people fall in love with LenaMiu. I hope P'Na stays happy every single day.","read":true},
      {"from":"them","time":null,"text":"I hope I can always stay by your side. ❤️","read":true},
      {"from":"me","time":"11:23 am","text":"Happy New Year, Miu! 🥳","read":true},
      {"from":"me","time":null,"text":"Last year was truly amazing with you. I really hope we get to stay by each other’s side this whole year, too. 💖","read":true},
      {"type":"date","text":"July 14, 2027"},
      {"from":"them","time":"2:09 am","text":"Is this true?","read":true},
      {"from":"me","time":"3:17 am","text":"Miu….","read":true},
      {"from":"them","time":null,"text":"Fine, I got it.","read":true},
      {"from":"me","time":"3:33 am","text":"Miu, it’s not what looks like…","read":true},
      {"type":"date","text":"September 30, 2027"},
      {"from":"me","time":"2:09 am","text":"Miu, can we talk?","read":true},
      {"from":"me","time":"3:17 am","text":"Give me a chance to explain…","read":true},
      {"type":"date","text":"November 25, 2027"},
      {"from":"me","time":"00:00 am","text":"Happy Birthday, Miu.","read":true},
      {"from":"them","time":null,"text":"Happy birthday, P'Lena.","read":true},
      {"from":"me","time":null,"text":"How have you been?","read":true}
    ]
  },
  // Story beat 1: unlocked-phone browsing, then an unsolicited text after ~60 seconds.
  // Later beats can be added to this timeline without changing the phone UI.
  story: {
    firstMessageDelayMs: 30000,
    notesTriggerDelayMs: 10000,
    playerReply: 'Wrong number, but pancakes sound like the correct decision.',
    strangerReply: 'Sorry!',
    replyTypingIntervalMs: 48,
    strangerTypingDelayMs: 2300,
    plot2Note: {
      id: 'plot2-2027-11-28',
      title: "I've been trying my best to keep my life together.",
      date: 'November 28, 2027 at 7:54am.',
      body: "I've been trying my best to keep my life together. I'm trying not to stay up late anymore, and I'm forcing myself to wake up early.\n\nI received a weird message...I received a weird message today. Pancakes were always Miu’s absolute favourite.\n\nI miss her so much."
    },
    plot2Date: {weekday:'SUNDAY',day:'28',month:'November',time:'7:54'},
    secondMessage: {
      from:'them',
      sender:'Unknown Number',
      time:'Now',
      text:'Pancake update: They were TERRIBLE!!!🥲🥲🥲'
    },
    secondPlayerReply: "I've been worried all week",
    secondStrangerReply: '555555 anyways Thank you for replying! 😽',
    plot3Note: {
      id: 'plot3-2027-12-05',
      title: 'I received another message from the number again...',
      date: 'December 5, 2027 at 10:36 am',
      body: "I received another message from the number again... It sounds entirely, hauntingly like her. Like the Miu I once knew before the silence grew between us.\n\nWe are all just collectors of phantom echoes, aren't we? Searching for the person of who we used to love in the margins of everyday text messages, foolishly hoping that time might rewind itself if we just hold our breath long enough."
    },
    plot3Date: {weekday:'SUNDAY',day:'5',month:'December',time:'10:36'},
    plot3HomeDelayMs: 10000,
    plot3Message: {from:'them',sender:'Unknown Number',time:'10:36 AM',text:'Happy Sunday! ☀️'},
    plot3Messages: [
      {stage:0,from:'them',text:'Happy Sunday! ☀️'},
      {stage:0,from:'them',text:"Bangkok is literally burning hot today, I feel like I'm melting into the pavement... 🫠"},
      {stage:1,from:'me',text:"Haha, stay indoors and stay hydrated!"},
      {stage:2,from:'them',text:'hydrated def matters！'},
      {stage:3,from:'them',text:"I still don't know ur name, stranger！👀"},
      {stage:4,from:'me',text:'Lena'},
      {stage:5,from:'them',text:'🥳 beautiful name'},
      {stage:6,from:'them',text:'I am Natsha'},
      {stage:7,from:'me',text:'Glad to meet you, Natsha ☺️'}
    ],
    plot3Drafts: ['？？Do you have any nicknames?', 'Miu？', 'Glad to meet you, Natsha ☺️'],
    plot3ReactionPauseMs: 3000,
    plot4Note: {
      id: 'plot4-2027-12-12',
      title: 'Natsha.',
      date: 'December 12, 2027 at 2:23 PM',
      body: "Natsha.\n\nI can feel my heart skipped a beat looking at the name appear on my screen. It is the very name I ache to hear.\n\nIt’s been a while of heavy silence from Miu, I don't know what I did wrong and she won't give me a chance to explain. Yet somehow, this stranger arrived out of nowhere, carrying the exact same name....\n\nI don't know why the universe sent her to my inbox today, but I am so endlessly grateful for this."
    },
    plot4Date: {weekday:'SUNDAY',day:'12',month:'December',time:'14:23'},
    plot4HomeDelayMs: 5000,
    plot7Note: {
      id: 'plot7-2028-01-01',
      title: 'It has always been us, intertwined across time.',
      date: 'January 1, 2028 at 10:15 PM',
      body: 'It has always been us, intertwined across time.\n\nIt’s a new year now. I wanted to say Happy New Year to her.\n\nBut her message went quiet over a month ago, and I never received from Miu since our last birthday…\n\nI saw Miu at the Gala last week. She looked breathtaking in that sleek black gown, yet her eyes were cold, filled with a distance that chilled me to the bone.\n\nShe passed me like I was a total stranger, not a single word exchanged.\n\nThe media is still spewing fake rumours about me and that male co-star. I know Miu saw them.\n\nI remember how, back in 2026, when we blew up, the agency decided separating us would be "better for her future." They forced me into a publicity stunt with someone else, and Miu fought it with everything she had. She looked me in the eye and asked, “Then what am I to you?”\n\nI was too terrified of losing her. Too scared of crossing the line and ruining the career she worked so hard for. So I stayed silent.\n\nAnd my silence broke her heart.'
    },
    plot7Date: {weekday:'SATURDAY',day:'1',month:'January',time:'22:15'},
    plot7HomeDelayMs: 10000,
    plot7Notification: {
      from:'them',sender:'Natsha',time:'10:15 PM',
      text:"P'Lena... can I ask you something?"
    },
    plot7Messages: [
      {stage:0,from:'them',text:"P'Lena... can I ask you something?"},
      {stage:1,from:'me',text:"Sure. You can tell me anything, I’m listening."},
      {stage:2,from:'them',text:'What would you do if you fell in love with your close friend?'},
      {stage:2,from:'them',text:"I'm so scared of ruining everything, but every time she looks at me, my heart goes crazy... 😔"},
      {stage:3,from:'me',text:"Hey, take a deep breath. Kiddo. It’s okay to feel scared, love can be overwhelming like that."},
      {stage:3,from:'me',text:'I have someone that I really love. But I was a coward.'},
      {stage:3,from:'me',text:'We shared everything, cared for each other, but when things got complicated, I let my fear push her away.'},
      {stage:3,from:'me',text:"And now... I feel like I've lost her."},
      {stage:4,from:'them',text:"Oh... P'Lena. Don't be sad. 🫂"},
      {stage:4,from:'them',text:"I just don’t know what to do…I don’t wanna lose her. She is the most important person in my life."},
      {stage:5,from:'me',text:"If she loves you as well, or even if she doesn't yet, you should be brave. Loving someone isn't something to be ashamed of. You have to tell her, okay? Promise me."}
    ],
    // Final arc: the two timelines meet, then the player reaches Miu on LINE.
    plot8Note: {
      id:'plot8-2028-01-08',
      title:'Loving someone isn’t something to be ashamed of.',
      date:'January 8, 2028 at 6:30 PM',
      body:'“Loving someone isn\'t something to be ashamed of. You have to tell her, okay? Promise me.”\n\nI typed those words to her, but they felt like a mirror reflecting my own cowardice back at me.\n\nFor the past week, her advice from 2019 has been echoing in my head. Eighteen-year-old Natsha, terrified yet full of love, was teaching me how to fight for what matters.\n\nI haven\'t fixed the wreckage between Miu and me yet, but the suffocating fear in my chest is finally starting to give way to something else…\n\nI should tell her, I should tell Miu how much I loved her, and how much I still am in love with her.'
    },
    plot8Date:{weekday:'SATURDAY',day:'8',month:'January',time:'18:30'},
    plot8HomeDelayMs:10000,
    plot8Notification:{from:'them',sender:'Natsha',time:'6:30 PM',text:"P'Lena, I think I made a big decision... I want to try entering the entertainment industry!"},
    plot8Messages:[
      {stage:0,from:'them',text:"P'Lena, I think I made a big decision... I want to try entering the entertainment industry!"},
      {stage:0,from:'them',text:"That pretty senior of mine is an actress, and I want to be someone who can stand beside her in the spotlight ✨"},
      {stage:1,from:'me',text:"The entertainment industry is not as glamorous as it looks, kiddo. It's complicated, full of noise, and people can get hurt easily. Are you sure you're ready for that?"},
      {stage:2,from:'them',text:"Wait... why did you just type a whole paragraph warning me about that? 😆"},
      {stage:2,from:'them',text:"You sound exactly like my P’Na! She literally told me the same thing yesterday! Are you two secretly the same person or what? 🫣"},
      {stage:2,from:'them',text:"Just kidding 5555. I have made my decision and I will not be afraid of anything! I just want to stay with her no matter what 🥰"},
      {stage:2,from:'them',text:"I guess I have to convince my parents first….😟"}
    ],
    plot9Note:{
      id:'plot9-2028-01-15',
      title:'She laughed and asked if we were secretly the same person.',
      date:'January 15, 2028 at 9:15 PM',
      body:'She laughed and asked if we were secretly the same person.\n\nI stared at my phone screen in the dark…Miu has always been the brave one. Fighting for her dreams, braving her parents\' expectations, and holding out her hand to me without hesitation.\n\nI was the only one constantly running, constantly controlled by fear.\n\nNow the miracle of meeting the 18-year-old Miu is giving me back the courage I threw away.\n\nI refuse to be a coward any longer.'
    },
    plot9Date:{weekday:'SATURDAY',day:'15',month:'January',time:'21:15'},
    plot9HomeDelayMs:10000,
    plot9Notification:{from:'them',sender:'Natsha',time:'9:15 PM',text:"Guess what? My parents were totally against it at first, but I didn't give up!"},
    plot9Messages:[
      {stage:0,from:'them',text:"Guess what? My parents were totally against it at first, but I didn't give up! I told them I really want to try, and they finally gave me their blessing! 🥹🎉"},
      {stage:0,from:'them',text:"BTW I don't think it's the right time to confess to P'Na yet, but that's okay!"},
      {stage:0,from:'them',text:"I'll just keep staying by her side and working hard. I really hope one day, she'll look at me and love me back... 💌"},
      {stage:1,from:'me',text:"She already does, kiddo."},
      {stage:1,from:'me',text:"Trust me. Her love for you has always been there, and it will last a very, very long time."},
      {stage:2,from:'them',text:"Really? I hope so! 🥺✨"},
      {stage:2,from:'them',text:"Thank you for always listening to me and giving me courage, P'Lena. You're the best safe place ever!"}
    ],
    plot10Note:{
      id:'plot10-2028-01-22',
      title:'I never received another message from Natsha.',
      date:'January 22, 2028 at 10:00 AM',
      body:'I never received another message from Natsha.\n\nIs she doing okay? Is she still hurting because of my hesitation? This miraculous bridge across eight years of time is closing forever, and all I can pray for is that she stays safe, shines bright, and reaches every dream she ever chased.\n\nShe taught me that loving someone is never something to fear.\n\nNow, it’s time to bring you back.\n\nMiu, please... just give me one more chance to love you.'
    },
    plot10Date:{weekday:'SATURDAY',day:'22',month:'January',time:'10:00'},
    plot10LineReplies:[
      "Miu, I am so, so sorry.",
      "I know I broke your heart, and I know I was a complete coward back then when the noise got too loud.",
      "I was terrified of losing you, terrified of crossing the friend zone and ruining the career you worked so hard for.",
      "I love you, Miu. I have been in love with you for so long, and I'm done letting fear dictate my heart.",
      "I can’t bear a single day without you…Miu",
      "Please, can we talk?"
    ],
    plot10LineAnswer:"Lalee, Open the door…I’ve been sitting in my car for an hour.",
    valentinePost:{
      src:'assets/IMG_3251.jpg',
      caption:'Happy Valentine’s Day 🤍🤎 My entire world @Miu_natsha',
      date:'14 February 2028',
      likes:'1.8M'
    },
    plot6Note: {
      id: 'plot6-2027-12-26',
      title: "I couldn't help but smile reading her messages",
      date: 'December 26, 2027 at 4:20 PM',
      body: "I couldn't help but smile reading her messages about that \"senior\" in the marching band.\n\nMiu used to tell me how shy and tongue-tied she was when we first met. Listening to 18-year-old Miu ramble on about her campus life feels like unearthing lost fragments of a past I was never there to witness.\n\nI wish I had been there. I wish I had understood my own heart back then."
    },
    plot6Date: {weekday:'SUNDAY',day:'26',month:'December',time:'16:20'},
    plot6HomeDelayMs: 5000,
    plot6Notification: {
      from:'them',sender:'Natsha',time:'4:20 PM',
      text:"P'Lenaaaa I am dying of midterms! 😭 Everyday is just non-stop studying..."
    },
    plot6Messages: [
      {stage:0,from:'them',text:"P'Lenaaaa I am dying of midterms! 😭 Everyday is just non-stop studying..."},
      {stage:0,from:'them',text:'But I survived long enough to tell you a miracle - I got her Instagram! The drum major!'},
      {stage:0,from:'them',text:"And you won't believe this... we literally share the same birthday!"},
      {stage:0,from:'them',text:'And guess what her name is? Her name is also Lena! OMGGGG is this destiny or what?? 🥺✨'},
      {stage:1,from:'me',text:'Sounds like destiny to me.'},
      {stage:1,from:'me',text:"Don't stress too much about midterms, study hard and take care of yourself."}
    ],
    plot5Note: {
      id: 'plot5-2027-12-19',
      title: 'Kiddo. I couldn’t help myself calling her that…',
      date: 'December 19, 2027 at 3:15 PM',
      body: "Kiddo. I couldn’t help myself calling her that…\n\nThe moment I typed that word, my hands were shaking.\n\nIt isn't just a resemblance. The girl on the other end of this line is Miu. It's her, eight years ago, back in 2019.\n\nI don't know how this miraculous bridge was built. She has no idea who I am in her future, but here I am, holding her past in the palm of my hand."
    },
    plot5Date: {weekday:'SUNDAY',day:'19',month:'December',time:'15:15'},
    plot5HomeDelayMs: 5000,
    plot5Notification: {
      from:'them',sender:'Natsha',time:'3:15 PM',text:'Having my dinner hehehe'
    },
    plot5Messages: [
      {stage:0,from:'them',type:'photo',text:'Image',src:'assets/IMG_3248.webp'},
      {stage:0,from:'them',text:'Having my dinner hehehe'},
      {stage:1,from:'me',text:'100% Brown food? That must be your favourite'},
      {stage:2,from:'them',text:'How do you know?!!!😆'},
      {stage:2,from:'them',text:'Oh, and good news! I officially passed my exams and got into Chulalongkorn University! 🎉'},
      {stage:2,from:'them',text:"I'm thinking of joining the campus club! The Drum Major... OMG she is so prettyyyyyy 🫣"},
      {stage:3,from:'me',text:'Congratulations on Chula, kiddo! I am so happy for you ☺️'},
      {stage:3,from:'me',text:'Make sure you get some rest after celebrating 🤍'}
    ],
    plot4Notification: {
      from:'them',sender:'Natsha',time:'2:23 PM',
      text:'Guess what? I forced myself to get out of bed early today, but I failed the pancake test again... 🥞🤦‍♀️'
    },
    plot4Messages: [
      {stage:0,from:'them',text:'Guess what? I forced myself to get out of bed early today, but I failed the pancake test again... 🥞🤦‍♀️'},
      {stage:0,from:'them',text:"Tutoring classes are annoying... I'm so exhausted today 😭"},
      {stage:1,from:'me',text:'Tutoring class? You must be pretty young.'},
      {stage:2,from:'them',text:"Just turned 18! I'm applying to Chulalongkorn University, so I'm grinding IELTS every single day... 🥲🥲"},
      {stage:3,from:'me',text:'Chulalongkorn?'},
      {stage:3,from:'me',text:'Take a deep breath, kiddo. 18 is a tough age, but you’re doing great.'},
      {stage:4,from:'them',text:'Did you just call me kiddo? No one has ever called me that before... 😳'}
    ],
    firstMessage: {
      from: 'them',
      sender: 'Unknown Number',
      time: '9:28 AM',
      text: 'Are we still getting pancakes at 10?'
    }
  },
  sms: {
    name: 'Unknown Number',
    number: 'Unknown Number',
    service: 'Text Message · SMS',
    messages: []
  },
  // Notes in reverse chronological order. The timestamps are fictional story content.
  notes: [
    { id: 'note-2027-10-25', title: 'I lost her...', date: 'October 25, 2027 at 1:30 am', body: 'I lost her...' },
    { id: 'note-2027-09-30', title: 'I know I should tell her how much I love her.', date: 'September 30, 2027 at 3:27 am', body: 'I know I should tell her how much I love her. I am sorry.' },
    { id: 'note-2027-01-15', title: "It's our third year...", date: 'January 15, 2027 at 10:27 pm', body: "It's our third year...Happy anniversary my kiddo. I will always love you.🦋🧸" },
    { id: 'note-2026-11-25', title: 'Happy beloved birthdays to us 🤍 🩶', date: 'November 25, 2026 at 00:36 am', body: 'Happy beloved birthdays to us 🤍 🩶 I will always be your partner in crime, my kiddo.' },
    { id: 'note-2026-10-23', title: 'Kiddo, "I really do love you“ as well.', date: 'October 23, 2026 at 00:36 am', body: 'Kiddo, "I really do love you“ as well.' }
  ],
  photos: [
    { id:'memory-1', src:'assets/home-photo.jpg', title:'Photos', caption:'这是一张临时照片；你之后可以换成自己的素材。' }
  ],
  instagramAvatar: 'assets/IMG_3246.jpg',
  instagram: [
    {src:'assets/IMG_3241.jpg',caption:'Wandering with you🤍',date:'7 October 2026',likes:'428K'},
    {src:'assets/IMG_3242.jpg',caption:'Art, lunch, you. ❤️',date:'5 October 2026',likes:'386K'},
    {src:'assets/IMG_3243.jpg',caption:'Just a girl missing Paris 🖤 @chanelofficial',date:'29 September 2026',likes:'537K'},
    {src:'assets/IMG_3244.jpg',caption:'⋆｡°✩ 🥐 ⋆｡°✩ 🥖',date:'16 September 2026',likes:'427K'},
    {src:'assets/IMG_3245.jpg',caption:'Bits from diary ⋆. 🧁🥰',date:'1 July 2026',likes:'229K'}
  ],
  calendar: [
    { date:'2026-11-25', title:'Last LINE conversation' }
  ],
  phoneLog: [
    {name:'Unknown Number', subtitle:'Recent · missed call'}
  ],
  safari: [
    { title:'A saved page', url:'about:story', body:'This is a fictional browser page. You can replace it with clues or an in-universe article.' }
  ],
  music: [
    {title:'Track 01', artist:'Add an audio file later'}
  ]
};
