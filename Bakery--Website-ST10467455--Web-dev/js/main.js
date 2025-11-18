// main.js - navigation, products load & display, search, lightbox, accessibility helpers

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
  }

  // Highlight current nav link
  (function highlightNav() {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    const map = { home: 'index.html', about: 'about.html', products: 'products.html', 'custom-orders': 'custom-orders.html', contact: 'contact.html' };
    const currentHref = map[page] || '';
    document.querySelectorAll('nav a').forEach(a => {
      if (a.getAttribute('href') === currentHref) a.setAttribute('aria-current', 'page');
    });
  })();

  // Load products (dynamic content)
  const productContainers = document.querySelectorAll('.product-grid');
  if (productContainers.length) {
    fetch('data/products.json').then(r => r.json()).then(products => {
      // If on home page, show only featured (first 3)
      const homeDiv = document.getElementById('homeProducts');
      if (homeDiv) {
        homeDiv.innerHTML = renderProducts(products.slice(0,3));
      }
      const grid = document.getElementById('productGrid');
      if (grid) {
        grid.innerHTML = renderProducts(products);
      }

      // Attach lightbox listeners
      document.querySelectorAll('.product-card-link').forEach(a => a.addEventListener('click', openLightbox));
    }).catch(err => {
      console.error('Products load failed', err);
    });
  }

  // Search & filter on products page
  const searchInput = document.getElementById('search');
  const filterSelect = document.getElementById('filterCategory');
  if (searchInput || filterSelect) {
    const grid = document.getElementById('productGrid');
    // Debounced search
    let productsCache = [];
    fetch('data/products.json').then(r => r.json()).then(data => { productsCache = data; if (grid) grid.innerHTML = renderProducts(data); });
    const applyFilter = () => {
      const q = (searchInput ? searchInput.value.toLowerCase().trim() : '');
      const cat = (filterSelect ? filterSelect.value : '');
      const filtered = productsCache.filter(p => {
        const matchesQ = q === '' || (p.name + ' ' + p.description).toLowerCase().includes(q);
        const matchesC = cat === '' || p.category === cat;
        return matchesQ && matchesC;
      });
      if (grid) grid.innerHTML = renderProducts(filtered);
      // reattach lightbox
      setTimeout(()=>document.querySelectorAll('.product-card-link').forEach(a=>a.addEventListener('click', openLightbox)), 50);
    };
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilter, 250));
    if (filterSelect) filterSelect.addEventListener('change', applyFilter);
  }

  // Lightbox: click handler
  function openLightbox(e) {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const alt = e.currentTarget.querySelector('img') ? e.currentTarget.querySelector('img').alt : '';
    const lb = document.getElementById('lightbox');
    if(!lb) return;
    lb.innerHTML = `<div class="lb-inner"><img src="${href}" alt="${alt}"><button class="lb-close" aria-label="Close">Close</button></div>`;
    lb.removeAttribute('hidden');
    lb.querySelector('.lb-close').addEventListener('click', ()=> lb.setAttribute('hidden',''));
    // close on overlay click
    lb.addEventListener('click', (ev) => { if (ev.target === lb) lb.setAttribute('hidden',''); });
    // Keyboard escape
    document.addEventListener('keydown', function esc(e){ if(e.key === 'Escape'){ lb.setAttribute('hidden',''); document.removeEventListener('keydown', esc); }});
  }

  // Render products helper
  function renderProducts(products) {
    return products.map(p => `
      <article class="card ${p.category.toLowerCase()}" data-slug="${p.slug}">
        <a class="product-card-link" href="${p.image_large}">
          <img src="${p.image}" srcset="${p.image_small} 480w, ${p.image} 1024w" sizes="(max-width:768px) 100vw, 33vw" alt="${escapeHtml(p.name)}" loading="lazy">
        </a>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="muted">${escapeHtml(p.description)}</p>
        <p class="price">R${p.price}</p>
      </article>
    `).join('');
  }

  // Utilities
  function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function debounce(fn,wait){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), wait); }; }
});
