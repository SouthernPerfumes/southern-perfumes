// ═══════════════════════════════════════════════
//  عطور الجنوب — Southern Perfumes
//  script.js  |  All website logic
// ═══════════════════════════════════════════════

// ── CONFIG ──
const WHATSAPP_NUMBER = "201141910181";
const FACEBOOK_URL    = "https://www.facebook.com/people/%D8%B9%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%AC%D9%86%D9%88%D8%A8/100094129415952/";

const WA_BASE = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

let visibleCount = 15;
const LOAD_STEP  = 15;

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
      (p.brand || "").toLowerCase().includes(q) ||
      (p.desc  || "").toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  renderProducts(filtered, true);
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

  const visibleProducts = products.slice(0, visibleCount);

  grid.innerHTML = visibleProducts.map((p, i) => {
    const waMsg  = encodeURIComponent(`السلام عليكم، أريد الاستفسار عن: ${p.name} 🌹`);
    const waLink = WA_BASE + waMsg;

    // ─────────────────────────────────────────────────────────────
    //  VISUAL BLOCK
    //  • The wrapper (.card-visual) uses flex to center its child.
    //  • The <img> uses object-fit:contain so it is never cropped
    //    or stretched — it simply scales down to fit inside the box.
    //  • Width & height on the img are set to 100% of the wrapper,
    //    while object-fit:contain keeps the aspect ratio intact.
    // ─────────────────────────────────────────────────────────────
    const VISUAL_HEIGHT = "220px";  // ← change this one value to resize all images

    const visual = p.image
      ? `
        <div class="img-placeholder"
             style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a 25%,#2a2a2a 100%);border-radius:inherit;"></div>
        <img data-src="${p.image}"
             alt="${p.name}"
             class="card-img lazy-img"
             style="
               position: absolute;
               inset: 0;
               width: 100%;
               height: 100%;
               object-fit: contain;
               object-position: center;
               padding: 10px;
               box-sizing: border-box;
               opacity: 0;
               transition: opacity 0.4s ease;
             "/>
        <div class="card-emoji-fallback"
             style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:3rem;">
          ${p.emoji || "🧴"}
        </div>`
      : `<div class="card-emoji-fallback"
              style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;">
           ${p.emoji || "🧴"}
         </div>`;

    return `
      <div class="product-card" style="animation-delay:${i * 0.06}s">
        <div class="card-topline"></div>

        <div class="card-visual"
             style="
               position: relative;
               width: 100%;
               height: ${VISUAL_HEIGHT};
               overflow: hidden;
               background: #111;
               border-radius: 10px 10px 0 0;
             ">
          ${visual}
        </div>

        <div class="card-body">
          <div class="card-cat">${p.category}</div>
          <div class="card-name">${p.name}</div>
          ${p.brand ? `<div class="card-brand">${p.brand}</div>` : ""}
          ${p.desc  ? `<div class="card-desc">${p.desc}</div>`   : ""}
          <div class="card-footer">
            <a class="card-wa" href="${waLink}" target="_blank">استفسر</a>
            <div class="card-price">${p.price || ""}</div>
          </div>
        </div>
      </div>`;
  }).join("");

  initLazyLoading();
  renderLoadMore(products);
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
      display: block;
      margin: 40px auto;
      padding: 12px 40px;
      background-color: #222222;
      color: #ffffff;
      border: none;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;

    btn.onmouseover = () => {
      btn.style.backgroundColor = "#444444";
      btn.style.transform        = "translateY(-3px)";
      btn.style.boxShadow        = "0 6px 15px rgba(0,0,0,0.2)";
    };
    btn.onmouseout = () => {
      btn.style.backgroundColor = "#222222";
      btn.style.transform        = "translateY(0)";
      btn.style.boxShadow        = "0 4px 10px rgba(0,0,0,0.15)";
    };

    grid.insertAdjacentElement("afterend", btn);
  }

  if (visibleCount >= products.length || products.length === 0) {
    btn.style.display = "none";
    return;
  }

  btn.style.display = "block";
  btn.onclick = () => {
    visibleCount += LOAD_STEP;
    renderProducts(products, false);
  };
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
          // fade in the image
          img.style.opacity = "1";

          // remove the shimmer placeholder
          const placeholder = img.parentElement.querySelector(".img-placeholder");
          if (placeholder) placeholder.remove();
        };

        img.onerror = () => {
          // show emoji fallback
          const fallback = img.parentElement.querySelector(".card-emoji-fallback");
          if (fallback) fallback.style.display = "flex";

          const placeholder = img.parentElement.querySelector(".img-placeholder");
          if (placeholder) placeholder.remove();

          img.remove();
        };
      }

      obs.unobserve(img);
    });
  }, { rootMargin: "100px" });

  images.forEach(img => observer.observe(img));
}
