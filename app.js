
const grid = document.getElementById('motoGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryList = document.getElementById('categoryList');

const motoModal = document.getElementById('motoModal');
const agencyModal = document.getElementById('agencyModal');

let currentCategory = 'Todas';
let selectedMoto = null;

const formatQ = n => 'Q' + Number(n).toLocaleString('en-US');

function imgCandidates(base){
  const clean = String(base || '').trim();
  const lower = clean.toLowerCase();
  const upper = clean.toUpperCase();
  const variants = [...new Set([clean, lower, upper])];
  const exts = ['png','jpg','jpeg','webp','PNG','JPG','JPEG','WEBP'];
  const paths = [];
  variants.forEach(v => exts.forEach(ext => paths.push(`assets/img/motos/${v}.${ext}`)));
  return paths;
}

function setSmartImage(img, base, alt){
  const candidates = imgCandidates(base);
  let i = 0;
  img.alt = alt || base;
  img.onerror = () => {
    i++;
    if(i < candidates.length){
      img.src = candidates[i];
    } else {
      img.onerror = null;
      const parent = img.parentElement;
      img.remove();
      if(parent && !parent.querySelector('.noImg')){
        const ph = document.createElement('div');
        ph.className = 'noImg';
        ph.textContent = alt || base;
        parent.appendChild(ph);
      }
    }
  };
  img.src = candidates[0];
}

function categories(){
  const counts = { Todas: motos.length };
  motos.forEach(m => counts[m.categoria] = (counts[m.categoria] || 0) + 1);
  categoryList.innerHTML = Object.entries(counts).map(([cat,count]) => `
    <button class="catBtn ${cat===currentCategory?'active':''}" data-cat="${cat}">
      <span>${cat}</span><span class="count">${count}</span>
    </button>
  `).join('');
  categoryList.querySelectorAll('.catBtn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      currentCategory = btn.dataset.cat;
      categories();
      render();
    });
  });
}

function filtered(){
  const q = searchInput.value.trim().toLowerCase();
  let list = motos.filter(m => {
    const inCat = currentCategory === 'Todas' || m.categoria === currentCategory;
    const text = `${m.nombre} ${m.detalle} ${m.categoria} ${m.sku} ${m.codigo}`.toLowerCase();
    return inCat && text.includes(q);
  });
  if(sortSelect.value === 'priceAsc') list.sort((a,b)=>a.precio-b.precio);
  if(sortSelect.value === 'priceDesc') list.sort((a,b)=>b.precio-a.precio);
  if(sortSelect.value === 'nameAsc') list.sort((a,b)=>a.nombre.localeCompare(b.nombre));
  return list;
}

function render(){
  const list = filtered();
  grid.innerHTML = '';
  list.forEach((m, idx)=>{
    const card = document.createElement('article');
    card.className = 'card glass';
    card.style.animationDelay = `${Math.min(idx*35, 350)}ms`;
    card.innerHTML = `
      <span class="tag">${m.categoria}</span>
      <div class="imgWrap"><img></div>
      <h3>${m.nombre}</h3>
      <p class="detail">${m.detalle}</p>
      <div class="price">${formatQ(m.precio)}</div>
      <button class="interestBtn">Me interesa esto</button>
    `;
    setSmartImage(card.querySelector('img'), m.img, m.nombre);
    card.addEventListener('click',()=>openMoto(m));
    card.querySelector('.interestBtn').addEventListener('click',(e)=>{
      e.stopPropagation();
      selectedMoto = m;
      openAgency();
    });
    grid.appendChild(card);
  });
}

function openMoto(m){
  selectedMoto = m;
  document.getElementById('modalCategory').textContent = m.categoria;
  document.getElementById('modalName').textContent = m.nombre;
  document.getElementById('modalDetail').textContent = m.detalle;
  document.getElementById('modalPrice').textContent = formatQ(m.precio);
  document.getElementById('modalSku').textContent = m.sku;
  document.getElementById('modalCode').textContent = m.codigo;

  const img = document.getElementById('modalImg');
  const wrap = img.parentElement;
  wrap.querySelectorAll('.noImg').forEach(x=>x.remove());
  if(!wrap.contains(img)) wrap.appendChild(img);
  setSmartImage(img, m.img, m.nombre);

  motoModal.classList.add('show');
  motoModal.setAttribute('aria-hidden','false');
}

function closeModals(){
  motoModal.classList.remove('show');
  agencyModal.classList.remove('show');
  motoModal.setAttribute('aria-hidden','true');
  agencyModal.setAttribute('aria-hidden','true');
}

function openAgency(){
  document.getElementById('agencyMotoText').textContent = selectedMoto
    ? `Consulta por ${selectedMoto.nombre} - ${selectedMoto.detalle}`
    : 'Te redirigiremos a WhatsApp.';
  agencyModal.classList.add('show');
  agencyModal.setAttribute('aria-hidden','false');
}

function goWhatsapp(key){
  const ag = agencias[key];
  const msg = selectedMoto
    ? `Hola, estoy interesado en la moto ${selectedMoto.nombre} (${selectedMoto.detalle}) con precio de contado ${formatQ(selectedMoto.precio)}. Quiero comunicarme con la agencia ${ag.nombre}.`
    : `Hola, quiero más información del catálogo de motocicletas. Deseo comunicarme con la agencia ${ag.nombre}.`;
  window.open(`https://wa.me/${ag.telefono}?text=${encodeURIComponent(msg)}`,'_blank');
}

document.querySelectorAll('[data-close], [data-close-agency]').forEach(el=>el.addEventListener('click',closeModals));
document.getElementById('modalInterest').addEventListener('click',openAgency);
document.getElementById('floatingContact').addEventListener('click',()=>{ selectedMoto=null; openAgency(); });
document.querySelectorAll('.agencyBtn').forEach(btn=>btn.addEventListener('click',()=>goWhatsapp(btn.dataset.agency)));
searchInput.addEventListener('input',render);
sortSelect.addEventListener('change',render);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModals(); });

categories();
render();
