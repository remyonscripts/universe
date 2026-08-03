/* category */
const LETTER_CATEGORY_META = [
  { key:"yearning", icon:"", name:"Yearning", count:14 },
  { key:"reassurance", icon:"", name:"Reassurance", count:12 },
  { key:"di_makatulog", icon:"", name:"Di Makatulog", count:8 },
  { key:"need_ko_lambing", icon:"", name:"Need Ko Lambing", count:10 },
  { key:"goofy_ahh", icon:"", name:"Goofy Ahh", count:10 },
  { key:"infinity", icon:"", name:"To Infinity and Beyond", count:10 }
];

function emptyLetterSlots(count){
  return Array.from({length:count}, ()=> ({ hint:"open when...", text:"" }));
}

/* letter content */
const LETTER_CONTENT = {
  yearning: [
   { hint: "Open when you miss me", text: "" },
    { hint: "Open when you miss my voice", text: "" },
    { hint: "Open when you wish I were beside you", text: "" },
    { hint: "Open when you're hugging your pillow and pretending it's me", text: "" },
    { hint: "Open when you wish we were together right now", text: "" },
    { hint: "Open when you want to feel close to me", text: "" },
    { hint: "Open when nag iimagine ka na magkasama tayo", text: "" },
    { hint: "Open when nag yeyearn ka lang talaga", text: "" },
    { hint: "Open when you're rereading our old messages", text: "" },
    { hint: "Open when you need a reminder na miss din kita", text: "" },
    { hint: "Open when you wish you could hold my hand", text: "" },
    { hint: "Open when your heart is looking for me", text: "" }
  ],

  reassurance: [
    { hint: "Open when you’re overthinking", text: "" },
    { hint: "Open when you think I’m mad at you", text: "" },
    { hint: "Open when you’re scared I’ll leave", text: "" },
    { hint: "Open when you wonder if I still love you", text: "" },
    { hint: "Open when you feel insecure", text: "" },
    { hint: "Open when you think you’re “too much”", text: "" },
    { hint: "Open when you compare yourself to other people", text: "" },
    { hint: "Open when distance feels unfair", text: "" },
    { hint: "Open when we have a misunderstanding", text: "" },
    { hint: "Open when you need reassurance", text: "" },
    { hint: "Open when you need to remember why I chose you", text: "" },
    { hint: "Open when you forget how lovable you are", text: "" }
  ],

  di_makatulog: [
    { hint: "Open when you can’t sleep", text: "" },
    { hint: "Open when it’s past midnight", text: "" },
    { hint: "Open when you’re sleepy but don’t want to hang up", text: "" },
    { hint: "Open when you’re staying up thinking about us", text: "" },
    { hint: "Open when you wake up from a bad dream", text: "" },
    { hint: "Open when you’re sleeping on call with me", text: "" },
    { hint: "Open when you wake up and I’m not there", text: "" },
    { hint: "Open when you want a goodnight kiss", text: "" }
  ],

  need_ko_lambing: [
    { hint: "Open when you want attention", text: "" },
    { hint: "Open when you’re being extra clingy", text: "" },
    { hint: "Open when you want kisses", text: "" },
    { hint: "Open when you want cuddles", text: "" },
    { hint: "Open when you want to hear “I love you”", text: "" },
    { hint: "Open when you want to feel spoiled", text: "" },
    { hint: "Open when you want soft words", text: "" },
    { hint: "Open when you want to know what I’m thinking about", text: "" },
    { hint: "Open when you want to know how much I love you", text: "" },
    { hint: "Open when you want proof that my heart is yours", text: "" }
  ],



  goofy_ahh: [
    { hint: "Open when Valorant made you lose RR", text: "" },
    { hint: "Open when your teammates are throwing", text: "" },
    { hint: "Open when you wish we were playing together right now", text: "" },
    { hint: "Open when we lose every game together", text: "" },
    { hint: "Open when you’ve been chronically online for too long", text: "" },
    { hint: "Open when TikTok has completely destroyed your sleep schedule", text: "" },
    { hint: "Open when you’re bored", text: "" },
    { hint: "Open when you want to laugh", text: "" },
    { hint: "Open when you need a stupid joke", text: "" },
    { hint: "Open when you’re acting like a little gremlin", text: "" }
  ],



  infinity: [
    { hint: "Open when you think about our future", text: "" },
    { hint: "Open when you imagine us meeting", text: "" },
    { hint: "Open when you’re scared about the future", text: "" },
    { hint: "Open when you need something to look forward to", text: "" },
    { hint: "Open when you wonder what our future home would feel like", text: "" },
    { hint: "Open when you want to know my biggest wish", text: "" },
    { hint: "Open when you want to know what forever means to me", text: "" },
    { hint: "Open when you want to remember that I’m staying", text: "" },
    { hint: "Open when you’re doubting whether long distance is worth it", text: "" },
    { hint: "Open when you want to know what I hope for us years from now", text: "" }
  ]
};

