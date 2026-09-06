(function(){
  const cursor=document.querySelector('.xp-cursor');
  if(cursor && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
  }

  const header=document.getElementById('site-header');
  const links=[...document.querySelectorAll('.nav-links a')];
  const sections=[...document.querySelectorAll('main section[id]')];
  function update(){
    header.style.background=window.scrollY>40?'rgba(160,189,179,.97)':'#a0bdb3';
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
  let y=3;

  // Start by travelling from right to left, matching the original orientation.
  let d=`M ${rx} ${y} L ${lx} ${y}`;

  for(let i=0;i<loops;i++){
    const nextY=y+(2*R);

    if(i%2===0){
      // Original orientation: curve outward to the LEFT,
      // ending at the right-side x coordinate on the next row.
      d+=` A ${R} ${R} 0 0 1 ${rx} ${nextY}`;
      d+=` L ${lx} ${nextY}`;
    }else{
      // Then curve outward to the RIGHT.
      d+=` A ${R} ${R} 0 0 0 ${lx} ${nextY}`;
      d+=` L ${rx} ${nextY}`;
    }

    y=nextY;
  }

  ghost.setAttribute('d',d);
  path.setAttribute('d',d);

  function resize(){
    svg.setAttribute('viewBox',`0 0 52 ${y+3}`);

    const len=path.getTotalLength();
    path.style.strokeDasharray=`${len} ${len}`;

    function updateSnake(){
      const doc=document.documentElement;
      const maxScroll=Math.max(0,doc.scrollHeight-window.innerHeight);

      // Snap cleanly at the extreme top and bottom so there is never
      // residual fill at 0% or an unfinished segment at 100%.
      let progress=0;

      if(window.scrollY <= 1){
        progress=0;
      }else if(window.scrollY >= maxScroll-1){
        progress=1;
      }else if(maxScroll > 0){
        progress=window.scrollY/maxScroll;
      }

      path.style.strokeDashoffset=`${len*(1-progress)}`;
    }

    window.addEventListener('scroll',updateSnake,{passive:true});
    window.addEventListener('resize',updateSnake,{passive:true});

    // Force a clean initial state before any scrolling happens.
    path.style.strokeDashoffset=`${len}`;
    requestAnimationFrame(updateSnake);
  }

  resize();
})();
