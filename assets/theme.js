// ── Nav scroll state ──
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Scroll reveal ──
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));

  // Immediately reveal above-the-fold hero elements
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('visible');
      observer.unobserve(el);
    });
  }, 80);
})();

// ── Mobile nav ──
(function () {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();

// ── Product gallery thumbnails ──
(function () {
  const mainImg = document.getElementById('product-main-image');
  const thumbs = document.querySelectorAll('.product-gallery-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImg.src = thumb.dataset.full || thumb.src;
      mainImg.srcset = '';
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
})();

// ── Variant selector ──
(function () {
  const variantBtns = document.querySelectorAll('.variant-btn');
  const variantInput = document.getElementById('variant-id');
  if (!variantBtns.length || !variantInput) return;

  variantBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      variantBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      variantInput.value = btn.dataset.variantId;
    });
  });
})();

// ── Cart quantity controls ──
(function () {
  document.querySelectorAll('.cart-item').forEach(item => {
    const dec = item.querySelector('[data-qty-dec]');
    const inc = item.querySelector('[data-qty-inc]');
    const display = item.querySelector('.qty-value');
    const input = item.querySelector('[name="updates[]"]');
    if (!dec || !inc || !display || !input) return;

    dec.addEventListener('click', async () => {
      const qty = Math.max(0, parseInt(input.value) - 1);
      input.value = qty;
      display.textContent = qty;
      await updateCart(input.dataset.lineKey, qty);
    });

    inc.addEventListener('click', async () => {
      const qty = parseInt(input.value) + 1;
      input.value = qty;
      display.textContent = qty;
      await updateCart(input.dataset.lineKey, qty);
    });
  });

  async function updateCart(key, qty) {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty }),
    });
    window.location.reload();
  }
})();

// ── Email subscription (CTA band) ──
(function () {
  const forms = document.querySelectorAll('[data-email-form]');

  forms.forEach(form => {
    const input = form.querySelector('.input');
    const btn = form.querySelector('.btn');
    const confirmId = form.dataset.confirm;
    const confirm = confirmId ? document.getElementById(confirmId) : null;

    if (!input || !btn) return;

    const submit = async () => {
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 1400);
        return;
      }

      const label = btn.textContent;
      btn.textContent = '...';
      btn.disabled = true;

      try {
        const res = await fetch('/contact#contact_form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            form_type: 'customer',
            utf8: '✓',
            'contact[email]': email,
            'contact[tags]': 'newsletter',
          }),
        });

        if (res.ok || res.redirected) {
          form.style.display = 'none';
          if (confirm) confirm.classList.add('show');
        } else {
          throw new Error();
        }
      } catch {
        btn.textContent = 'Try again';
        btn.disabled = false;
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 1400);
      }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  });
})();