function buildRegularLetters(){
  const letters = [];
  LETTER_CATEGORY_META.forEach(cat=>{
    for(let i=1;i<=cat.count;i++){
      const entry = (LETTER_CONTENT[cat.key] && LETTER_CONTENT[cat.key][i-1]) || { hint:"open when...", text:"" };
      letters.push({
        id:`${cat.key}-${i}`,
        categoryKey:cat.key,
        categoryName:cat.name,
        icon:cat.icon,
        index:i,
        hint: entry.hint || "open when...",
        text: entry.text || null 
      });
    }
  });
  return letters;
}

const REGULAR_LETTERS = buildRegularLetters();

const SECRET_LETTERS = [
  {
    id:"secret-diary",
    unlockKey:"diary",
    title:"Open when you want to tell me whatever you want to tell me",
    isDiary: true,
    text:""
  },
  
  {
    id:"secret-1",
    unlockKey:"stars100",
    title:"Open when you discover all 100 stars",
    text:`wow, sipag mo naman mag pindot maem. nabasa mo talaga lahat yun?

Kasi if I were to be honest with you, I don't think those 100 things are actually the most important things I love about you. Don't get me wrong ah they're all true. Every single one of them. I love your smile, your laugh, the way you talk, your small habits, and everything else I mentioned in those stars. But the truth is kahit umabot pa ako ng 100, 1,000, or even isang milyong bagay, di pa rin nila kayang ipaliwanag kung gaano kita kamahal.

But yk love has always felt a little strange to me kasi if love were only about the things we like about a person, edi what happens when those things change? What happens when life gets difficult, when people grow, when they become different versions of themselves? diba?

I don't think love is meant to work that way and I think the most beautiful kind of love is when you stop loving someone because of a list of reasons and start loving them simply because they are who they are. Kasi when we started talking I loved all those small things about you but the more I got to know you, the less I cared about finding reasons to love you because I love you for who you are. Yung parts that are easy to love and the parts that are harder to understand. The parts you're proud of and the parts you're still learning to accept. The days when you're at your best and the days when you feel like you're falling apart.


And if kung may hidden secret man behind all 100 things I love about you, it's this:

None of those things are the reason I love you.
They're just reminders of someone I already love with all my heart.
The most important thing I love about you isn't something I could put on a list.

It's you.

I love you, Baby :3`
  },
  {
    id:"secret-2",
    unlockKey:"time1111",
    title:"Open when it's exactly 11:11",
    text:""
  },
  {
    id:"secret-3",
    unlockKey:"allLetters",
    title:"Open when you've read every other letter",
    text:""
  },
  {
    id:"secret-4",
    unlockKey:"everything",
    title:"Open when you want one last reason to stay a little longer on this website",
    text:""
  }
];

