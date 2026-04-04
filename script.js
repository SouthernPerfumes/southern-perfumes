// ═══════════════════════════════════════════════
//  عطور الجنوب — Southern Perfumes
//  script.js  |  All website logic
// ═══════════════════════════════════════════════

// ── CONFIG ──
const WHATSAPP_NUMBER = "201141910181";
const FACEBOOK_URL    = "https://www.facebook.com/people/%D8%B9%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%AC%D9%86%D9%88%D8%A8/100094129415952/";
const WA_BASE         = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

const LOAD_STEP = 15;
let visibleCount = 15;

// ── STATE ──
let allProducts    = [];
let activeCategory = "الكل";
let searchQuery    = "";

// ══════════════════════════════════════════════
//  LOAD PRODUCTS
// ══════════════════════════════════════════════
fetch("products.json")
  .then(res => {
    if (!res.ok) throw new Error("Could not load products.json");
    return res.json();
  })
  .then(data => {
    allProducts = data;
    buildCategoryButtons(data);
    renderProducts(data, true);
  })
  .catch(err => {
    console.error("Error loading products:", err);
    document.getElementById("productsGrid").innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>تعذّر تحميل المنتجات</p>
      </div>`;
  });

// ══════════════════════════════════════════════
//  CATEGORY BUTTONS
// ══════════════════════════════════════════════
function buildCategoryButtons(products) {
  const bar = document.getElementById("categoriesBar");
  const uniqueCategories = ["الكل", ...new Set(products.map(p => p.category))];

  bar.innerHTML = uniqueCategories.map((cat, i) => `
    <button class="cat-btn ${i === 0 ? "active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");

  bar.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      bar.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeCategory = this.dataset.cat;
      applyFilters();
    });
  });
}

