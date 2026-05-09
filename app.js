const grid = document.getElementById("grid");
const categoriesBox = document.getElementById("categories");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const motoModal = document.getElementById("motoModal");
const agencyModal = document.getElementById("agencyModal");

let activeCategory = "Todas";
let selectedMoto = null;

function money(value){
  return "Q" + Number(value).toLocaleString("en-US");
}

function imagePaths(name){
  const raw = String(name || "").trim();
  const variants = [...new Set([
    raw,
    raw.toLowerCase(),
    raw.toUpperCase()
  ])];

  const exts = ["png","jpg","jpeg","webp","PNG","JPG","JPEG","WEBP"];
  const paths = [];

  variants.forEach(v => {
    exts.forEach(ext => {
      paths.push(`assets/img/motos/${v}.${ext}`);
    });
  });

  return paths;
}

function setImage(img, baseName, altText){
  const paths = imagePaths(baseName);
  let index = 0;

  img.alt = altText || baseName;

  img.onerror = function(){
    index++;
    if(index < paths.length){
      img.src = paths[index];
    }else{
      img.onerror = null;
      const parent = img.parentElement;
      img.remove();

      if(parent && !parent.querySelector(".no-img")){
        const fallback = document.createElement("div");
        fallback.className = "no-img";
        fallback.textContent = altText || baseName;
        parent.appendChild(fallback);
      }
    }
  };

  img.src = paths[0];
}

function buildCategories(){
  const counts = { Todas: motos.length };

  motos.forEach(moto => {
    counts[moto.categoria] = (counts[moto.categoria] || 0) + 1;
  });

  categoriesBox.innerHTML = Object.entries(counts).map(([cat, count]) => `
    <button class="cat-btn ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">
      <span>${cat}</span>
      <span class="count">${count}</span>
    </button>
  `).join("");

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      buildCategories();
      render();
    });
  });
}

function getFilteredMotos(){
  const query = searchInput.value.trim().toLowerCase();

  let list = motos.filter(moto => {
    const matchCategory = activeCategory === "Todas" || moto.categoria === activeCategory;
    const text = `${moto.nombre} ${moto.detalle} ${moto.categoria} ${moto.sku} ${moto.codigo}`.toLowerCase();

    return matchCategory && text.includes(query);
  });

  if(sortSelect.value === "priceAsc"){
    list.sort((a,b) => a.precio - b.precio);
  }

  if(sortSelect.value === "priceDesc"){
    list.sort((a,b) => b.precio - a.precio);
  }

  if(sortSelect.value === "nameAsc"){
    list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  }

  return list;
}

function render(){
  const list = getFilteredMotos();

  grid.innerHTML = "";

  list.forEach((moto, i) => {
    const card = document.createElement("article");
    card.className = "card glass";
    card.style.animationDelay = `${Math.min(i * 35, 350)}ms`;

    card.innerHTML = `
      <span class="tag">${moto.categoria}</span>

      <div class="img-wrap">
        <img alt="${moto.nombre}">
      </div>

      <h3>${moto.nombre}</h3>
      <p class="detail">${moto.detalle}</p>
      <div class="price">${money(moto.precio)}</div>

      <button class="interest">Me interesa esto</button>
    `;

    setImage(card.querySelector("img"), moto.img, moto.nombre);

    card.addEventListener("click", () => openMoto(moto));

    card.querySelector(".interest").addEventListener("click", event => {
      event.stopPropagation();
      selectedMoto = moto;
      openAgency();
    });

    grid.appendChild(card);
  });
}

function openMoto(moto){
  selectedMoto = moto;

  document.getElementById("modalCat").textContent = moto.categoria;
  document.getElementById("modalName").textContent = moto.nombre;
  document.getElementById("modalDetail").textContent = moto.detalle;
  document.getElementById("modalPrice").textContent = money(moto.precio);
  document.getElementById("modalSku").textContent = moto.sku;
  document.getElementById("modalCode").textContent = moto.codigo;

  const img = document.getElementById("modalImg");
  const parent = img.parentElement;

  parent.querySelectorAll(".no-img").forEach(el => el.remove());

  if(!parent.contains(img)){
    parent.appendChild(img);
  }

  setImage(img, moto.img, moto.nombre);

  motoModal.classList.add("show");
}

function closeAll(){
  motoModal.classList.remove("show");
  agencyModal.classList.remove("show");
}

function openAgency(){
  document.getElementById("agencyText").textContent = selectedMoto
    ? `Consulta por ${selectedMoto.nombre} - ${selectedMoto.detalle}`
    : "Te enviaremos a WhatsApp.";

  agencyModal.classList.add("show");
}

function goWhatsApp(key){
  const agencia = agencias[key];

  const message = selectedMoto
    ? `Hola, estoy interesado en la moto ${selectedMoto.nombre} (${selectedMoto.detalle}) con precio de contado ${money(selectedMoto.precio)}. Quiero comunicarme con agencia ${agencia.nombre}.`
    : `Hola, quiero información del catálogo de motocicletas. Quiero comunicarme con agencia ${agencia.nombre}.`;

  const url = `https://wa.me/${agencia.telefono}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

document.querySelectorAll("[data-close], [data-close-agency]").forEach(el => {
  el.addEventListener("click", closeAll);
});

document.getElementById("modalInterest").addEventListener("click", openAgency);
document.getElementById("floatingBtn").addEventListener("click", () => {
  selectedMoto = null;
  openAgency();
});

document.querySelectorAll(".agency").forEach(btn => {
  btn.addEventListener("click", () => goWhatsApp(btn.dataset.agency));
});

document.getElementById("aboutBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

document.addEventListener("keydown", e => {
  if(e.key === "Escape") closeAll();
});

buildCategories();
render();