const REASON_TEMPLATES = [
"I love your chronically online energy",
"I love your Tagalog humor",
"I love your chaotic side",
"I love your funny side",
"I love your sense of humor",
"I love when you kiss me on call and somehow I can still feel it",
"I love when you make fun of me in a cute way",
"I love your cute overreactions",
"I love your attitude when you're being playful",
"I love when you flirt with me",
"I love your energy",
"I love how fun you are to be around",
"I love your style",
"I love how excited you get over small things",
"I love your random little updates",
"I love how you send me little pieces of your day",
"I love your late-night messages",
"I love your good morning messages",
"I love your good night messages",
"I love the way you ask if I've eaten",
"I love your attention when I'm talking",
"I love the attention you give me",
"I love the way you notice small details about me",
"I love the way you remember little things I tell you",
"I love how you care about the things I care about",
"I love your honesty",
"I love your effort",
"I love your kindness",
"I love how caring you are",
"I love how you care about my feelings",
"I love your gentleness",
"I love your cute voice",
"I love your sleepy voice",
"I love the way your voice gets softer when you're sleepy",
"I love your beautiful hair",
"I love your eyes",
"I love your lips",
"I love your face",
"I love how beautiful you are",
"I love your personality",
"I love how sweet you are",
"I love your soft side",
"I love your playful side when it's just us",
"I love the sound of your laugh",
"I love your laugh when a joke is so dumb it becomes funny",
"I love the way you smile when I make you laugh",
"I love when you're genuinely happy",
"I love how adorable you are",
"I love your adorableness",
"I love you for who you are",
"I love how you're perfect by being yourself",
"I love how smart you are",
"I love the way you treat me",
"I love how you're always proud of me",
"I love how you support my goals",
"I love how you cheer me up without even realizing it",
"I love the way you can calm me down without trying too hard",
"I love the way you listen when I'm struggling",
"I love how comfortable I can be around you",
"I love when you feel safe around me",
"I love how you make silence feel comfortable",
"I love how you make ordinary days feel special",
"I love how your presence makes my days brighter",
"I love how I never get bored when I'm with you",
"I love our time together",
"I love sleeping on call with you",
"I love your random 'I miss you'",
"I love when you say 'I love you' at random times",
"I love the way you call me 'baby'",
"I love the way you get clingy with me",
"I love the way you love me",
"I love the way you love me so naturally",
"I love how you make me feel wanted",
"I love how you make me feel understood",
"I love how you make me smile at my phone like an idiot",
"I love how you make me feel less alone",
"I love how you're always there for me",
"I love how you never judge me",
"I love how loyal you are",
"I love the way you're willing to stay even when I'm difficult",
"I love your patience with me",
"I love your reassurance",
"I love the fact that you chose me",
"I love the fact that you keep choosing me",
"I love the bond we have",
"I love how we both want the same future",
"I love how you make me believe in 'us'",
"I love the way you make distance feel smaller",
"I love how you make me feel loved even through a screen",
"I love how you make my heart feel safe",
"I love how you became my favorite notification",
"I love how you became my everything",
"I love how you're my person",
"I love how you stole my heart without trying",
"I love the way you turn ordinary conversations into my favorite memories",
"I love how loving you feels like home",
"I love how you make me want to become a better person",
"I love your soul",
"I love the way my heart keeps choosing you every single day",
"I love the fact that forever feels possible because it's you"
];

function buildStars(){
  const stars = [];
  for(let i=1;i<=100;i++){
    stars.push({
      id:`star-${i}`,
      text:`${REASON_TEMPLATES[(i-1)%REASON_TEMPLATES.length]}`,
      img:`star${(i%3)+1}.png`
    });
  }
  return stars;
}
const STARS = buildStars();

const HIDDEN_STAR = {
  id:"star-hidden",
  title:"if I could make one wish at 11:11…",
  text:"I would wish for a future where I never have to miss you through a screen again."
};

const FINAL_LETTER_LINES = [
  "My Universe",
  "if you've made it this far, you've probably read everything else on this site or baka niskip mo lang talaga 🤔",
  "Either way, masaya naman ako na nandito ka.  You've seen the stars, the letters (feel ko binasa mo lahat yun kahit na dapat inoopen mo lang yun kapag na fefeel mo yung ano basta ano), and yung flower hehe but somehow, even after all of that, I still feel like I've only managed to describe the surface level of what you truly mean to me.",
  "None of it says it perfectly, kasi nothing really could naman talaga. Tagal ko talaga tong pinagisipan like trying to find the right words, trying to explain what it means to love someone like you, pero every sentence feels smaller than what I feel kasi you're too beautiful, too meaningful, to fit neatly into a letter :p mwamwaaa",
  "Idk what universe we'll end up building together. Di ko alam what our future will look like, kung anong adventures nagaabang satin, or what stories we have yet to write. But I know I want you in every version of it. In every dream, every chapter, everyday, everywhere and whatever uncertainty life gives us. I hope I get to experience it with you.",
  "Thank you po for being one of the brightest parts of my life. (legit talaga toh pramis plot twist ng bohai ko) Thank you kasi pinapatawa mo ko, kinakaosap mo ko kahit baliw ako, lahat ng memories we have so far (more memories to come plsssss). Loving you has been one of the easiest and most beautiful things I've ever done, and being loved by you is something I will never take for granted, I swear to God ganyan kita ka love :((",
  "in every universe,\nit will always be you."
];
