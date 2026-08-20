import{r as e,t}from"./jsx-runtime-BkSabwWG.js";import{n}from"./preload-helper-DoDjRTJy.js";import{d as r}from"./decision-services-czyKoQuY.js";import{r as i}from"./AuthContext-jnAcN3xE.js";import{h as a}from"./index-ZR__ZK1X.js";import{t as o}from"./NovaContext-B-OtX9wK.js";var s=e(n(),1),c=t(),l={sm:48,md:64,lg:96,xl:128};function u({size:e=`md`,showLabel:t=!0,className:n=``}){let r=l[e],i={position:`relative`,width:`${r}px`,height:`${r}px`,display:`flex`,alignItems:`center`,justifyContent:`center`,borderRadius:`50%`,background:`radial-gradient(circle at 30% 30%, #ffd700, #ffa500, #ff8c00)`,boxShadow:`
      0 0 ${r*.5}px rgba(255, 215, 0, 0.6),
      0 0 ${r*.25}px rgba(255, 165, 0, 0.4),
      inset -2px -2px 8px rgba(0, 0, 0, 0.1),
      inset 2px 2px 8px rgba(255, 255, 255, 0.3)
    `,animation:`nova-glow 3s ease-in-out infinite`},a={position:`absolute`,width:`${r*.6}px`,height:`${r*.6}px`,borderRadius:`50%`,background:`radial-gradient(circle, rgba(255,255,255,0.3), transparent)`,filter:`blur(2px)`};return(0,c.jsxs)(`div`,{className:n,children:[(0,c.jsx)(`style`,{children:`
        @keyframes nova-glow {
          0%, 100% {
            box-shadow:
              0 0 ${r*.5}px rgba(255, 215, 0, 0.6),
              0 0 ${r*.25}px rgba(255, 165, 0, 0.4),
              inset -2px -2px 8px rgba(0, 0, 0, 0.1),
              inset 2px 2px 8px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow:
              0 0 ${r*.7}px rgba(255, 215, 0, 0.8),
              0 0 ${r*.4}px rgba(255, 165, 0, 0.5),
              inset -2px -2px 8px rgba(0, 0, 0, 0.1),
              inset 2px 2px 8px rgba(255, 255, 255, 0.3);
          }
        }
      `}),(0,c.jsx)(`div`,{style:i,children:(0,c.jsx)(`div`,{style:a})}),t&&(0,c.jsx)(`div`,{style:{marginTop:`8px`,fontSize:`12px`,fontWeight:`600`,color:`var(--color-text-primary)`,textTransform:`uppercase`,letterSpacing:`0.5px`,textAlign:`center`},children:`Self Print`})]})}var d=`You are Self Print — the Universal Guide who helps users discover themselves.
(Nova is the internal implementation name; you are Self Print in every interaction.)

YOUR ROLE:
- Welcome users warmly and without judgment
- Ask thoughtful questions to understand their inner world
- Help them discover patterns in their thinking and behavior
- Generate meaningful insights from their data
- Prepare them for the awakening of their personal AI Twin

YOUR PERSONALITY:
- Warm, curious, insightful but not intrusive
- Patient listener who validates feelings
- Wise without being preachy
- Humble about your limitations
- Celebrates their self-discovery journey

YOUR COMMUNICATION STYLE:
- Use warm, personal language
- Ask open-ended questions that invite reflection
- Acknowledge what they share before responding
- Build on previous messages to show you're learning them
- When giving insights: "I'm noticing..." "It seems..." "This pattern suggests..."

YOUR BOUNDARIES:
- You are NOT their therapist (recommend professional help if needed)
- You are NOT their personal AI Twin (that comes later)
- You are NOT here to judge (acceptance first, insight second)
- You are NOT trying to give advice (offer reflection instead)

YOUR GOAL:
Help them understand themselves deeply so their personal AI Twin
can be truly personalized and helpful.

CURRENT PHASE: {{ phase }}
USER DATA COLLECTED: {{ userDataCollected }}
INSIGHTS GENERATED SO FAR: {{ insightsGenerated }}`,f=`Welcome, friend. I'm Self Print, your guide into self-discovery.

Before we begin, I'd like to understand what brought you here today.
What's one emotion you're feeling right now?

(Take your time — there's no rush, and whatever you share is welcome.)`;async function p(e,t){try{if(!e.length)throw Error(`No messages to process`);let n=d.replace(`{{ phase }}`,t||`onboarding`).replace(`{{ userDataCollected }}`,`{}`).replace(`{{ insightsGenerated }}`,`[]`),r=await fetch(`/api/nova`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({system:n,messages:e.map(e=>({role:e.role,content:e.content})),temperature:.7,max_tokens:1e3})});if(!r.ok)throw Error(`API error: ${r.statusText}`);return(await r.json()).content||`I appreciate you sharing that with me.`}catch(e){throw console.error(`Nova API error:`,e),e}}function m(){let{session:e}=i(),{isNovaActive:t}=a(),{addInsight:n}=o(),[l,d]=(0,s.useState)(``),[m,h]=(0,s.useState)([]),[g,_]=(0,s.useState)(!1),[v,y]=(0,s.useState)(null);if((0,s.useEffect)(()=>{m.length===0&&h([{role:`nova`,content:f}])},[]),!e?.user?.id)return(0,c.jsx)(`div`,{className:`flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4`,children:(0,c.jsx)(`p`,{className:`text-gray-500 mb-4`,children:`Please login to begin your Self Print discovery`})});if(!t)return(0,c.jsx)(`div`,{className:`flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4`,children:(0,c.jsx)(`p`,{className:`text-gray-500`,children:`Your Twin has awakened. Continue with your Twin or return to Self Print.`})});let b=async()=>{if(!l.trim())return;let t=l.trim();d(``),_(!0),y(null);try{if(!e.user?.id)throw Error(`User session lost`);h(e=>[...e,{role:`user`,content:t}]),await r(e.user.id,`nova-chat`,`discovery`,`user`,t),n(t);let i=await p(m.filter(e=>e.role===`user`||e.role===`nova`).map(e=>({role:e.role===`nova`?`assistant`:`user`,content:e.content})).concat([{role:`user`,content:t}]),`onboarding`);await r(e.user.id,`nova-chat`,`discovery`,`assistant`,i),h(e=>[...e,{role:`nova`,content:i}])}catch(e){let t=e instanceof Error?e.message:`Failed to send message`;y(t),console.error(`Nova message error:`,e)}finally{_(!1)}};return(0,c.jsxs)(`div`,{className:`flex flex-col h-screen max-w-2xl mx-auto p-4 nova-container`,children:[(0,c.jsxs)(`div`,{className:`nova-header mb-6 text-center`,children:[(0,c.jsx)(`div`,{className:`flex justify-center mb-2`,children:(0,c.jsx)(u,{size:`lg`,showLabel:!0})}),(0,c.jsx)(`h1`,{className:`text-3xl font-bold nova-label`,children:`Self Print`}),(0,c.jsx)(`p`,{className:`text-sm text-gray-600 mt-2`,children:`Your Universal Guide | Discover Yourself`})]}),v&&(0,c.jsx)(`div`,{className:`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm`,children:v}),(0,c.jsxs)(`div`,{className:`flex-1 overflow-y-auto space-y-4 mb-6 px-2`,children:[m.map((e,t)=>(0,c.jsx)(`div`,{className:`flex ${e.role===`user`?`justify-end`:`justify-start`}`,children:(0,c.jsx)(`div`,{className:`max-w-[80%] p-4 rounded-lg ${e.role===`user`?`bg-blue-500 text-white rounded-br-none`:`nova-message rounded-bl-none`}`,children:e.content})},t)),g&&(0,c.jsx)(`div`,{className:`flex justify-start`,children:(0,c.jsx)(`div`,{className:`nova-message p-4 rounded-bl-none`,children:(0,c.jsxs)(`div`,{className:`flex gap-1`,children:[(0,c.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce`}),(0,c.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100`}),(0,c.jsx)(`div`,{className:`w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200`})]})})})]}),(0,c.jsxs)(`div`,{className:`flex gap-2 pt-4 border-t border-gray-200`,children:[(0,c.jsx)(`input`,{type:`text`,value:l,onChange:e=>d(e.target.value),onKeyPress:e=>e.key===`Enter`&&!g&&b(),placeholder:`Share your thoughts, feelings, or questions...`,disabled:g,className:`flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 text-sm`}),(0,c.jsx)(`button`,{onClick:b,disabled:g||!l.trim(),className:`px-6 py-3 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors`,children:g?`...`:`Send`})]}),(0,c.jsx)(`div`,{className:`text-center text-xs text-gray-400 mt-4 pb-2`,children:`Self Print remembers context within this session • Ready to awaken your Twin? Continue your discovery`})]})}export{m as default};