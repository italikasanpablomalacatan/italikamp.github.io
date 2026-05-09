const imageExtensions = ["webp", "jpg", "jpeg", "png", "gif", "avif", "svg"];
const AGENCIES = {
  malacatan: { name: "Malacatán", phone: "50236500543" },
  sanpablo: { name: "San Pablo", phone: "50259173974" }
};

const grid = document.querySelector("#catalogGrid");
const filters = document.querySelector("#categoryFilters");
const mobileFilters = document.querySelector("#mobileFilters");
const allCount = document.querySelector("#allCount");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");

const agencyModal = document.querySelector("#agencyModal");
const productModal = document.querySelector("#productModal");
const aboutModal = document.querySelector("#aboutModal");
const openContact = document.querySelector("#openContact");
const openAbout = document.querySelector("#openAbout");
const closeAgency = document.querySelector("#closeAgency");
const closeProduct = document.querySelector("#closeProduct");
const closeAbout = document.querySelector("#closeAbout");
const agencyText = document.querySelector("#agencyText");

let activeCategory = "Todas";
let selectedProduct = null;

const money = (value) => `Q${Number(value).toLocaleString("es-GT")}`;
const productList = () => CATEGORIES.flatMap(category => category.products.map(product => ({ ...product, category: category.name })));

function setImageFallback(img, base, index = 0){
  if(index >= imageExtensions.length){
    img.remove();
    return;
  }
  img.src = `assets/img/motos/${base}.${imageExtensions[index]}`;
  img.onerror = () => setImageFallback(img, base, index + 1);
}

function makeImage(base, alt){
  const img = document.createElement("img");
  img.alt = alt;
  img.loading = "lazy";
  setImageFallback(img, base);
  return img;
}

function messageFor(product, agencyName){
  if(!product){
    return `Hola, deseo comunicarme con la agencia ${agencyName}.`;
  }
  return `Hola, vengo del catálogo web. Me interesa la moto ${product.shortName} (${product.model}) con precio de contado ${money(product.cash)}. Deseo más información en agencia ${agencyName}.`;
}

function openWhatsApp(agencyKey){
  const agency = AGENCIES[agencyKey];
  const text = encodeURIComponent(messageFor(selectedProduct, agency.name));
  window.open(`https://wa.me/${agency.phone}?text=${text}`, "_blank", "noopener");
}

function showModal(modal){ modal.classList.add("show"); modal.setAttribute("aria-hidden", "false"); }
function hideModal(modal){ modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); }

function openAgency(product = null){
  selectedProduct = product;
  agencyText.textContent = product
    ? `Selecciona la agencia para consultar por ${product.shortName}. El mensaje irá listo para enviar.`
    : "Selecciona una agencia y te enviaremos directo a WhatsApp.";
  showModal(agencyModal);
}

function openProduct(product){
  selectedProduct = product;
  const detailImage = document.querySelector("#detailImage");
  detailImage.innerHTML = "";
  detailImage.appendChild(makeImage(product.imageBase, product.model));
  const fallback = document.createElement("div");
  fallback.className = "placeholder";
  fallback.textContent = product.shortName;
  detailImage.appendChild(fallback);

  document.querySelector("#detailCategory").textContent = product.category;
  document.querySelector("#detailName").textContent = product.shortName;
  document.querySelector("#detailModel").textContent = product.model;
  document.querySelector("#detailPrice").textContent = money(product.cash);
  document.querySelector("#detailSku").textContent = `SKU: ${product.sku}`;
  document.querySelector("#detailCode").textContent = `Código: ${product.code}`;
  showModal(productModal);
}

function createCard(product, index){
  const card = document.createElement("article");
  card.className = "card glass";
  card.style.animationDelay = `${Math.min(index * 0.035, 0.55)}s`;
  card.tabIndex = 0;
  card.innerHTML = `
    <div class="image-wrap">
      <span class="category-pill">${product.category}</span>
      <div class="placeholder">${product.shortName}</div>
    </div>
    <div class="card-body">
      <h3>${product.shortName}</h3>
      <p class="model">${product.model}</p>
      <div class="cash-price">${money(product.cash)}</div>
      <button class="interest-btn" type="button">Me interesa esto</button>
    </div>
  `;
  card.querySelector(".image-wrap").prepend(makeImage(product.imageBase, product.model));

  card.addEventListener("click", () => openProduct(product));
  card.addEventListener("keydown", (event) => { if(event.key === "Enter") openProduct(product); });
  card.querySelector(".interest-btn").addEventListener("click", (event) => {
    event.stopPropagation();
    openAgency(product);
  });
  return card;
}

function renderFilters(){
  const total = productList().length;
  allCount.textContent = total;
  const names = CATEGORIES.map(c => c.name);
  const html = names.map(name => {
    const count = CATEGORIES.find(c => c.name === name).products.length;
    return `<button class="filter ${name === activeCategory ? "active" : ""}" data-category="${name}" type="button"><span>🏍</span><b>${name}</b><em>${count}</em></button>`;
  }).join("");
  filters.innerHTML = html;
  mobileFilters.innerHTML = `<button class="filter ${activeCategory === "Todas" ? "active" : ""}" data-category="Todas" type="button"><span>▦</span><b>Todas</b><em>${total}</em></button>` + html;
  document.querySelector(".sidebar > .filter").classList.toggle("active", activeCategory === "Todas");
}

function getFilteredProducts(){
  const query = searchInput.value.trim().toLowerCase();
  let items = productList().filter(product => {
    const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
    const searchable = `${product.category} ${product.model} ${product.shortName} ${product.sku} ${product.code}`.toLowerCase();
    return matchesCategory && searchable.includes(query);
  });
  if(sortSelect.value === "price-asc") items.sort((a,b) => a.cash - b.cash);
  if(sortSelect.value === "price-desc") items.sort((a,b) => b.cash - a.cash);
  if(sortSelect.value === "name-asc") items.sort((a,b) => a.shortName.localeCompare(b.shortName, "es"));
  return items;
}

function renderCatalog(){
  const items = getFilteredProducts();
  grid.innerHTML = "";
  if(!items.length){
    grid.innerHTML = `<div class="empty glass">No se encontraron motos con esa búsqueda.</div>`;
    return;
  }
  items.forEach((product, index) => grid.appendChild(createCard(product, index)));
}

function selectCategory(category){
  activeCategory = category;
  renderFilters();
  renderCatalog();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".filter");
  if(button) selectCategory(button.dataset.category);
});

searchInput.addEventListener("input", renderCatalog);
sortSelect.addEventListener("change", renderCatalog);
openContact.addEventListener("click", () => openAgency(null));
openAbout.addEventListener("click", () => showModal(aboutModal));
closeAgency.addEventListener("click", () => hideModal(agencyModal));
closeProduct.addEventListener("click", () => hideModal(productModal));
closeAbout.addEventListener("click", () => hideModal(aboutModal));
document.querySelector("#detailInterest").addEventListener("click", () => {
  hideModal(productModal);
  openAgency(selectedProduct);
});
document.querySelectorAll(".agency").forEach(button => {
  button.addEventListener("click", () => openWhatsApp(button.dataset.agency));
});
[agencyModal, productModal, aboutModal].forEach(modal => modal.addEventListener("click", event => { if(event.target === modal) hideModal(modal); }));
document.addEventListener("keydown", event => { if(event.key === "Escape"){ hideModal(agencyModal); hideModal(productModal); hideModal(aboutModal); } });

renderFilters();
renderCatalog();
