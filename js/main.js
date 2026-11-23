(() => {
  const data = window.SITE_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const modal = $('#modal'), modalTitle = $('#modalTitle'), modalBody = $('#modalContent');
  function openModal(title, body, eyebrow='ARQUIVO PESSOAL') {
    $('#modalEyebrow').textContent = eyebrow; modalTitle.textContent = title; modalBody.innerHTML = body;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); $('.modal-close').focus();
  }
  function closeModal(){ modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open'); }
  $('.modal-close').addEventListener('click',closeModal);$('.modal-backdrop').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

  const timeline = $('#timeline');
  data.chapters.forEach((chapter,i)=>{
    const button=document.createElement('button');button.className='time-stop'+(!i?' active':'');button.type='button';
    button.innerHTML=`<span class="time-dot"></span><span class="time-year">${chapter.year}</span><strong class="time-title">${chapter.title}</strong><span class="time-sub">${chapter.subtitle}</span>`;
    button.addEventListener('click',()=>{ $$('.time-stop',timeline).forEach(x=>x.classList.remove('active'));button.classList.add('active');$('.timeline-fill').style.width=`${i*25}%`;$('#timelineCard').textContent=chapter.text;});timeline.append(button);
  });$('#timelineCard').textContent=data.chapters[0].text;
  $('#openLog').addEventListener('click',()=>openModal('Diário de bordo','<p>Essa viagem tem capítulos que ainda estou organizando. Algumas lembranças são nítidas; outras aparecem aos poucos, quando encontro uma fotografia, uma conversa ou uma música antiga.</p><p>Do Jardim de Infância até o 3º ano, cada etapa mudou um pouco a forma como enxergo o mundo. O que mais importa não é só o lugar onde estudei, mas as pessoas e descobertas que fizeram parte do caminho.</p><p>Este arquivo segue aberto: novas lembranças ainda podem pousar por aqui.</p>','REGISTRO DE MEMÓRIA'));

  const system=$('#planetSystem'), nodes=$('#planetNodes'), readout=$('#planetReadout');
  const positions=[{x:50,y:25},{x:79,y:46},{x:49,y:73},{x:19,y:48}];
  data.interests.forEach((p,i)=>{
    const n=document.createElement('button');n.type='button';n.className='planet-node'+(p.id==='interestelar'?' planet-ring':'');n.style.left=positions[i].x+'%';n.style.top=positions[i].y+'%';n.setAttribute('aria-label',`Explorar ${p.name}`);
    n.innerHTML=`<span class="planet-sphere" style="width:${p.size}px;height:${p.size}px;background:${p.color}"></span><span class="planet-label">${p.name.toUpperCase()}</span>`;
    n.addEventListener('click',()=>{readout.innerHTML=`<span class="readout-kicker">${p.type} · ÓRBITA ${String(i+1).padStart(2,'0')}</span><strong>${p.name}</strong><p>${p.text}</p>`; $$('.planet-node',nodes).forEach(x=>x.classList.remove('selected'));n.classList.add('selected');});nodes.append(n);
  });
  $('#interestList').innerHTML=data.interests.map((p,i)=>`<div class="interest-item"><span>0${i+1} / ${p.type}</span><b>${p.name}</b><p>${p.text}</p></div>`).join('');

  const teacherGrid=$('#teacherGrid');
  data.teachers.forEach(t=>{
    const card=document.createElement('button');card.type='button';card.className='teacher-card'+(!t.file?' no-photo':'');
    card.innerHTML=t.file?`<img src="assets/professores/${encodeURIComponent(t.file)}" alt="Retrato de ${t.name}" loading="lazy"><span class="teacher-meta"><strong>${t.name}</strong><span>${t.area}</span></span>`:`<span class="teacher-initial">${t.name[0]}</span><span class="teacher-meta"><strong>${t.name}</strong><span>FOTO A ADICIONAR</span></span>`;
    card.addEventListener('click',()=>openModal(t.name,`<p>${t.text}</p>${t.file?'':`<p class="pending-note">A foto de ${t.name} não estava na pasta de imagens enviada.</p>`}`,`HOMENAGEM · ${t.area}`));teacherGrid.append(card);
  });

  const essayGrid=$('#essayGrid');
  const essayItems=window.REDACTIONS || [];
  function renderEssays(query=''){
    const q=query.trim().toLocaleLowerCase('pt-BR');const shown=essayItems.filter(x=>x.title.toLocaleLowerCase('pt-BR').includes(q));
    essayGrid.innerHTML=shown.map(x=>`<button type="button" class="essay-card" data-essay="${x.number}"><span class="essay-num">CADERNO ${String(x.number).padStart(2,'0')} / 17</span><strong>${escapeHTML(x.title)}</strong><span class="essay-pending">${x.paragraphs.length} PARÁGRAFOS · LER REDAÇÃO ↗</span></button>`).join('');
    $$('.essay-card',essayGrid).forEach(card=>card.addEventListener('click',()=>{const essay=essayItems.find(x=>x.number===Number(card.dataset.essay));openModal(essay.title,essay.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join(''),`REDAÇÃO ${String(essay.number).padStart(2,'0')} · PORTFÓLIO`)}));
  }
  renderEssays();$('#essaySearch').addEventListener('input',e=>renderEssays(e.target.value));

  const channelCloud=$('#channelCloud');
  data.channels.forEach(([name,channel])=>{
    let handle=channel;try{handle=decodeURIComponent(channel)}catch{}
    const card=document.createElement('a');card.className='channel-link channel-card';card.href=`https://www.youtube.com/@${encodeURIComponent(handle)}`;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`Abrir o canal ${name} no YouTube`);
    const avatar=document.createElement('span');avatar.className='channel-avatar';
    const fallback=document.createElement('span');fallback.className='channel-avatar-fallback';fallback.textContent=name.trim().slice(0,1).toUpperCase();
    const image=document.createElement('img');image.alt=`Foto do canal ${name}`;image.loading='lazy';image.referrerPolicy='no-referrer';
    const avatarCandidates=[`https://unavatar.io/youtube/${encodeURIComponent('@'+handle)}`,`https://unavatar.io/youtube/${encodeURIComponent(handle)}`];
    let avatarAttempt=0;image.addEventListener('error',()=>{avatarAttempt++;if(avatarAttempt<avatarCandidates.length){image.src=avatarCandidates[avatarAttempt];return}image.remove();avatar.classList.add('avatar-unavailable')});image.src=avatarCandidates[0];
    avatar.append(fallback,image);
    const label=document.createElement('span');label.className='channel-card-name';label.textContent=name;
    const linkHint=document.createElement('span');linkHint.className='channel-card-hint';linkHint.textContent='VER CANAL ↗';
    card.append(avatar,label,linkHint);channelCloud.append(card);
  });
  const animeFavorites=[
    {name:'Nanatsu no Taizai',mark:'七つ',style:'nanatsu'},
    {name:'Dragon Ball',mark:'DB',style:'dragon'},
    {name:'Naruto',mark:'うず',style:'naruto'},
    {name:'Death Note',mark:'夜神',style:'death'},
    {name:'Pokémon',mark:'⚡',style:'pokemon'}
  ];
  $('#animeList').innerHTML=animeFavorites.map((anime,i)=>`<div class="anime-tile anime-${anime.style}"><span class="anime-number">0${i+1}</span><span class="anime-mark" aria-hidden="true">${anime.mark}</span><strong>${anime.name}</strong><span class="anime-favorite">FAVORITO</span></div>`).join('');
  $('#musicList').innerHTML=data.songs.map(([song,artist])=>{const query=encodeURIComponent(`${song} ${artist} oficial`);return `<div class="music-row"><span>${song}<small>${artist}</small></span><a href="https://www.youtube.com/results?search_query=${query}" target="_blank" rel="noopener noreferrer" aria-label="Buscar ${song} de ${artist}">OUVIR ↗</a></div>`}).join('');

  const photos=['cansado.jpeg','catequese.jpeg','WhatsApp Image 2026-11-21 at 22.42.15.jpeg','WhatsApp Image 2026-11-21 at 22.42.15 (1).jpeg',...['22.48.33','22.48.34'].flatMap(t=>[`WhatsApp Image 2026-11-21 at ${t}.jpeg`,`WhatsApp Image 2026-11-21 at ${t} (1).jpeg`]),'WhatsApp Image 2026-11-22 at 20.46.26.jpeg',...['27','28','29','30','31','32'].flatMap(n=>{const max=n==='28'?4:3;return Array.from({length:max+1},(_,i)=>`WhatsApp Image 2026-11-22 at 20.46.${n}${i?' ('+i+')':''}.jpeg`)}),'WhatsApp Image 2026-11-22 at 20.46.33.jpeg'];
  const photoCorrections={
    'WhatsApp Image 2026-11-22 at 20.46.26.jpeg':'irmaos-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.29 (2).jpeg':'quintal-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.29 (3).jpeg':'brincadeira-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.30 (1).jpeg':'natal-casa-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.30 (2).jpeg':'arvore-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.30 (3).jpeg':'casa-horizontal.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.31 (1).jpeg':'natal-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.31 (2).jpeg':'skate-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.31.jpeg':'familia-digital.jpg',
    'WhatsApp Image 2026-11-22 at 20.46.32.jpeg':'brinquedos-digital.jpg'
  };
  const photoGrid=$('#photoGrid');
  photos.forEach((name,i)=>{
    const displayName=photoCorrections[name]||name;
    const fig=document.createElement('button');fig.className='gallery-photo';fig.type='button';fig.setAttribute('aria-label',`Ampliar fotografia ${i+1}`);fig.innerHTML=`<img src="assets/fotos/${encodeURIComponent(displayName)}" alt="Registro pessoal ${i+1}" loading="lazy"><span>REGISTRO ${String(i+1).padStart(2,'0')}</span>`;
    fig.addEventListener('click',()=>openModal(`Registro ${String(i+1).padStart(2,'0')}`,`<img class="modal-photo" src="assets/fotos/${encodeURIComponent(displayName)}" alt="Registro pessoal ampliado"><p>Uma lembrança desta jornada.</p>`,'ARQUIVO VISUAL'));
    photoGrid.append(fig);
  });

  $('#openVideo').addEventListener('click',()=>openModal('Para a minha avó','<video class="tribute-video" controls playsinline preload="metadata" src="assets/video/homenagem-avo.mp4">Seu navegador não suporta a reprodução deste vídeo.</video><p>Uma lembrança em movimento, feita com amor.</p>','HOMENAGEM EM VÍDEO'));

  const nav=$('.nav-links'), menu=$('.menu-toggle');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));
  const progress=$('.scroll-progress');function onScroll(){const total=document.documentElement.scrollHeight-innerHeight;progress.style.width=(total>0?scrollY/total*100:0)+'%'}addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Procedural Three.js scene: a gravitational lens, accretion ring and orbiting worlds.
  async function createUniverse(){
    const canvas=$('#universe');if(!canvas)return;
    try{
      const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.toneMapping=THREE.ACESFilmicToneMapping;
      const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x090a12,.012);const camera=new THREE.PerspectiveCamera(42,canvas.clientWidth/canvas.clientHeight,.1,180);camera.position.set(0,3.2,21);
      scene.add(new THREE.AmbientLight(0x8791c5,1.2));const key=new THREE.PointLight(0xffd09a,170,65);key.position.set(-2,2,3);scene.add(key);const blue=new THREE.PointLight(0x708bff,38,55);blue.position.set(8,2,-3);scene.add(blue);
      // Star volume: varied brightness, depth and size create parallax while the camera moves.
      const starGeo=new THREE.BufferGeometry(),coords=[],sizes=[],tints=[];for(let i=0;i<3600;i++){const radius=THREE.MathUtils.randFloat(18,90),theta=Math.random()*Math.PI*2,phi=Math.acos(THREE.MathUtils.randFloatSpread(2));coords.push(radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta));sizes.push(Math.random()*1.15+.22);const c=new THREE.Color().setHSL(THREE.MathUtils.randFloat(.52,.68),THREE.MathUtils.randFloat(.1,.55),THREE.MathUtils.randFloat(.48,1));tints.push(c.r,c.g,c.b)}starGeo.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));starGeo.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));starGeo.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,opacity:.86,sizeAttenuation:true}));scene.add(stars);
      const hole=new THREE.Group();hole.position.set(4.8,.5,-3);scene.add(hole);
      const dark=new THREE.Mesh(new THREE.SphereGeometry(1.5,64,48),new THREE.MeshBasicMaterial({color:0x010106}));hole.add(dark);
      const event=new THREE.Mesh(new THREE.TorusGeometry(1.72,.025,8,96),new THREE.MeshBasicMaterial({color:0xe2c79a,transparent:true,opacity:.8}));event.rotation.x=1.22;hole.add(event);
      for(let j=0;j<5;j++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.02+j*.16,.012+j*.002,6,144),new THREE.MeshBasicMaterial({color:j%2?0x8e82d5:0xe4a576,transparent:true,opacity:.28-j*.03}));ring.rotation.x=1.1+j*.06;ring.rotation.y=.15;hole.add(ring)}
      // Lens glow
      const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(247,187,133,.55)');g.addColorStop(.2,'rgba(198,122,177,.25)');g.addColorStop(1,'rgba(30,36,90,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const tx=new THREE.CanvasTexture(c);return tx})(),transparent:true,depthWrite:false}));glow.scale.set(8,8,1);glow.position.z=-.4;hole.add(glow);
      const earthMap=(()=>{const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#132637';x.fillRect(0,0,512,256);for(let i=0;i<110;i++){const xx=Math.random()*512,yy=Math.random()*256;x.beginPath();x.ellipse(xx,yy,Math.random()*35+5,Math.random()*18+3,Math.random()*3,0,7);x.fillStyle=['#72845b','#b09466','#506f76','#c4a66d'][i%4];x.globalAlpha=.32+Math.random()*.43;x.fill()}x.globalAlpha=1;return new THREE.CanvasTexture(c)})();
      const worldSpecs=[{r:1.05,d:-1.3,size:.74,color:0xc9856f,map:earthMap},{r:3.0,d:-.3,size:.47,color:0x78a5ba},{r:5.0,d:0,size:.92,color:0xe2b77f,ring:true},{r:7.3,d:.3,size:.57,color:0x8a84be}];
      const worlds=worldSpecs.map((w,i)=>{const pivot=new THREE.Group();scene.add(pivot);const mesh=new THREE.Mesh(new THREE.SphereGeometry(w.size,48,36),new THREE.MeshStandardMaterial({color:w.color,map:w.map||null,roughness:.88,metalness:.03}));mesh.position.set(w.r,.15*(i%2?1:-1),w.d);pivot.add(mesh);if(w.ring){const r=new THREE.Mesh(new THREE.RingGeometry(w.size*1.25,w.size*1.8,80),new THREE.MeshStandardMaterial({color:0xc5b093,side:THREE.DoubleSide,transparent:true,opacity:.66,roughness:1}));r.position.copy(mesh.position);r.rotation.set(-.72,.2,.26);pivot.add(r)}const halo=new THREE.PointLight(w.color,1.5,4);halo.position.copy(mesh.position);pivot.add(halo);return{pivot,mesh,speed:.035/(1+i*.22),phase:i*1.5}});
      const nebulae=[];for(let j=0;j<5;j++){const material=new THREE.SpriteMaterial({map:glow.material.map,color:new THREE.Color().setHSL(.62+j*.035,.35,.5),transparent:true,opacity:.09,depthWrite:false});const s=new THREE.Sprite(material);s.position.set(THREE.MathUtils.randFloat(-13,13),THREE.MathUtils.randFloat(-6,6),THREE.MathUtils.randFloat(-14,-6));s.scale.set(THREE.MathUtils.randFloat(5,11),THREE.MathUtils.randFloat(3,8),1);scene.add(s);nebulae.push(s)}
      let pointerX=0,pointerY=0,targetX=0,targetY=0,drag=false,lastX=0,lastY=0;canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();if(drag){targetX+=(e.clientX-lastX)*.003;targetY+=(e.clientY-lastY)*.002;lastX=e.clientX;lastY=e.clientY}pointerX=(e.clientX-rect.left)/rect.width-.5;pointerY=(e.clientY-rect.top)/rect.height-.5});
      let scrollY=0;addEventListener('scroll',()=>{scrollY=window.scrollY},{passive:true});let last=0;
      function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}addEventListener('resize',resize);
      renderer.setAnimationLoop(ms=>{const t=ms*.001;targetX+=(pointerX*.12-targetX)*.012;targetY+=(pointerY*.07-targetY)*.012;camera.position.x+=(targetX-camera.position.x)*.022;camera.position.y+=(3.2-targetY-camera.position.y)*.018;camera.position.z=21+Math.min(scrollY/900,5);camera.lookAt(0,0,-1);stars.rotation.y=t*.003;stars.rotation.x=Math.sin(t*.08)*.02;hole.rotation.z=t*.08;hole.children.slice(1,6).forEach((r,i)=>r.rotation.z=-t*(.06+i*.008));worlds.forEach((w,i)=>{w.pivot.rotation.y=t*w.speed+w.phase;w.mesh.rotation.y=t*.12;});nebulae.forEach((n,i)=>n.material.opacity=.07+Math.sin(t*.35+i)*.025);renderer.render(scene,camera)});
    }catch(error){
      canvas.classList.add('three-unavailable');
      // Local file preview fallback: a lightweight animated sky while external WebGL modules are unavailable.
      const ctx=canvas.getContext('2d'), stars=Array.from({length:360},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.2,a:Math.random()*.7+.2,z:Math.random()*2+0.4}));let t=0,mx=.5,my=.5;
      canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height});
      function drawFallback(){const w=canvas.width=canvas.clientWidth*(devicePixelRatio||1),h=canvas.height=canvas.clientHeight*(devicePixelRatio||1);ctx.clearRect(0,0,w,h);ctx.fillStyle='#090a12';ctx.fillRect(0,0,w,h);for(const s of stars){const x=((s.x+(mx-.5)*.025*s.z+t*.000001*s.z)%1)*w,y=((s.y+(my-.5)*.018*s.z)%1)*h;ctx.globalAlpha=s.a*(.72+.28*Math.sin(t*.001+s.x*20));ctx.fillStyle=s.z>1.7?'#efd6ae':'#b7cae2';ctx.beginPath();ctx.arc(x,y,s.r*(devicePixelRatio||1),0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
        const scale=devicePixelRatio||1,cx=w*.76,cy=h*.48,r=Math.min(w,h)*.1;const halo=ctx.createRadialGradient(cx,cy,r*.4,cx,cy,r*2.9);halo.addColorStop(0,'#090a12');halo.addColorStop(.25,'#11111d');halo.addColorStop(.43,'#d7a17055');halo.addColorStop(.56,'#8b6dc455');halo.addColorStop(1,'transparent');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*2.9,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.00012);ctx.strokeStyle='#e2b78288';ctx.lineWidth=1.2*scale;ctx.beginPath();ctx.ellipse(0,0,r*1.9,r*.44,.12,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#a49ad655';ctx.beginPath();ctx.ellipse(0,0,r*2.2,r*.7,-.16,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.fillStyle='#010106';ctx.beginPath();ctx.arc(cx,cy,r*.62,0,Math.PI*2);ctx.fill();
        [[.53,.28,12,'#74a5ba'],[.64,.68,17,'#c79a72'],[.89,.27,9,'#9282c3']].forEach(([x,y,sz,col],i)=>{const px=(x+Math.sin(t*.0003+i)*.018)*w,py=(y+Math.cos(t*.0004+i)*.025)*h,pr=sz*scale;const g=ctx.createRadialGradient(px-pr*.35,py-pr*.35,pr*.05,px,py,pr);g.addColorStop(0,'#f0d8b7');g.addColorStop(.38,col);g.addColorStop(1,'#090a12');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill()});t++;requestAnimationFrame(drawFallback)}drawFallback();
      console.info('Cena em modo local animado; a versão WebGL será ativada quando houver servidor web e acesso à CDN.',error)
    }
  }
  createUniverse();

  // Optional ambient synth: enabled only after the visitor explicitly presses the sound button.
  let audio=null, master=null, soundOn=false;
  function startSound(){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audio ||= new Ctx();audio.resume();if(master)return;master=audio.createGain();master.gain.value=.022;master.connect(audio.destination);[55,82.4,110,164.8].forEach((f,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),filter=audio.createBiquadFilter();osc.type=i===1?'triangle':'sine';osc.frequency.value=f;gain.gain.value=i===0?.5:.13;filter.type='lowpass';filter.frequency.value=500;osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start()});const lfo=audio.createOscillator(),lfoGain=audio.createGain();lfo.frequency.value=.11;lfoGain.gain.value=5;lfo.connect(lfoGain);lfoGain.connect(master.gain);lfo.start()}
  const soundButton=$('.sound-toggle'),dock=$('#audioDock');soundButton.addEventListener('click',()=>{soundOn=!soundOn;if(soundOn){startSound();dock.classList.add('visible','active')}else{if(master)master.gain.setTargetAtTime(.0001,audio.currentTime,.2);dock.classList.remove('active')}soundButton.setAttribute('aria-pressed',String(soundOn));$('.sound-label',soundButton).textContent=soundOn?'SOM LIGADO':'SOM DESLIGADO'});$('#muteAudio').addEventListener('click',()=>{soundOn=false;if(master)master.gain.setTargetAtTime(.0001,audio.currentTime,.2);dock.classList.remove('active');soundButton.setAttribute('aria-pressed','false');$('.sound-label',soundButton).textContent='SOM DESLIGADO'});
})();
