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
    lastChatDate: '2026/11/25',
    background: '#91aed9',
    messages: [
      { type: 'date', text: 'Wed, 11/25 · 2026' },
      { type: 'notice', text: 'LINE 聊天记录占位。之后把你给我的聊天文本放在这里。' }
    ]
  },
  sms: {
    name: 'Unknown Number',
    number: 'Unknown Number',
    service: 'Text Message · SMS',
    messages: [
      { type: 'date', text: 'PAST · MESSAGE ARCHIVE' },
      { type: 'notice', text: '过去的 Miu 发来的短信将显示在这里。' }
    ]
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
  instagram: [
    { handle:'@kiddo', image:'assets/home-photo.jpg', caption:'Instagram post placeholder' }
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
