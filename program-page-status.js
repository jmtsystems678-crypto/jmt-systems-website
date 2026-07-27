(() => {
  const program=document.body.dataset.program;
  if(!program||!window.supabase||!window.JMT_CONFIG)return;
  const db=window.supabase.createClient(JMT_CONFIG.supabaseUrl,JMT_CONFIG.supabasePublishableKey);
  const url=`registration.html?program=${encodeURIComponent(program)}`;
  const actions=label=>document.querySelectorAll('[data-program-cta]').forEach(link=>{link.href=url;link.textContent=`${label} →`});
  const notice=text=>document.querySelectorAll('[data-program-notice]').forEach(node=>node.textContent=text);
  db.from('program_events').select('status').eq('program',program).eq('is_public',true).maybeSingle().then(({data,error})=>{
    if(error||!data)return;const status=document.querySelector('[data-program-status]');
    if(data.status==='open'){if(status)status.textContent='Registration is open';actions('Register now');notice('Registration is now open. Complete registration to review the event details and continue to secure payment.');}
    else if(data.status==='closed'){if(status)status.textContent='Registration currently closed';actions('Join priority list');notice('This edition is currently closed. Join the Priority List to receive news of a future confirmed edition.');}
    else{if(status)status.textContent='Next cohort being planned';actions('Reserve your place');notice('The next cohort is being planned. Joining the Priority List does not require payment; it ensures JMT can contact you first when dates, format and registration details are confirmed.');}
  });
})();
