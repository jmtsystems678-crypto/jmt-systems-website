const jmt = window.supabase.createClient(JMT_CONFIG.supabaseUrl, JMT_CONFIG.supabasePublishableKey);
const projectForm = document.querySelector('.booking form');
const formNote = projectForm.querySelector('small');
if (formNote) formNote.textContent = 'Your request is securely saved and sent to the JMT team.';

projectForm.addEventListener('submit', async event => {
  event.preventDefault();
  const fields = projectForm.querySelectorAll('input, select, textarea');
  const button = projectForm.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending request...';
  try {
    const response = await fetch('/api/create-service-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fields[0].value.trim(),
        email: fields[1].value.trim(),
        service: fields[2].value,
        project_details: fields[3].value.trim()
      })
    });
    if (!response.ok) throw new Error('Request could not be sent');
    projectForm.reset();
    button.textContent = 'Request sent — JMT will contact you';
  } catch (error) {
    button.disabled = false;
    button.textContent = 'Try again';
    alert('We could not send your request. Please use WhatsApp or email JMT directly.');
  }
});

document.querySelector('.menu').addEventListener('click', () => document.querySelector('.nav nav').classList.toggle('open'));

// The JMT Human Capability Engine: an honest, interactive explanation of JMT's real service areas.
(() => {
  const engine = document.querySelector('.capability-engine');
  if (!engine) return;
  const areas = {
    strategy: {
      number: '01 / 06', title: 'Strategy & Insight',
      copy: 'JMT uses structured thinking and systems insight to turn complex ideas into practical, high-impact solutions. Every engagement begins with clarity: understanding the challenge, the people involved, and the outcome that matters.',
      items: ['Systems thinking', 'Strategic clarity', 'Practical solution design']
    },
    writing: {
      number: '02 / 06', title: 'Writing & Publishing',
      copy: 'JMT helps authors, students, professionals, and organisations communicate with clarity and confidence. We refine important ideas and prepare them for professional use, print, or digital publishing.',
      items: ['Editing & proofreading', 'Professional ghostwriting', 'Book design & formatting']
    },
    brand: {
      number: '03 / 06', title: 'Branding & Media',
      copy: 'JMT creates clear and memorable brand communication that helps people recognise, trust, and engage with an organisation’s purpose. Every design is built to communicate with consistency and impact.',
      items: ['Logo & identity design', 'Brand identity systems', 'Flyers, social designs & presentations']
    },
    web: {
      number: '04 / 06', title: 'Web & Technology',
      copy: 'JMT builds responsive digital experiences that represent a brand clearly and help it work harder. We use practical web solutions to support visibility, communication, and conversion.',
      items: ['Business websites', 'Landing pages', 'Portfolio websites']
    },
    systems: {
      number: '05 / 06', title: 'Business Systems',
      copy: 'JMT helps organisations create the structure behind reliable performance. Clear systems reduce confusion, improve consistency, and make everyday operations easier to manage and grow.',
      items: ['SOP development', 'Operational clarity', 'Repeatable workflows']
    },
    learning: {
      number: '06 / 06', title: 'Learning & Leadership',
      copy: 'JMT programmes and capability-focused experiences help people discover their abilities, strengthen knowledge, and grow into purposeful performance. This is where potential is developed for meaningful impact.',
      items: ['I Am Multi-Talented', 'Zionization Conference', 'Human capability development']
    }
  };
  const title = engine.querySelector('[data-engine-title]');
  const copy = engine.querySelector('[data-engine-copy]');
  const number = engine.querySelector('.engine-number');
  const list = engine.querySelector('[data-engine-list]');
  const selectArea = key => {
    const area = areas[key];
    if (!area) return;
    engine.querySelectorAll('.engine-node').forEach(button => {
      const selected = button.dataset.engine === key;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    number.textContent = area.number;
    title.textContent = area.title;
    copy.textContent = area.copy;
    list.replaceChildren(...area.items.map(item => {
      const entry = document.createElement('li');
      entry.textContent = item;
      return entry;
    }));
  };
  engine.querySelectorAll('.engine-node').forEach(button => button.addEventListener('click', () => selectArea(button.dataset.engine)));
})();

// Free guided assistant: answers only from JMT's approved public information.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .jmt-chat-toggle{position:fixed;right:22px;bottom:22px;z-index:30;border:0;border-radius:999px;background:#d99b26;color:#fff;font:700 14px 'DM Sans',sans-serif;padding:15px 19px;box-shadow:0 10px 26px rgba(6,29,75,.28);cursor:pointer}
    .jmt-chat{position:fixed;right:22px;bottom:82px;z-index:31;width:min(365px,calc(100vw - 32px));background:#fff;border:1px solid #d8dce2;box-shadow:0 20px 55px rgba(6,29,75,.25);display:none}
    .jmt-chat.open{display:block}.jmt-chat-head{padding:18px 20px;background:#061d4b;color:#fff;display:flex;justify-content:space-between;align-items:start}.jmt-chat-head strong{font:700 18px Manrope,sans-serif}.jmt-chat-head small{display:block;color:#dfe5ef;margin-top:4px}.jmt-chat-close{border:0;background:none;color:#fff;font-size:24px;cursor:pointer}.jmt-chat-body{height:285px;overflow:auto;padding:16px;background:#f8f7f2}.jmt-message{max-width:88%;padding:10px 12px;margin:0 0 10px;font-size:14px;line-height:1.45}.jmt-bot{background:#fff;color:#10233f;border-left:3px solid #d99b26}.jmt-user{background:#e6eefb;margin-left:auto}.jmt-prompts{padding:12px 14px 4px;display:flex;gap:7px;flex-wrap:wrap}.jmt-prompts button{border:1px solid #d8dce2;background:#fff;color:#061d4b;padding:7px 9px;font:600 11px 'DM Sans',sans-serif;cursor:pointer}.jmt-chat-form{padding:12px 14px 16px;display:flex;gap:8px}.jmt-chat-form input{min-width:0;flex:1;border:1px solid #d8dce2;padding:10px;font:14px 'DM Sans',sans-serif}.jmt-chat-form button{border:0;background:#d99b26;color:#fff;padding:10px 13px;font-weight:bold;cursor:pointer}
  `;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', `
    <button class="jmt-chat-toggle" type="button" aria-expanded="false">Ask JMT</button>
    <section class="jmt-chat" aria-label="JMT Assistant">
      <div class="jmt-chat-head"><div><strong>JMT Assistant</strong><small>Guidance for services, programmes & bookings</small></div><button class="jmt-chat-close" type="button" aria-label="Close chat">×</button></div>
      <div class="jmt-chat-body" aria-live="polite"></div>
      <div class="jmt-prompts"><button type="button">What is JMT?</button><button type="button">Writing services</button><button type="button">Branding services</button><button type="button">Web services</button><button type="button">How to pay</button><button type="button">Start a project</button></div>
      <form class="jmt-chat-form"><input aria-label="Ask JMT a question" placeholder="Ask about JMT..." maxlength="300"><button type="submit">Send</button></form>
    </section>`);
  const toggle = document.querySelector('.jmt-chat-toggle');
  const chat = document.querySelector('.jmt-chat');
  const body = document.querySelector('.jmt-chat-body');
  const form = document.querySelector('.jmt-chat-form');
  const input = form.querySelector('input');
  const add = (text, role) => { const message = document.createElement('p'); message.className = `jmt-message ${role}`; message.textContent = text; body.appendChild(message); body.scrollTop = body.scrollHeight; };
  const answer = question => {
    const q = question.toLowerCase();
    if (/(hello|hi|good morning|good afternoon|good evening)/.test(q)) return 'Hello! I am the JMT Assistant. I can explain JMT, our services, programmes, payment steps, and how to begin a project.';
    if (/(what is jmt|who are you|about jmt|company|human capability|capability gap|junction|mission|vision|purpose|value)/.test(q)) return 'JMT Systems means Junction of Media and Technology. We are a human capability systems company: we design integrated media, technology, research and innovation systems that help people and organisations think better, work smarter, communicate clearly and perform at their highest potential. Our focus is closing the Human Capability Gap—the gap between potential and real-world performance—through intelligent, human-centred and sustainable systems.';
    if (/(writing|publishing|proofread|proofread|edit|ghostwrit|book|manuscript|format)/.test(q)) return 'JMT Writing & Publishing services include: 1) Editing and Proofreading—polished, error-free and professionally refined documents; 2) Professional Ghostwriting—well-researched, original content that brings your ideas to life; and 3) Book Design and Formatting—beautifully formatted books for print and digital publishing. This service is suited to authors, students, professionals and organisations that need clear, impactful communication.';
    if (/(business system|sop|standard operating|procedure|process|operation)/.test(q)) return 'JMT Business Systems focuses on Standard Operating Procedure (SOP) Development. We create well-structured procedures that streamline operations, improve clarity and efficiency, support consistency, and help organisations grow sustainably.';
    if (/(branding|brand|logo|identity|flyer|poster|social media|presentation|creative design)/.test(q)) return 'JMT Branding & Creative Design includes: Logo and Identity Design; complete Brand Identity Systems; Flyers, Posters and Social Media Designs; and Professional Presentation Design. We build brands that are strategic, creative, memorable and consistent—so clients communicate clearly and build trust.';
    if (/(web|website|landing page|portfolio|site)/.test(q)) return 'JMT Web Solutions includes: Business Website Development—professional, responsive websites that represent a brand and convert visitors; Landing Page Development—high-converting pages for offers, leads and campaigns; and Portfolio Website Development—professional sites that showcase skills, projects and achievements. JMT builds websites that look strong and work hard for the business.';
    if (/(service|what do you do|offer)/.test(q)) return 'JMT provides four key service areas: Writing & Publishing; Business Systems and SOP Development; Branding & Creative Design; and Web Solutions. Ask me about any one area—for example, “What does JMT do in writing?” or “What web services do you offer?”';
    if (/(multi|talent|price|cost|fee|programme|program)/.test(q)) return 'JMT currently offers two programmes: I Am Multi-Talented, a recurring programme that helps people discover and develop their abilities, at GH₵220 (about US$19); and Zionization Conference, an annual conference on engineering human potential through media and technology, at GH₵100.';
    if (/(pay|momo|mtn|card|checkout)/.test(q)) return 'Programme payments are completed through secure Paystack checkout, which supports card and MTN MoMo where available. For payment help, call +233 53 692 2098 or +233 20 762 6665.';
    if (/(book|start|project|contact|reach|email|phone)/.test(q)) return 'To start a project, complete the project request form on this page. JMT will review your details and contact you. You can also email jmtsystems678@gmail.com or call +233 54 311 3268.';
    if (/(zion|conference)/.test(q)) return 'Zionization Conference is JMT’s annual conference focused on engineering human potential through media and technology. Registration is GH₵100.';
    return 'I can answer approved questions about JMT’s identity, Writing & Publishing, Business Systems, Branding & Creative Design, Web Solutions, programmes, prices, payments, and starting a project. Please ask one of these areas.';
  };
  const ask = question => { if (!question.trim()) return; add(question.trim(), 'jmt-user'); add(answer(question), 'jmt-bot'); };
  const setOpen = open => { chat.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); if (open) input.focus(); };
  toggle.addEventListener('click', () => setOpen(!chat.classList.contains('open')));
  document.querySelector('.jmt-chat-close').addEventListener('click', () => setOpen(false));
  document.querySelectorAll('.jmt-prompts button').forEach(button => button.addEventListener('click', () => ask(button.textContent)));
  form.addEventListener('submit', event => { event.preventDefault(); ask(input.value); input.value = ''; });
  add('Welcome to JMT Systems. How can I help you today?', 'jmt-bot');
})();
