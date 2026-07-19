console.log("script loaded");
/* ================= DATA ================= */
const categories = [
  {
    key: "all",
    label: "همه محصولات",
    image: "images/categories/all.png"
  },
  {
    key: "coffee",
    label: "قهوه گرم",
    image: "images/categories/coffee.png"
  },
  {
    key: "cold",
    label: "نوشیدنی سرد",
    image: "images/categories/cold.png"
  },
  {
    key: "dessert",
    label: "دسرها",
    image: "images/categories/dessert.png"
  },
  {
    key: "tea",
    label: "چای و دمنوش",
    image: "images/categories/tea.png"
  },
  {
    key: "featured",
    label: "پیشنهاد ویژه",
    image: "images/categories/special.png"
  }
];
/* ================= STATE ================= */
let activeCat = "all";
let cart = JSON.parse(localStorage.getItem("avan_cart") || "[]");
let searchText = "";

/* ================= HELPERS ================= */
const fmt = n => n.toLocaleString("fa-IR");
function saveCart(){ localStorage.setItem("avan_cart", JSON.stringify(cart)); updateCartUI(); }
/* ================= RENDER CATEGORY FILTER ================= */
function renderFilters(){

const wrap = document.getElementById("catFilter");

wrap.innerHTML = categories.map(c=>{

const count = c.key==="all"
? products.length
: products.filter(p=>p.cat===c.key).length;

return `

<div class="cat-item">

<button class="cat-btn ${activeCat===c.key?"active":""}" data-cat="${c.key}">

<img src="${c.image}" alt="${c.label}">

</button>

<h4 class="cat-title">
${c.label}
</h4>

<span class="cat-count">
${count} محصول
</span>

</div>

`;

}).join("");

wrap.querySelectorAll(".cat-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

    activeCat = btn.dataset.cat;

    renderFilters();

    renderProducts();

    setTimeout(()=>{

        document.getElementById("products").scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    },150);

});

});

}
/* ================= RENDER PRODUCTS ================= */
function renderProducts(){
  const grid = document.getElementById("productGrid");
  let list = [];

if(activeCat === "all"){

    const featured = products.filter(p => p.featured);
    const normal = products.filter(p => !p.featured);

    list = [...featured, ...normal];

}else if(activeCat === "featured"){

    list = products.filter(p => p.featured);

}else{

    list = products.filter(p => p.cat === activeCat);

}

if(searchText){

list = list.filter(p=>

p.name.includes(searchText) ||

p.desc.includes(searchText) ||

p.catLabel.includes(searchText)

);

}
  grid.innerHTML = list.map((p,i)=>`
    <div class="card ${p.featured ? 'featured' : ''}" style="animation-delay:${i*0.05}s">
      <div class="card-img">
        ${p.tag && !p.featured ? `<span class="tag">${p.tag}</span>` : ""}
        ${p.featured ? `<span class="ribbon"></span>` : ""}
        <button class="fav-btn" data-fav="${p.id}" aria-label="علاقه‌مندی">
          <svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.8-10-9.3C.4 8.1 2.3 4.5 6 4c2.1-.3 3.8.9 6 3.4C14.2 4.9 15.9 3.7 18 4c3.7.5 5.6 4.1 4 7.7C19.5 16.2 12 21 12 21Z"/></svg>
        </button>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="view-overlay">
          <button class="view-btn" data-view="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            مشاهده محصول
          </button>
        </div>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.catLabel}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="card-foot">
          <div class="price">${fmt(p.price)} <small>تومان</small></div>
          <button class="add-btn" data-add="${p.id}" aria-label="افزودن به سبد">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click", ()=>{
    addToCart(parseInt(b.dataset.add), 1);
  }));
  grid.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click", ()=>{
    openProductModal(parseInt(b.dataset.view));
  }));
  grid.querySelectorAll("[data-fav]").forEach(b=>b.addEventListener("click", (e)=>{
    e.currentTarget.classList.toggle("active");
  }));
}

/* ================= CART LOGIC ================= */
function addToCart(id, qty){
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += qty; }
  else { cart.push({id, qty}); }
  saveCart();
  showToast("به سبد خرید اضافه شد");
}
function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart();
}
function removeItem(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
}

function updateCartUI(){
  const totalCount = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cartBadge").textContent = totalCount;

  const body = document.getElementById("cartBody");
  const foot = document.getElementById("cartFoot");

  if(cart.length===0){
    body.innerHTML = `<div class="empty-cart">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 6.5H6"/></svg>
      <p>سبد خرید شما خالی است</p>
    </div>`;
    foot.innerHTML = "";
    return;
  }

  body.innerHTML = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    return `<div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-item-info">
        <b>${p.name}</b>
        <span>${fmt(p.price)} تومان</span>
        <div class="qty-row">
          <button class="qty-btn" data-dec="${p.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-inc="${p.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-remove="${p.id}">حذف</button>
    </div>`;
  }).join("");

  const subtotal = cart.reduce((s,i)=>{
    const p = products.find(x=>x.id===i.id);
    return s + p.price*i.qty;
  },0);
  const shipping = subtotal>0 ? 25000 : 0;

  foot.innerHTML = `
    <div class="sum-row"><span>جمع محصولات</span><span>${fmt(subtotal)} تومان</span></div>
    <div class="sum-row"><span>هزینه ارسال</span><span>${fmt(shipping)} تومان</span></div>
    <div class="sum-row total"><span>مجموع</span><span>${fmt(subtotal+shipping)} تومان</span></div>
    <button class="checkout-btn">تکمیل خرید</button>
  `;

  body.querySelectorAll("[data-inc]").forEach(b=>b.addEventListener("click",()=>changeQty(parseInt(b.dataset.inc),1)));
  body.querySelectorAll("[data-dec]").forEach(b=>b.addEventListener("click",()=>changeQty(parseInt(b.dataset.dec),-1)));
  body.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>removeItem(parseInt(b.dataset.remove))));
}

/* ================= DRAWER ================= */
const drawer = document.getElementById("cartDrawer");
const overlayBg = document.getElementById("overlayBg");
function openDrawer(){ drawer.classList.add("open"); overlayBg.classList.add("show"); }
function closeDrawer(){ drawer.classList.remove("open"); overlayBg.classList.remove("show"); }
document.getElementById("cartBtn").addEventListener("click", openDrawer);
document.getElementById("closeCart").addEventListener("click", closeDrawer);
overlayBg.addEventListener("click", ()=>{ closeDrawer(); closeModal(); });

/* ================= PRODUCT MODAL ================= */
const pModal = document.getElementById("pModal");
let modalQty = 1;

function openProductModal(id){
  const p = products.find(x=>x.id===id);
  modalQty = 1;
  document.getElementById("pModalBox").innerHTML = `
    <div class="pmodal-img">
      <button class="pmodal-close" id="pmClose">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <img src="${p.img}" alt="${p.name}">
    </div>
    <div class="pmodal-info">
      <span class="pmodal-cat">${p.catLabel}</span>
      <h2>${p.name}</h2>
      <p class="p-desc">${p.desc}</p>
      <div class="ingredients">
        <h4>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7 12 3 4 7v10l8 4 8-4V7Z"/></svg>
          ترکیبات محصول
        </h4>
        <div class="ing-list">
          ${p.ingredients.map(i=>`<span class="ing-chip">${i}</span>`).join("")}
        </div>
      </div>
      <div class="pmodal-price-row">
        <div>
          <div class="pmodal-price" id="pmPrice">${fmt(p.price)} <small style="font-size:12px;font-weight:500;color:#8A8272;">تومان</small></div>
        </div>
        <div class="modal-qty">
          <button id="pmDec">−</button>
          <span id="pmQty">1</span>
          <button id="pmInc">+</button>
        </div>
      </div>
      <button class="modal-add-btn" id="pmAdd">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 6.5H6"/></svg>
        افزودن به سبد خرید
      </button>
    </div>
  `;
  pModal.classList.add("open");
  overlayBg.classList.add("show");
  document.getElementById("pmClose").addEventListener("click", closeModal);

  const qtyEl = document.getElementById("pmQty");
  const priceEl = document.getElementById("pmPrice");
  document.getElementById("pmInc").addEventListener("click", ()=>{
    modalQty++; qtyEl.textContent = modalQty;
    priceEl.innerHTML = `${fmt(p.price*modalQty)} <small style="font-size:12px;font-weight:500;color:#8A8272;">تومان</small>`;
  });
  document.getElementById("pmDec").addEventListener("click", ()=>{
    if(modalQty>1){ modalQty--; qtyEl.textContent = modalQty;
      priceEl.innerHTML = `${fmt(p.price*modalQty)} <small style="font-size:12px;font-weight:500;color:#8A8272;">تومان</small>`;
    }
  });
  document.getElementById("pmAdd").addEventListener("click", ()=>{
    addToCart(p.id, modalQty);
    closeModal();
  });
}
function closeModal(){
  pModal.classList.remove("open");
  if(!drawer.classList.contains("open")) overlayBg.classList.remove("show");
}

/* ================= TOAST ================= */
let toastTimer;
function showToast(msg){
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"), 2200);
}

/* ================= HEADER SCROLL ================= */
window.addEventListener("scroll", ()=>{
  document.getElementById("siteHeader").classList.toggle("scrolled", window.scrollY>10);
});

/* ================= SCROLL REVEAL ================= */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("in"); });
},{threshold:0.15});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* ================= INIT ================= */
renderFilters();
renderProducts();
updateCartUI();
/* ================= HERO SLIDER ================= */

const slider = document.querySelector(".hero-slider");

if (slider) {

const slides = slider.querySelectorAll(".hero-slide");
const dots = slider.querySelectorAll(".hero-dots span");
const prevBtn = slider.querySelector(".hero-prev");
const nextBtn = slider.querySelector(".hero-next");

let current = 0;
let autoPlay;

function showSlide(index){

if(index < 0) index = slides.length - 1;
if(index >= slides.length) index = 0;

slides.forEach((slide)=>{
slide.classList.remove("active");
});

dots.forEach((dot)=>{
dot.classList.remove("active");
});

slides[index].classList.add("active");

if(dots[index]){
dots[index].classList.add("active");
}

current = index;

}

function nextSlide(){
showSlide(current + 1);
}

function prevSlide(){
showSlide(current - 1);
}

function startAuto(){
stopAuto();
autoPlay = setInterval(nextSlide,5000);
}

function stopAuto(){
clearInterval(autoPlay);
}
/* ---------- Events ---------- */

if(nextBtn){
nextBtn.addEventListener("click",()=>{
nextSlide();
startAuto();
});
}

if(prevBtn){
prevBtn.addEventListener("click",()=>{
prevSlide();
startAuto();
});
}

dots.forEach((dot,index)=>{
dot.addEventListener("click",()=>{
showSlide(index);
startAuto();
});
});

slider.addEventListener("mouseenter",stopAuto);
slider.addEventListener("mouseleave",startAuto);

/* ---------- Swipe Mobile ---------- */

let touchStartX = 0;
let touchEndX = 0;

slider.addEventListener("touchstart",(e)=>{
touchStartX = e.changedTouches[0].clientX;
});

slider.addEventListener("touchend",(e)=>{
touchEndX = e.changedTouches[0].clientX;

const distance = touchStartX - touchEndX;

if(Math.abs(distance) < 50) return;

if(distance > 0){
nextSlide();
}else{
prevSlide();
}

startAuto();

});
/* ---------- Init ---------- */

showSlide(0);
startAuto();

/* ---------- Pause when tab hidden ---------- */

document.addEventListener("visibilitychange", () => {

if(document.hidden){
stopAuto();
}else{
startAuto();
}

});

}
console.log("init finished");
/* ================= MOBILE MENU ================= */

const menuBtn = document.getElementById("menuToggle");
const mainMenu = document.getElementById("mainMenu");

if(menuBtn && mainMenu){

menuBtn.addEventListener("click",()=>{

mainMenu.classList.toggle("open");

});

mainMenu.querySelectorAll("a").forEach(link=>{

link.addEventListener("click",()=>{

mainMenu.classList.remove("open");

});

});

}
const searchInput = document.getElementById("searchInput");

if(searchInput){

searchInput.addEventListener("input",function(){

searchText = this.value.trim();

renderProducts();

});

}
const catFilter = document.getElementById("catFilter");

document.querySelector(".cat-next").onclick = () => {

    catFilter.scrollBy({

        left: -220,

        behavior: "smooth"

    });

};

document.querySelector(".cat-prev").onclick = () => {

    catFilter.scrollBy({

        left: 220,

        behavior: "smooth"

    });

};