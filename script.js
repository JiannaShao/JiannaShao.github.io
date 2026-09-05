(function(){
  const cursor=document.querySelector('.xp-cursor');
  if(cursor && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
  }

  const header=document.getElementById('site-header');
  const links=[...document.querySelectorAll('.nav-links a')];
  const sections=[...document.querySelectorAll('main section[id]')];
  function update(){
    header.style.background=window.scrollY>40?'rgba(245,241,231,.96)':'transparent';
    header.style.borderBottom=window.scrollY>40?'1px solid #d8d3c8':'0';
    header.style.boxShadow=window.scrollY>40?'0 2px 14px rgba(20,37,61,.07)':'none';
    let current='about';
    sections.forEach(s=>{if(s.getBoundingClientRect().top<=130) current=s.id});
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
  }
  window.addEventListener('scroll',update,{passive:true}); update();

  const toggle=document.querySelector('.menu-toggle'), mobile=document.querySelector('.mobile-nav');
  toggle.addEventListener('click',()=>{const open=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));

  // Build a full-height, scroll-progress snake. It scales to the viewport and never stops above the bottom.
  const svg=document.getElementById('snake-svg'), ghost=document.getElementById('snake-ghost'), path=document.getElementById('snake-path'), dot=document.getElementById('snake-dot');
  const R=9, pitch=18, lx=14, rx=42, loops=27;
  let d=`M ${rx} 3 L ${lx} 3`, y=3;
  for(let i=0;i<loops;i++){d+=i%2===0?` A ${R} ${R} 0 0 0 ${lx} ${y+pitch} L ${rx} ${y+pitch}`:` A ${R} ${R} 0 0 1 ${rx} ${y+pitch} L ${lx} ${y+pitch}`;y+=pitch}
  ghost.setAttribute('d',d);path.setAttribute('d',d);
  function resize(){svg.setAttribute('viewBox',`0 0 52 ${y+3}`);const len=path.getTotalLength();path.style.strokeDasharray=len;window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max>0?Math.min(scrollY/max,1):0;path.style.strokeDashoffset=len*(1-p);const pt=path.getPointAtLength(Math.max(0,Math.min(len-.1,len*p)));dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.style.opacity=p>.005?'1':'0'},{passive:true})}
  resize();
})();
