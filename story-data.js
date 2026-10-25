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
    time: '22:16'
  },
  lock: { dateLabel: 'Thu 25 Nov', fullDate: 'November 25, 2027', time: '22:16' },
  phone: {
    time: '22:16',
    battery: '31',
    date: { weekday: 'THURSDAY', day: '25', detail: 'No Events Today' },
    unreadPhone: '1',
    unreadMessages: '2,290',
    homePhoto: 'assets/home-photo.jpg'
  },
  line: {
    name: 'Kiddo',  // LINE contact's saved name / remark
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
      id: 'plot2-2027-10-28',
      title: "I've been trying my best to keep my life together.",
      date: 'October 28, 2027 at 9:00am.',
      body: "I've been trying my best to keep my life together. I'm trying not to stay up late anymore, and I'm forcing myself to wake up early.\n\nI received a weird message...I received a weird message today. Pancakes were always Miu’s absolute favourite.\n\nI miss her so much."
    },
    plot2Date: {weekday:'THURSDAY',day:'28',month:'October',time:'9:00'},
    secondMessage: {
      from:'them',
      sender:'Unknown Number',
      time:'Now',
      text:'Pancake update: They were TERRIBLE!!!🥲🥲🥲'
    },
    secondPlayerReply: "I've been worried all week",
    secondStrangerReply: '555555 anyways Thank you for replying! 😽',
    plot3Note: {
      id: 'plot3-2027-10-31',
      title: 'I received another message from the number again...',
      date: 'October 31, 2027 at 10:36 am',
      body: "I received another message from the number again... It sounds entirely, hauntingly like her. Like the Miu I once knew before the silence grew between us.\n\nWe are all just collectors of phantom echoes, aren't we? Searching for the person of who we used to love in the margins of everyday text messages, foolishly hoping that time might rewind itself if we just hold our breath long enough."
    },
    plot3Date: {weekday:'SUNDAY',day:'31',month:'October',time:'10:36'},
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
      id: 'plot4-2027-11-07',
      title: 'Natsha.',
      date: 'November 7, 2027 at 2:23 PM',
      body: "Natsha.\n\nI can feel my heart skipped a beat looking at the name appear on my screen. It is the very name I ache to hear.\n\nIt’s been a while of heavy silence from Miu, I don't know what I did wrong and she won't give me a chance to explain. Yet somehow, this stranger arrived out of nowhere, carrying the exact same name....\n\nI don't know why the universe sent her to my inbox today, but I am so endlessly grateful for this."
    },
    plot4Date: {weekday:'SUNDAY',day:'7',month:'November',time:'14:23'},
    plot4HomeDelayMs: 5000,
    plot5Note: {
      id: 'plot5-2027-11-14',
      title: 'Kiddo. I couldn’t help myself calling her that…',
      date: 'November 14, 2027 at 3:15 PM',
      body: "Kiddo. I couldn’t help myself calling her that…\n\nThe moment I typed that word, my hands were shaking.\n\nIt isn't just a resemblance. The girl on the other end of this line is Miu. It's her, eight years ago, back in 2019.\n\nI don't know how this miraculous bridge was built. She has no idea who I am in her future, but here I am, holding her past in the palm of my hand."
    },
    plot5Date: {weekday:'SUNDAY',day:'14',month:'November',time:'15:15'},
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
      {stage:2,from:'them',text:"I'm thinking of joining the campus club! The Drum Major has this senior... OMG she is so prettyyyyyy 🫣"},
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
