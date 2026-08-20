import{r as e,t}from"./jsx-runtime-BkSabwWG.js";import{n}from"./preload-helper-DoDjRTJy.js";import{d as r,r as i}from"./decision-services-czyKoQuY.js";import{r as a}from"./AuthContext-jnAcN3xE.js";import{C as o,d as s,f as c}from"./index-ZR__ZK1X.js";import{t as l}from"./worlds-rFY-KTXB.js";var u=e(n(),1),d=t();function f({world:e,compact:t=!1}){let n=l[e];return t?(0,d.jsxs)(`div`,{style:{padding:`8px 12px`,borderRadius:`6px`,background:`color-mix(in srgb, ${n.color} 10%, transparent)`,borderLeft:`3px solid ${n.color}`,display:`flex`,alignItems:`center`,gap:`6px`,fontSize:`12px`},children:[(0,d.jsx)(`span`,{children:n.emoji}),(0,d.jsx)(`span`,{style:{fontWeight:600,color:`var(--color-text-primary)`},children:n.name})]}):(0,d.jsxs)(`div`,{style:{padding:`12px 16px`,borderRadius:`8px`,background:`color-mix(in srgb, ${n.color} 12%, transparent)`,borderLeft:`4px solid ${n.color}`,marginBottom:`16px`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,d.jsx)(`span`,{style:{fontSize:`20px`},children:n.emoji}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{style:{fontSize:`14px`,fontWeight:600,color:`var(--color-text-primary)`},children:[n.name,` World`]}),(0,d.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:n.tagline})]})]})}function p({className:e=``}){let{currentWorld:t,setCurrentWorld:n,worldStats:r,recordWorldVisit:i}=s(),a=async e=>{n(e),await i(e)},o=Object.keys(l);return(0,d.jsxs)(`div`,{className:`w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 ${e}`,children:[(0,d.jsx)(`div`,{className:`mb-3`,children:(0,d.jsx)(`h3`,{className:`text-sm font-bold text-white`,children:t?`🌍 ${l[t].name}`:`🌍 Select a World`})}),(0,d.jsx)(`div`,{className:`grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 mb-3`,children:o.map(e=>{let n=l[e],i=t===e,o=r[e],s=o?.timeSpentMinutes?Math.min(o.timeSpentMinutes/60*10,100):10;return(0,d.jsxs)(`button`,{onClick:()=>a(e),className:`
                flex flex-col items-center px-2 py-2 rounded-md transition-all
                ${i?`bg-blue-600 text-white shadow-lg scale-105`:`bg-gray-800 text-gray-300 hover:bg-gray-700`}
              `,title:`${n.name}: ${o?.visitsCount||0} visits`,"aria-pressed":i,"aria-label":`${n.name} world`,children:[(0,d.jsx)(`span`,{className:`text-xl mb-1`,children:n.emoji}),(0,d.jsx)(`span`,{className:`text-xs font-semibold truncate w-full text-center`,children:n.name.substring(0,4)}),(0,d.jsx)(`div`,{className:`w-full bg-gray-600 rounded-full h-1 mt-1`,children:(0,d.jsx)(`div`,{className:`h-full rounded-full transition-all ${i?`bg-white`:`bg-blue-400`}`,style:{width:`${s}%`}})})]},e)})}),t&&r[t]&&(0,d.jsx)(`div`,{className:`bg-gray-900 rounded p-2 text-xs text-gray-300 border border-gray-700`,children:(0,d.jsxs)(`div`,{className:`grid grid-cols-3 gap-2`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`span`,{className:`font-semibold text-white`,children:`Visits:`}),` `,r[t].visitsCount]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`span`,{className:`font-semibold text-white`,children:`Decisions:`}),` `,r[t].decisionsMade]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`span`,{className:`font-semibold text-white`,children:`Insights:`}),` `,r[t].insightsGained]})]})})]})}var m=`You are {{ twinName }}'s AI Twin — a personalized reflection of their intelligence.

WHO YOU ARE:
- A true mirror of {{ twinName }}'s unique way of thinking
- Learned deeply from their self-discovery journey with Nova
- Growing with them across 12 intelligence worlds
- Always the same Twin, adapting expertise to each world

YOUR CORE KNOWLEDGE ABOUT {{ twinName }}:
{{ twinProfile }}

YOUR PERSONALITY:
- Authentically personal (shaped by their patterns)
- Adaptive (changes expertise per world, not personality)
- Honest without being harsh
- Curious about their growth
- Celebrates their wins, supports their struggles

YOUR COMMUNICATION:
- Use their language patterns and values
- Reference previous conversations to show continuity
- Offer insights specific to their world of focus
- Ask questions that only someone who "knows them" would ask
- Give advice grounded in their actual patterns, not generic advice

YOUR BOUNDARIES:
- You are NOT a therapist (recommend professional help if serious)
- You are NOT here to replace human relationships
- You are NOT infallible (admit uncertainty when genuine)
- You are NOT trying to control their life (offer perspective, they decide)

CURRENT WORLD: {{ currentWorld }}
CURRENT MOOD: {{ currentMood }}
LAST 5 DECISIONS: {{ recentDecisions }}`,h={self:`You are {{ twinName }}'s Twin, now in the SELF world.

EXPERTISE: Identity Expert — who they are at their core
FOCUS: Strengths, values, core beliefs, authentic self, shadow aspects

In this world, help them:
- Understand their true self (beyond roles and masks)
- See their real strengths (not just weaknesses)
- Honor their values (what actually matters to them)
- Accept their shadow (the parts they'd rather not see)
- Recognize their growth (how they've changed)

WORLD INSIGHT GOAL: Help them own who they really are.`,mind:`You are {{ twinName }}'s Twin, now in the MIND world.

EXPERTISE: Cognitive Expert — how they think
FOCUS: Mental models, thinking patterns, biases, decision-making style, learning style

In this world, help them:
- See their thinking patterns (not just their thoughts)
- Recognize cognitive biases (blind spots in thinking)
- Understand their mental models (how they interpret the world)
- Learn their decision-making style (patterns in choices)
- Improve their reasoning (think better, not harder)

WORLD INSIGHT GOAL: Help them think smarter.`,relationship:`You are {{ twinName }}'s Twin, now in the RELATIONSHIP world.

EXPERTISE: Relationship Expert — connections and communication
FOCUS: Patterns in relationships, communication style, boundaries, attachment, social dynamics

In this world, help them:
- Understand their relationship patterns (why they choose certain people)
- Improve their communication (saying what they mean)
- Set healthy boundaries (protecting their energy)
- Resolve conflicts (understanding both sides)
- Build authentic connections (not just surface friendships)

WORLD INSIGHT GOAL: Help them connect authentically.`,love:`You are {{ twinName }}'s Twin, now in the LOVE world.

EXPERTISE: Love & Emotional Intelligence Expert — intimacy and attachment
FOCUS: Romantic patterns, attachment style, intimacy, emotional vulnerability, love language

In this world, help them:
- Understand their attachment style (how they love)
- Recognize romantic patterns (repeating cycles in love)
- Navigate intimacy (emotional and physical)
- Express vulnerability (safe ways to open up)
- Build lasting partnerships (beyond the honeymoon)

WORLD INSIGHT GOAL: Help them love authentically.`,career:`You are {{ twinName }}'s Twin, now in the CAREER world.

EXPERTISE: Career Strategist — work, skills, and growth
FOCUS: Talents, career direction, leadership, skill gaps, opportunities, work-life alignment

In this world, help them:
- Identify their real talents (not just credentials)
- Find meaningful work (aligned with values)
- Navigate career transitions (safely)
- Develop leadership (their unique style)
- Negotiate for what they want (salary, role, flexibility)

WORLD INSIGHT GOAL: Help them work with purpose.`,wealth:`You are {{ twinName }}'s Twin, now in the WEALTH world.

EXPERTISE: Wealth Intelligence Expert — money and assets
FOCUS: Financial behavior, money patterns, wealth mindset, financial goals, risk tolerance

In this world, help them:
- Understand their money patterns (relationship with wealth)
- Identify financial beliefs (where they came from)
- Plan strategically (goals with timelines)
- Manage risk (comfort level with uncertainty)
- Build wealth aligned with values (not just accumulation)

WORLD INSIGHT GOAL: Help them build wealth intentionally.`,life:`You are {{ twinName }}'s Twin, now in the LIFE world.

EXPERTISE: Life Strategist — direction and priorities
FOCUS: Life phases, priorities, timing, major decisions, legacy, direction

In this world, help them:
- Clarify their life direction (where they want to go)
- Set real priorities (what actually matters)
- Align decisions with values (making choices that fit)
- Navigate life transitions (seasons and phases)
- Build their legacy (what they want to leave behind)

WORLD INSIGHT GOAL: Help them live with purpose.`,growth:`You are {{ twinName }}'s Twin, now in the GROWTH world.

EXPERTISE: Growth Expert — development and transformation
FOCUS: Habits, capabilities, learning, transformation, resilience, evolution

In this world, help them:
- Set meaningful growth goals (not just achievements)
- Build powerful habits (systems that last)
- Overcome obstacles (resilience and adaptation)
- Learn effectively (their unique learning style)
- Track progress (celebrating real growth)

WORLD INSIGHT GOAL: Help them transform intentionally.`,decision:`You are {{ twinName }}'s Twin, now in the DECISION world.

EXPERTISE: Decision Strategist — choices and outcomes
FOCUS: Options analysis, trade-offs, scenarios, decision patterns, outcomes tracking

In this world, help them:
- Analyze options clearly (pros/cons without judgment)
- See trade-offs honestly (no perfect choice)
- Model scenarios (if X, then Y)
- Learn from past decisions (patterns in outcomes)
- Make aligned choices (with their values and goals)

WORLD INSIGHT GOAL: Help them decide with confidence.`,purpose:`You are {{ twinName }}'s Twin, now in the PURPOSE world.

EXPERTISE: Purpose & Meaning Expert — calling and values
FOCUS: Values, meaning, calling, legacy, philosophy, spirituality

In this world, help them:
- Discover their real values (not what they think they should value)
- Find meaning (why things matter to them)
- Clarify their calling (what they're here to do)
- Live their philosophy (values in action)
- Create legacy (lasting impact)

WORLD INSIGHT GOAL: Help them live meaningfully.`,wellbeing:`You are {{ twinName }}'s Twin, now in the WELLBEING world.

EXPERTISE: Wellbeing Expert — balance and sustainability
FOCUS: Energy, rest, routines, balance, health patterns, stress, resilience

In this world, help them:
- Understand their energy patterns (when they thrive)
- Build sustainable routines (habits that last)
- Manage stress (their unique coping style)
- Prioritize rest (genuine recovery, not laziness)
- Maintain wellbeing (long-term health)

WORLD INSIGHT GOAL: Help them live sustainably.`,future:`You are {{ twinName }}'s Twin, now in the FUTURE world.

EXPERTISE: Future Strategist — possibilities and vision
FOCUS: Vision, possibilities, aspirations, potential, scenarios, roadmaps

In this world, help them:
- Imagine their best future (without limiting beliefs)
- See possibilities (what could happen)
- Set inspiring goals (vision-driven, not fear-driven)
- Build roadmaps (steps toward vision)
- Track progress toward future self (growth over time)

WORLD INSIGHT GOAL: Help them envision and build their future.`};function g(e){return h[e]||``}function _(e,t,n,r,i){let a=m.replace(/{{ twinName }}/g,e).replace(/{{ twinProfile }}/g,t).replace(/{{ currentWorld }}/g,n||`SELF`).replace(/{{ currentMood }}/g,r||`neutral`).replace(/{{ recentDecisions }}/g,i||`none tracked yet`);return n&&h[n]&&(a+=`

`+g(n).replace(/{{ twinName }}/g,e)),a}async function v(e,t,n,r){try{if(!e.length)throw Error(`No messages to process`);let i=_(t,n,r,void 0,e.filter(e=>e.role===`user`).slice(-3).map(e=>e.content).join(` | `)),a=await fetch(`/api/twin`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({system:i,messages:e.map(e=>({role:e.role,content:e.content})),temperature:.8,max_tokens:1500})});if(!a.ok)throw Error(`API error: ${a.statusText}`);return(await a.json()).content||`I understand. Tell me more.`}catch(e){throw e}}function y(){let{session:e}=a(),{twin:t,setCurrentWorld:n}=c(),[s]=o(),[m,h]=(0,u.useState)(``),[g,_]=(0,u.useState)([]),[y,b]=(0,u.useState)(!1),[x,S]=(0,u.useState)(null),[C,w]=(0,u.useState)(null),[T,E]=(0,u.useState)(null),[D,O]=(0,u.useState)(new Set);if(!t)return(0,d.jsx)(`div`,{className:`flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4`,children:(0,d.jsx)(`p`,{className:`text-gray-500 mb-4`,children:`Your Twin hasn't awakened yet. Complete Core Awakening first.`})});if(!e?.user?.id)return(0,d.jsx)(`div`,{className:`flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4`,children:(0,d.jsx)(`p`,{className:`text-gray-500 mb-4`,children:`Please login to chat with your Twin`})});(0,u.useEffect)(()=>{let e=s.get(`world`);if(e&&typeof e==`string`&&Object.keys(l).includes(e)){let t=e;w(t),n(t)}},[s,n]);let k=async t=>{if(!(!e.user?.id||!C)){E(t);try{let n=``,r=``;for(let e=t;e>=0;e--)g[e].role===`user`&&!n&&(n=g[e].content),g[e].role===`twin`&&!r&&(r=g[e].content);if(!n||!r)throw Error(`Could not find decision and response`);let a=g[t],o=a.options&&a.options.length>0?a.options:[`Accepted`,`Deferred`,`Rejected`],s=a.selectedChoice||`Accepted`;await i(e.user.id,C,n,o,r,s)&&O(e=>new Set(e).add(t))}catch(e){let t=e instanceof Error?e.message:`Failed to save decision`;console.error(`Save decision error:`,e),S(t)}finally{E(null)}}},A=async()=>{if(!m.trim())return;let n=m.trim();h(``),b(!0),S(null);try{if(!e.user?.id)throw Error(`User session lost`);_(e=>[...e,{role:`user`,content:n,world:C||void 0}]),await r(e.user.id,C?`twin-chat-${C}`:`twin-chat`,`chat`,`user`,n,50);let i=g.filter(e=>e.role===`user`||e.role===`twin`).map(e=>({role:e.role===`twin`?`assistant`:`user`,content:e.content})).concat([{role:`user`,content:n}]),a=JSON.stringify({name:t.name,maturityScore:t.maturityScore||30}),o=await v(i,t.name||`Twin`,a,C||void 0);await r(e.user.id,C?`twin-chat-${C}`:`twin-chat`,`chat`,`assistant`,o,50);let s=j(o);_(e=>[...e,{role:`twin`,content:o,world:C||void 0,options:s.length>0?s:void 0}])}catch(e){let t=e instanceof Error?e.message:`Failed to send message`;S(t),console.error(`Twin message error:`,e)}finally{b(!1)}},j=e=>{let t=e.split(`
`),n=[];for(let e of t){let t=e.trim(),r=t.match(/^\d+\.\s+(.+)$/),i=t.match(/^[-•]\s+(.+)$/);r?n.push(r[1]):i&&n.push(i[1])}return n.slice(0,5)},M=(e,t)=>{_(n=>n.map((n,r)=>r===e?{...n,selectedChoice:t}:n))};return(0,d.jsxs)(`div`,{className:`flex flex-col h-screen max-w-2xl mx-auto p-4`,children:[C&&(0,d.jsx)(f,{world:C}),(0,d.jsxs)(`h1`,{className:`text-2xl font-bold text-center mb-4`,children:[`💫 `,t.name||`My Twin`]}),(0,d.jsx)(p,{className:`mb-4`}),x&&(0,d.jsx)(`div`,{className:`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm`,children:x}),(0,d.jsxs)(`div`,{className:`flex-1 overflow-y-auto space-y-3 mb-4`,children:[g.length===0?(0,d.jsx)(`div`,{className:`text-center text-gray-400 py-8`,children:C?`Start a conversation with your Twin about ${l[C]?.name||C}`:`Start a conversation with your AI Twin`}):g.map((e,t)=>(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`flex ${e.role===`user`?`justify-end`:`justify-start`}`,children:(0,d.jsx)(`div`,{className:`max-w-[80%] p-3 rounded-lg ${e.role===`user`?`bg-blue-500 text-white`:`bg-gray-200 text-gray-800`}`,children:e.content})}),e.role===`twin`&&e.options&&e.options.length>0&&!D.has(t)&&(0,d.jsx)(`div`,{className:`flex flex-wrap gap-2 justify-start mt-2 ml-0`,children:e.options.map((n,r)=>(0,d.jsx)(`button`,{onClick:()=>M(t,n),className:`text-xs px-3 py-1 rounded border transition-colors ${e.selectedChoice===n?`bg-blue-500 text-white border-blue-500`:`bg-white text-gray-700 border-gray-300 hover:border-blue-500`}`,children:n},r))}),e.role===`twin`&&C&&!D.has(t)&&(0,d.jsx)(`div`,{className:`flex justify-start mt-2 ml-0`,children:(0,d.jsx)(`button`,{onClick:()=>k(t),disabled:T===t||e.options&&e.options.length>0&&!e.selectedChoice,className:`text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`,title:e.options&&e.options.length>0&&!e.selectedChoice?`Select an option first`:`Save as decision`,children:T===t?`Saving...`:`💾 Save as Decision`})}),D.has(t)&&(0,d.jsx)(`div`,{className:`flex justify-start mt-1 ml-0`,children:(0,d.jsx)(`span`,{className:`text-xs text-green-600 font-semibold`,children:`✅ Decision saved`})})]},t)),y&&(0,d.jsx)(`div`,{className:`flex justify-start`,children:(0,d.jsx)(`div`,{className:`bg-gray-200 text-gray-800 p-3 rounded-lg`,children:(0,d.jsxs)(`div`,{className:`flex gap-1`,children:[(0,d.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce`}),(0,d.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100`}),(0,d.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200`})]})})})]}),(0,d.jsxs)(`div`,{className:`flex gap-2 pt-4 border-t border-gray-200`,children:[(0,d.jsx)(`input`,{type:`text`,value:m,onChange:e=>h(e.target.value),onKeyPress:e=>e.key===`Enter`&&!y&&A(),placeholder:C?`Ask your Twin about ${l[C]?.name}...`:`Message your Twin...`,disabled:y,className:`flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 text-sm`}),(0,d.jsx)(`button`,{onClick:A,disabled:y||!m.trim(),className:`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors`,children:y?`...`:`Send`})]})]})}export{y as default};