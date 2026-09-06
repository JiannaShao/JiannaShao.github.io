(function(){
  const cursor=document.querySelector('.xp-cursor');
  if(cursor && window.matchMedia('(pointer:fine)').matches){
    window.addEventListener('mousemove',e=>{cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
  }

  const header=document.getElementById('site-header');
  const links=[...document.querySelectorAll('.nav-links a')];
  const sections=[...document.querySelectorAll('main section[id]')];
  function update(){
    header.style.background='#e1ebe7';
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

  function buildSnake(){
    const rect=svg.getBoundingClientRect();
    const W=Math.max(1,rect.width);
    const H=Math.max(1,rect.height);

    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

    const stroke=4.5;
    const pad=(stroke/2)+3;
    const R=7;
    const lx=pad+R;
    const rx=W-pad-R;

    let y=pad+1;
    let d=`M ${rx} ${y} L ${lx} ${y}`;
    let leftTurn=true;

    while(y + 2*R <= H-pad){
      const nextY=y+2*R;

      if(leftTurn){
        d+=` A ${R} ${R} 0 0 1 ${rx} ${nextY} L ${lx} ${nextY}`;
      }else{
        d+=` A ${R} ${R} 0 0 0 ${lx} ${nextY} L ${rx} ${nextY}`;
      }

      y=nextY;
      leftTurn=!leftTurn;
    }

    ghost.setAttribute('d',d);
    path.setAttribute('d',d);

    const len=path.getTotalLength();
    path.style.strokeDasharray=`${len} ${len}`;

    function updateSnake(){
      const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      let p=0;

      if(window.scrollY <= 1){
        p=0;
      }else if(max > 0 && window.scrollY >= max-1){
        p=1;
      }else if(max > 0){
        p=window.scrollY/max;
      }

      path.style.strokeDashoffset=`${len*(1-p)}`;
    }

    path.style.strokeDashoffset=`${len}`;
    requestAnimationFrame(updateSnake);
    return updateSnake;
  }

  let updateSnake=buildSnake();
  window.addEventListener('scroll',()=>updateSnake(),{passive:true});
  window.addEventListener('resize',()=>{updateSnake=buildSnake();},{passive:true});
  const resumeCanvas=document.getElementById('resume-canvas');
  const resumeCanvasZoom=document.getElementById('resume-canvas-zoom');
  const resumeButton=document.getElementById('resume-preview-button');
  const resumeLightbox=document.getElementById('resume-lightbox');
  const resumeClose=document.getElementById('resume-lightbox-close');

  if(resumeCanvas && resumeCanvasZoom && resumeButton && resumeLightbox && resumeClose){
    async function renderResume(){
      try{
        const pdfjsLib=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

        const pdf=await pdfjsLib.getDocument('Resume.pdf').promise;
        const page=await pdf.getPage(1);

        async function draw(canvas,targetWidth){
          const base=page.getViewport({scale:1});
          const scale=targetWidth/base.width;
          const viewport=page.getViewport({scale});
          const ratio=window.devicePixelRatio || 1;

          canvas.width=Math.floor(viewport.width*ratio);
          canvas.height=Math.floor(viewport.height*ratio);
          canvas.style.width=viewport.width+'px';
          canvas.style.height=viewport.height+'px';

          const ctx=canvas.getContext('2d');
          ctx.setTransform(ratio,0,0,ratio,0,0);

          await page.render({canvasContext:ctx,viewport}).promise;
        }

        await draw(resumeCanvas,Math.min(360,resumeButton.clientWidth || 360));

        resumeButton.addEventListener('click',async()=>{
          resumeLightbox.classList.add('open');
          resumeLightbox.setAttribute('aria-hidden','false');
          document.body.classList.add('resume-zoom-open');
          await draw(resumeCanvasZoom,Math.min(window.innerWidth*0.88,1100));
        });

        function closeResume(){
          resumeLightbox.classList.remove('open');
          resumeLightbox.setAttribute('aria-hidden','true');
          document.body.classList.remove('resume-zoom-open');
        }

        resumeClose.addEventListener('click',closeResume);
        resumeLightbox.addEventListener('click',e=>{
          if(e.target===resumeLightbox) closeResume();
        });
        window.addEventListener('keydown',e=>{
          if(e.key==='Escape') closeResume();
        });
      }catch(err){
        console.error('Resume.pdf preview failed',err);
      }
    }

    renderResume();
  }

})();
