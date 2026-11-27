(function () {
  'use strict';
  var WA_NUMBER = '6281234567890';
  var KEY = 'arang_briket_cart_v1';
  var PRODUCTS = [
    { id: 1, name: 'Briket Tempurung Kelapa Kubus', cat: 'Briket', price: 28000, unit: 'kg', desc: 'Kalor tinggi, abu sedikit, nyala hingga 3 jam.' },
    { id: 2, name: 'Briket Heksagonal Berlubang', cat: 'Briket', price: 32000, unit: 'kg', desc: 'Pembakaran merata, cocok untuk panggang dan restoran.' },
    { id: 3, name: 'Briket Serbuk Gergaji', cat: 'Briket', price: 20000, unit: 'kg', desc: 'Ekonomis, minim bau, cocok untuk rumah tangga.' },
    { id: 4, name: 'Briket Shisha Kubus 25 mm', cat: 'Briket', price: 45000, unit: 'kg', desc: 'Asap minim, tanpa bau, nyala stabil.' },
    { id: 5, name: 'Arang Curah Tempurung Kelapa', cat: 'Arang', price: 15000, unit: 'kg', desc: 'Hasil karbonisasi, siap digiling menjadi bahan briket.' },
    { id: 6, name: 'Mesin Pencetak Briket Manual', cat: 'Peralatan', price: 1850000, unit: 'unit', desc: 'Press tuas baja dengan cetakan silinder 4 cm.' },
    { id: 7, name: 'Tepung Tapioka Perekat', cat: 'Bahan', price: 12000, unit: 'kg', desc: 'Perekat alami campuran briket, takaran 5-10%.' },
    { id: 8, name: 'Drum Karbonisasi 200 L', cat: 'Peralatan', price: 950000, unit: 'unit', desc: 'Drum pirolisis lengkap dengan tutup dan cerobong.' }
  ];
  var CATS = ['Semua', 'Briket', 'Arang', 'Bahan', 'Peralatan'];
  var state = { q: '', cat: 'Semua', cart: {} };
  var $ = function (id) { return document.getElementById(id); };
  var rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function byId(id) { return PRODUCTS.find(function (p) { return p.id === id; }); }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      Object.keys(raw).forEach(function (k) {
        var id = parseInt(k, 10), q = parseInt(raw[k], 10);
        if (byId(id) && q > 0 && q <= 999) state.cart[id] = q;
      });
    } catch (e) { state.cart = {}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state.cart)); } catch (e) { /* penyimpanan tidak tersedia */ } }

  function toast(msg) {
    var t = el('div', 'toast', msg);
    $('toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function add(id, n) {
    var q = (state.cart[id] || 0) + n;
    if (q <= 0) delete state.cart[id]; else state.cart[id] = Math.min(q, 999);
    save(); renderCart();
  }

  function renderCatalog() {
    var box = $('prods'); box.replaceChildren();
    var q = state.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      return (state.cat === 'Semua' || p.cat === state.cat) && (!q || (p.name + ' ' + p.desc).toLowerCase().indexOf(q) > -1);
    });
    $('result').textContent = list.length + ' produk ditemukan';
    if (!list.length) { box.appendChild(el('p', 'empty', 'Tidak ada produk yang cocok. Ubah kata kunci atau filter.')); return; }
    list.forEach(function (p) {
      var c = el('article', 'card');
      c.appendChild(el('div', 'pimg', p.name.charAt(0)));
      c.appendChild(el('span', 'tag', p.cat));
      c.appendChild(el('h3', '', p.name));
      c.appendChild(el('p', '', p.desc));
      c.appendChild(el('div', 'price', rp.format(p.price) + ' / ' + p.unit));
      var b = el('button', 'btn pri', 'Tambah ke keranjang');
      b.type = 'button';
      b.addEventListener('click', function () { add(p.id, 1); toast(p.name + ' ditambahkan'); });
      c.appendChild(b);
      box.appendChild(c);
    });
  }

  function renderChips() {
    var box = $('chips'); box.replaceChildren();
    CATS.forEach(function (c) {
      var b = el('button', 'chip', c); b.type = 'button';
      b.setAttribute('aria-pressed', String(state.cat === c));
      b.addEventListener('click', function () { state.cat = c; renderChips(); renderCatalog(); });
      box.appendChild(b);
    });
  }

  function total() {
    return Object.keys(state.cart).reduce(function (s, k) { return s + byId(+k).price * state.cart[k]; }, 0);
  }

  function renderCart() {
    var ids = Object.keys(state.cart), count = 0, list = $('cartList');
    list.replaceChildren();
    ids.forEach(function (k) {
      var p = byId(+k), q = state.cart[k]; count += q;
      var it = el('div', 'it');
      it.appendChild(el('h3', '', p.name));
      it.appendChild(el('p', '', rp.format(p.price) + ' x ' + q + ' ' + p.unit + ' = ' + rp.format(p.price * q)));
      var r = el('div', 'row'), qty = el('div', 'qty');
      var m = el('button', '', '-'), pl = el('button', '', '+'), d = el('button', 'btn sm', 'Hapus');
      m.type = pl.type = d.type = 'button';
      m.setAttribute('aria-label', 'Kurangi jumlah'); pl.setAttribute('aria-label', 'Tambah jumlah');
      m.addEventListener('click', function () { add(p.id, -1); });
      pl.addEventListener('click', function () { add(p.id, 1); });
      d.addEventListener('click', function () { delete state.cart[p.id]; save(); renderCart(); });
      qty.append(m, el('span', '', String(q)), pl);
      r.append(qty, d); it.appendChild(r); list.appendChild(it);
    });
    if (!ids.length) list.appendChild(el('p', 'empty', 'Keranjang masih kosong.'));
    $('cartCount').textContent = String(count);
    $('cartTotal').textContent = rp.format(total());
    $('clearBtn').disabled = !ids.length;
    var msg = 'Halo, saya ingin memesan:\n' + ids.map(function (k) {
      var p = byId(+k); return '- ' + p.name + ' x ' + state.cart[k] + ' ' + p.unit + ' = ' + rp.format(p.price * state.cart[k]);
    }).join('\n') + '\nTotal: ' + rp.format(total()) + '\nTerima kasih.';
    $('waCheckout').href = ids.length ? 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg) : '#katalog';
  }

  function drawer(open) {
    $('drawer').classList.toggle('open', open);
    $('ov').classList.toggle('open', open);
    $('drawer').setAttribute('aria-hidden', String(!open));
    if (open) $('closeCart').focus(); else $('cartBtn').focus();
  }
  function modal(open) { $('modal').classList.toggle('open', open); if (open) $('mNo').focus(); }

  function init() {
    load(); renderChips(); renderCatalog(); renderCart();
    $('q').addEventListener('input', function (e) { state.q = e.target.value.slice(0, 60); renderCatalog(); });
    $('cartBtn').addEventListener('click', function () { drawer(true); });
    $('closeCart').addEventListener('click', function () { drawer(false); });
    $('ov').addEventListener('click', function () { drawer(false); });
    $('menuBtn').addEventListener('click', function () {
      var o = $('nav').classList.toggle('open'); $('menuBtn').setAttribute('aria-expanded', String(o));
    });
    $('nav').addEventListener('click', function () { $('nav').classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false'); });
    $('clearBtn').addEventListener('click', function () { modal(true); });
    $('mNo').addEventListener('click', function () { modal(false); });
    $('mYes').addEventListener('click', function () { state.cart = {}; save(); renderCart(); modal(false); toast('Keranjang dikosongkan'); });
    $('waCheckout').addEventListener('click', function (e) {
      if (!Object.keys(state.cart).length) { e.preventDefault(); drawer(false); toast('Pilih produk terlebih dahulu'); }
    });
    $('waFloat').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo, saya ingin bertanya tentang pembuatan arang briket.');
    $('contactWa').href = $('waFloat').href;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { modal(false); drawer(false); } });
  }
  init();
})();