// ══════════════════════════════════════════════
//  FILTER
// ══════════════════════════════════════════════
function applyFilters() {
  let filtered = allProducts;

  if (activeCategory !== "الكل") {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand    || "").toLowerCase().includes(q) ||
      (p.desc     || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  renderProducts(filtered, true);
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function availableSizes(p) {
  return [
    { key: "price_30",  label: "30 مل"  },
    { key: "price_50",  label: "50 مل"  },
    { key: "price_100", label: "100 مل" },
  ].filter(s => p[s.key]);
}

function buildWaLink(productName, sizeLabel, price) {
  const text = `السلام عليكم، أريد الاستفسار عن: ${productName}\nالحجم: ${sizeLabel}\nالسعر: ${price}`;
  return WA_BASE + encodeURIComponent(text);
}

// ══════════════════════════════════════════════
//  SIZE SELECTOR — injected CSS (once)
// ══════════════════════════════════════════════
(function injectSizeStyles() {
  if (document.getElementById("size-selector-styles")) return;
  const style = document.createElement("style");
  style.id = "size-selector-styles";
  style.textContent = `
    .size-selector {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin: 12px 0 4px;
      direction: rtl;
    }
    .size-btn {
      flex: 1;
      padding: 6px 0;
      background: transparent;
      border: 1.5px solid #3a3a3a;
      border-radius: 20px;
      color: #888;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .size-btn:hover {
      border-color: #888;
      color: #ccc;
    }
    .size-btn.active {
      background: linear-gradient(135deg, #b8860b, #d4a017);
      border-color: transparent;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(180,130,10,0.35);
    }
    .card-price-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      min-width: 90px;
    }
    .card-price-amount {
      font-size: 15px;
      font-weight: 700;
      color: #d4a017;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .card-price-size-label {
      font-size: 10px;
      color: #666;
      letter-spacing: 0.3px;
    }
    .price-unavailable {
      font-size: 13px;
      color: #555;
      font-style: italic;
    }
  `;
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════
//  BUILD CARD HTML
// ══════════════════════════════════════════════
function buildCardHTML(p, i) {
  const VISUAL_HEIGHT = "220px";
  const sizes         = availableSizes(p);
  const defaultSize   = sizes.find(s => s.key === "price_50") || sizes[0];
  const defaultPrice  = defaultSize ? p[defaultSize.key] : null;
  const defaultLabel  = defaultSize ? defaultSize.label  : "";
  const defaultWa     = defaultPrice
    ? buildWaLink(p.name, defaultLabel, defaultPrice)
    : WA_BASE + encodeURIComponent(`السلام عليكم، أريد الاستفسار عن: ${p.name}`);

  const visual = p.image
    ? `<div class="img-placeholder"
             style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a 25%,#2a2a2a 100%);border-radius:inherit;"></div>
       <img data-src="${p.image}" alt="${p.name}" class="card-img lazy-img"
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;padding:10px;box-sizing:border-box;opacity:0;transition:opacity 0.4s ease;"/>
       <div class="card-emoji-fallback"
            style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:3rem;">
         ${p.emoji || "🧴"}
       </div>`
    : `<div class="card-emoji-fallback"
            style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;">
         ${p.emoji || "🧴"}
       </div>`;

  const selectorHTML = sizes.length > 1
    ? `<div class="size-selector" data-product-id="${p.id}">
        ${sizes.map(s => `
          <button class="size-btn ${s.key === (defaultSize ? defaultSize.key : "") ? "active" : ""}"
                  data-size-key="${s.key}"
                  data-size-label="${s.label}"
                  data-price="${p[s.key]}"
                  data-product-name="${p.name}">
            ${s.label}
          </button>`).join("")}
       </div>`
    : "";

  const priceHTML = `
    <div class="card-price-display">
      ${defaultPrice
        ? `<span class="card-price-amount" id="price-amount-${p.id}">${defaultPrice}</span>
           <span class="card-price-size-label" id="price-label-${p.id}">${sizes.length > 1 ? defaultLabel : ""}</span>`
        : `<span class="price-unavailable">السعر عند الطلب</span>`}
    </div>`;

  return `
    <div class="product-card" style="animation-delay:${i * 0.06}s" data-product-id="${p.id}">
      <div class="card-topline"></div>
      <div class="card-visual"
           style="position:relative;width:100%;height:${VISUAL_HEIGHT};overflow:hidden;background:#111;border-radius:10px 10px 0 0;">
        ${visual}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        ${p.brand ? `<div class="card-brand">${p.brand}</div>` : ""}
        ${p.desc  ? `<div class="card-desc">${p.desc}</div>`   : ""}
        ${selectorHTML}
        <div class="card-footer">
          <a class="card-wa" id="wa-link-${p.id}" href="${defaultWa}" target="_blank">استفسر</a>
          ${priceHTML}
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function renderProducts(products, reset = false) {
  const grid    = document.getElementById("productsGrid");
  const countEl = document.getElementById("resultCount");

  if (reset) visibleCount = 15;

  countEl.textContent = products.length > 0 ? `${products.length} عطر` : "";

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <p>لا توجد نتائج. جرّب البحث بكلمة مختلفة.</p>
      </div>`;
    renderLoadMore([]);
    return;
  }

  grid.innerHTML = products.slice(0, visibleCount).map((p, i) => buildCardHTML(p, i)).join("");

  initSizeSelectors();
  initLazyLoading();
  renderLoadMore(products);
}

// ══════════════════════════════════════════════
//  SIZE SELECTOR — click handler
// ══════════════════════════════════════════════
function initSizeSelectors() {
  document.querySelectorAll(".size-selector").forEach(selector => {
    selector.addEventListener("click", function (e) {
      const btn = e.target.closest(".size-btn");
      if (!btn) return;

      const productId = this.dataset.productId;
      const sizeLabel = btn.dataset.sizeLabel;
      const price     = btn.dataset.price;
      const name      = btn.dataset.productName;

      // toggle active
      this.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // update price with a quick fade
      const amountEl = document.getElementById(`price-amount-${productId}`);
      const labelEl  = document.getElementById(`price-label-${productId}`);
      if (amountEl) {
        amountEl.style.opacity = "0";
        setTimeout(() => { amountEl.textContent = price; amountEl.style.opacity = "1"; }, 150);
      }
      if (labelEl) labelEl.textContent = sizeLabel;

      // update WhatsApp link
      const waLink = document.getElementById(`wa-link-${productId}`);
      if (waLink) waLink.href = buildWaLink(name, sizeLabel, price);
    });
  });
}

// ══════════════════════════════════════════════
//  LOAD MORE BUTTON
// ══════════════════════════════════════════════
function renderLoadMore(products) {
  let btn = document.getElementById("loadMoreBtn");
  const grid = document.getElementById("productsGrid");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "loadMoreBtn";
    btn.textContent = "تحميل المزيد";
    btn.style.cssText = `
      display:block;margin:40px auto;padding:12px 40px;
      background-color:#222;color:#fff;border:none;border-radius:30px;
      font-size:16px;font-weight:600;font-family:inherit;cursor:pointer;
      box-shadow:0 4px 10px rgba(0,0,0,0.15);transition:all 0.3s ease;
    `;
    btn.onmouseover = () => { btn.style.backgroundColor="#444"; btn.style.transform="translateY(-3px)"; btn.style.boxShadow="0 6px 15px rgba(0,0,0,0.2)"; };
    btn.onmouseout  = () => { btn.style.backgroundColor="#222"; btn.style.transform="translateY(0)"; btn.style.boxShadow="0 4px 10px rgba(0,0,0,0.15)"; };
    grid.insertAdjacentElement("afterend", btn);
  }

  if (visibleCount >= products.length || products.length === 0) { btn.style.display="none"; return; }

  btn.style.display = "block";
  btn.onclick = () => { visibleCount += LOAD_STEP; renderProducts(products, false); };
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
document.getElementById("searchInput").addEventListener("input", function () {
  searchQuery = this.value.trim();
  applyFilters();
});

// ══════════════════════════════════════════════
//  SOCIAL LINKS
// ══════════════════════════════════════════════
function setSocialLinks() {
  const waDefault = WA_BASE + encodeURIComponent("السلام عليكم");
  document.querySelectorAll(".js-wa-link").forEach(el => el.href = waDefault);
  document.querySelectorAll(".js-fb-link").forEach(el => el.href = FACEBOOK_URL);
}
setSocialLinks();

// ══════════════════════════════════════════════
//  LAZY LOADING IMAGES
// ══════════════════════════════════════════════
function initLazyLoading() {
  const images = document.querySelectorAll(".lazy-img");

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.getAttribute("data-src");
      if (src) {
        img.src = src;
        img.onload = () => {
          img.style.opacity = "1";
          const ph = img.parentElement.querySelector(".img-placeholder");
          if (ph) ph.remove();
        };
        img.onerror = () => {
          const fb = img.parentElement.querySelector(".card-emoji-fallback");
          if (fb) fb.style.display = "flex";
          const ph = img.parentElement.querySelector(".img-placeholder");
          if (ph) ph.remove();
          img.remove();
        };
      }
      obs.unobserve(img);
    });
  }, { rootMargin: "100px" });

  images.forEach(img => observer.observe(img));
}
