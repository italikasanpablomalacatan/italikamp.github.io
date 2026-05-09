const imageExtensions = ["webp", "jpg", "jpeg", "png", "gif", "avif", "svg"];
const grid = document.querySelector("#catalogGrid");
const filters = document.querySelector("#categoryFilters");
const searchInput = document.querySelector("#searchInput");
const modal = document.querySelector("#contactModal");
const openContact = document.querySelector("#openContact");
const openContactTop = document.querySelector("#openContactTop");
const closeContact = document.querySelector("#closeContact");

let activeCategory = "Todas";

const money = (value) => `Q ${Number(value).toLocaleString("es-GT")}`;

function productList(){
  return CATEGORIES.flatMap(category => category.products.map(product => ({...product, category: category.name})));
}

function setImageFallback(img, base, index = 0){
  if(index >= imageExtensions.length){
    img.remove();
    return;
  }
  img.src = `assets/img/${base}.${imageExtensions[index]}`;
  img.onerror = () => setImageFallback(img, base, index + 1);
}

function createCard(product, index){
  const card = document.createElement("article");
  card.className = "card glass";
  card.style.animationDelay = `${Math.min(index * 0.045, 0.55)}s`;

  card.innerHTML = `
    <div class="image-wrap">
      <span class="category-pill">${product.category}</span>
      <div class="placeholder">${product.shortName}</div>
    </div>
    <div class="card-body">
      <h3>${product.shortName}</h3>
      <p class="model">${product.model}</p>
      <div class="meta">
        <span>SKU: ${product.sku}</span>
        <span>Cód: ${product.code}</span>
      </div>
      <div class="prices">
        <div class="price"><span>Contado</span><strong>${money(product.cash)}</strong></div>
        <div class="price"><span>Crédito</span><strong>${money(product.credit)}</strong></div>
      </div>
    </div>
  `;

  const img = document.createElement("img");
  img.alt = product.model;
  img.loading = "lazy";
  setImageFallback(img, product.imageBase);
  card.querySelector(".image-wrap").prepend(img);
  return card;
}

function renderFilters(){
  const names = ["Todas", ...CATEGORIES.map(c => c.name)];
  filters.innerHTML = names.map(name => `<button class="filter ${name === activeCategory ? "active" : ""}" data-category="${name}">${name}</button>`).join("");
}

function renderCatalog(){
  const query = searchInput.value.trim().toLowerCase();
  const items = productList().filter(product => {
    const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
    const searchable = `${product.category} ${product.model} ${product.shortName} ${product.sku} ${product.code}`.toLowerCase();
    return matchesCategory && searchable.includes(query);
  });

  grid.innerHTML = "";
  if(!items.length){
    grid.innerHTML = `<div class="glass" style="grid-column:1/-1;border-radius:24px;padding:28px;text-align:center;color:rgba(255,255,255,.75)">No se encontraron motos con esa búsqueda.</div>`;
    return;
  }
  items.forEach((product, index) => grid.appendChild(createCard(product, index)));
}

filters.addEventListener("click", event => {
  const button = event.target.closest(".filter");
  if(!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderCatalog();
});

searchInput.addEventListener("input", renderCatalog);

function showModal(){ modal.classList.add("show"); modal.setAttribute("aria-hidden", "false"); }
function hideModal(){ modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }

openContact.addEventListener("click", showModal);
openContactTop.addEventListener("click", showModal);
closeContact.addEventListener("click", hideModal);
modal.addEventListener("click", event => { if(event.target === modal) hideModal(); });
document.addEventListener("keydown", event => { if(event.key === "Escape") hideModal(); });

renderFilters();
renderCatalog();
