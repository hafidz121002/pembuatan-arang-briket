'use strict';
const WA_NUMBER = '6280000000000'; // Ganti dengan nomor WhatsApp Anda (format 62..., tanpa +)
const KEY = 'langsa_rencana_v1';
const DATA = [
 {id:1,nama:'Hutan Mangrove Kuala Langsa',kat:'Alam',ico:'🌳',lok:'Kuala Langsa',des:'Kawasan hutan bakau pesisir dengan jalur jembatan kayu untuk menikmati suasana alam dan melihat ekosistem pantai.',tip:'Datang pagi atau sore, bawa topi dan obat nyamuk.'},
 {id:2,nama:'Masjid Islamic Center Langsa',kat:'Religi',ico:'🕌',lok:'Pusat kota',des:'Masjid besar dengan arsitektur megah yang menjadi ikon religi kota dan tempat belajar tentang budaya Islam di Aceh.',tip:'Berpakaian sopan dan tutup aurat saat masuk.'},
 {id:3,nama:'Taman Bustanussalatin',kat:'Taman',ico:'🌷',lok:'Pusat kota',des:'Taman kota yang asri untuk bersantai, berjalan kaki, dan berfoto bersama keluarga.',tip:'Waktu terbaik saat sore hari ketika udara sejuk.'},
 {id:4,nama:'Pelabuhan Kuala Langsa',kat:'Alam',ico:'⛵',lok:'Kuala Langsa',des:'Pelabuhan pesisir dengan pemandangan perahu nelayan dan suasana laut yang tenang.',tip:'Cek cuaca sebelum berkunjung.'},
 {id:5,nama:'Mie Aceh',kat:'Kuliner',ico:'🍜',lok:'Warung di sekitar kota',des:'Mi berbumbu rempah khas Aceh yang kaya rasa, tersedia versi goreng maupun kuah.',tip:'Tanyakan tingkat pedas sebelum memesan.'},
 {id:6,nama:'Kopi Aceh',kat:'Kuliner',ico:'☕',lok:'Warung kopi kota',des:'Budaya ngopi di warung kopi adalah cara terbaik mengenal keramahan warga setempat.',tip:'Cobalah ngopi santai bersama teman lokal.'},
 {id:7,nama:'Seafood Pesisir',kat:'Kuliner',ico:'🦐',lok:'Area pesisir',des:'Hidangan ikan dan udang segar dari hasil laut sekitar, cocok untuk makan bersama.',tip:'Tanyakan harga sebelum memesan.'}
];
const $ = id => document.getElementById(id);
const state = {kat:'Semua', q:'', cart:[]};
function el(tag, cls, text){const e=document.createElement(tag); if(cls)e.className=cls; if(text!==undefined)e.textContent=text; return e;}
function loadCart(){
  try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(Array.isArray(raw)) state.cart=[...new Set(raw.filter(i=>DATA.some(d=>d.id===i)))];
  }catch(e){state.cart=[];}
}
function saveCart(){try{localStorage.setItem(KEY,JSON.stringify(state.cart));}catch(e){}}
let tt;
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(tt);tt=setTimeout(()=>t.classList.add('hidden'),2400);}
function toggle(id){
  const i=state.cart.indexOf(id);
  if(i>-1){state.cart.splice(i,1);toast('Dihapus dari rencana');}else{state.cart.push(id);toast('Ditambahkan ke rencana');}
  saveCart();renderAll();
}
function renderFilters(){
  const box=$('filters');box.textContent='';
  ['Semua',...new Set(DATA.map(d=>d.kat))].forEach(k=>{
    const b=el('button','f'+(state.kat===k?' on':''),k);b.type='button';
    b.addEventListener('click',()=>{state.kat=k;renderFilters();renderGrid();});
    box.appendChild(b);
  });
}
function renderGrid(){
  const g=$('grid');g.textContent='';
  const q=state.q.trim().toLowerCase();
  const list=DATA.filter(d=>(state.kat==='Semua'||d.kat===state.kat)&&(!q||(d.nama+' '+d.des+' '+d.lok).toLowerCase().includes(q)));
  $('empty').classList.toggle('hidden',list.length>0);
  list.forEach(d=>{
    const c=el('article','card');
    c.appendChild(el('div','thumb t-'+d.kat,d.ico));
    c.appendChild(el('span','tag',d.kat));
    c.appendChild(el('h3','',d.nama));
    c.appendChild(el('p','muted','📍 '+d.lok));
    c.appendChild(el('p','',d.des));
    c.appendChild(el('p','small','💡 '+d.tip));
    const added=state.cart.includes(d.id);
    const b=el('button','btn '+(added?'btn-ghost':'btn-pri'),added?'✓ Dalam Rencana':'+ Tambah ke Rencana');
    b.type='button';b.addEventListener('click',()=>toggle(d.id));
    c.appendChild(b);g.appendChild(c);
  });
}
function renderCart(){
  $('cartCount').textContent=String(state.cart.length);
  const ul=$('cartList');ul.textContent='';
  $('cartEmpty').classList.toggle('hidden',state.cart.length>0);
  state.cart.forEach(id=>{
    const d=DATA.find(x=>x.id===id);if(!d)return;
    const li=el('li');li.appendChild(el('span','',d.ico+' '+d.nama));
    const r=el('button','btn btn-ghost','Hapus');r.type='button';
    r.addEventListener('click',()=>toggle(id));li.appendChild(r);ul.appendChild(li);
  });
}
function renderAll(){renderGrid();renderCart();}
function openWA(text){
  const url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text);
  const w=window.open(url,'_blank','noopener,noreferrer');
  if(!w)toast('Izinkan pop-up untuk membuka WhatsApp');
}
function openModal(){$('modal').classList.remove('hidden');$('closeBtn').focus();}
function closeModal(){$('modal').classList.add('hidden');}
function init(){
  loadCart();renderFilters();renderAll();
  $('yr').textContent=String(new Date().getFullYear());
  $('q').addEventListener('input',e=>{state.q=e.target.value.slice(0,60);renderGrid();});
  $('menuBtn').addEventListener('click',()=>{const o=$('nav').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(o));});
  $('nav').addEventListener('click',()=>{$('nav').classList.remove('open');});
  $('cartBtn').addEventListener('click',openModal);
  $('closeBtn').addEventListener('click',closeModal);
  $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  $('clearBtn').addEventListener('click',()=>{state.cart=[];saveCart();renderAll();toast('Rencana dikosongkan');});
  $('sendBtn').addEventListener('click',()=>{
    if(!state.cart.length){toast('Pilih minimal satu tujuan');return;}
    const names=state.cart.map((id,i)=>(i+1)+'. '+DATA.find(d=>d.id===id).nama).join('\n');
    openWA('Halo, saya ingin merencanakan kunjungan ke Langsa:\n'+names+'\nMohon info saran rute dan jadwal.');
  });
  $('waDirect').addEventListener('click',()=>openWA('Halo, saya ingin bertanya tentang wisata Kota Langsa.'));
}
init();
