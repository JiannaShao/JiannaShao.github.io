(function(){
  const cursor=document.querySelector('.xp-cursor');
  if(cursor && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
  }

  const header=document.getElementById('site-header');
  const links=[...document.querySelectorAll('.nav-links a')];
  const sections=[...document.querySelectorAll('main section[id]')];
  function update(){
    header.style.background=window.scrollY>40?'rgba(114,168,149,.97)':'#72a895';
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
  const svg=document.getElementById('snake-svg'), ghost=document.getElementById('snake-ghost'), path=document.getElementById('snake-path');
  const R=7, lx=19, rx=33, loops=34;
  let y=3, d=`M ${rx} ${y} L ${lx} ${y}`;
  for(let i=0;i<loops;i++){
    const nextY=y+2*R;
    if(i%2===0){
      d+=` A ${R} ${R} 0 0 0 ${rx} ${nextY} L ${lx} ${nextY}`;
    }else{
      d+=` A ${R} ${R} 0 0 1 ${lx} ${nextY} L ${rx} ${nextY}`;
    }
    y=nextY;
  }
  ghost.setAttribute('d',d); path.setAttribute('d',d);
  function resize(){
    svg.setAttribute('viewBox',`0 0 52 ${y+3}`);
    const len=path.getTotalLength();
    path.style.strokeDasharray=`${len} ${len}`;
    function updateSnake(){
      const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      const p=max>0?Math.max(0,Math.min(window.scrollY/max,1)):0;
      path.style.strokeDashoffset=`${len*(1-p)}`;
    }
    window.addEventListener('scroll',updateSnake,{passive:true});
    window.addEventListener('resize',updateSnake,{passive:true});
    updateSnake();
  }
  resize();
})();
