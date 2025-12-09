// simple product/order manager using localStorage
const STORAGE = {
  PRODUCTS: 'shop_products_v1',
  CATEGORIES: 'shop_cats_v1',
  ORDERS: 'shop_orders_v1'
};

function read(key){ return JSON.parse(localStorage.getItem(key) || '[]') }
function write(key, v){ localStorage.setItem(key, JSON.stringify(v)) }

// --- initial setup ---
if(!localStorage.getItem(STORAGE.CATEGORIES)){
  write(STORAGE.CATEGORIES, ['General','Electronics','Clothes']);
}
if(!localStorage.getItem(STORAGE.PRODUCTS)){
  write(STORAGE.PRODUCTS, []);
}
if(!localStorage.getItem(STORAGE.ORDERS)){
  write(STORAGE.ORDERS, []);
}

// --- DOM refs ---
const productsEl = document.getElementById('products');
const filterCategory = document.getElementById('filterCategory');
const orderProduct = document.getElementById('orderProduct');
const orderForm = document.getElementById('orderForm');
const orderMessage = document.getElementById('orderMessage');

// admin refs (if present)
const catsList = document.getElementById('categoriesList');
const addCatBtn = document.getElementById('addCategory');
const newCatInput = document.getElementById('newCategory');
const prodCategory = document.getElementById('productCategory');
const addProductBtn = document.getElementById('addProduct');
const productTitle = document.getElementById('productTitle');
const productPrice = document.getElementById('productPrice');
const productImage = document.getElementById('productImage');
const productsAdminList = document.getElementById('productsAdminList');
const ordersList = document.getElementById('ordersList');
const orderCount = document.getElementById('orderCount');

// render helpers
function renderCategories() {
  const cats = read(STORAGE.CATEGORIES);
  if(filterCategory){
    filterCategory.innerHTML = '<option value="">সব</option>'+cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }
  if(prodCategory){
    prodCategory.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }
  if(catsList){
    catsList.innerHTML = cats.map((c,i)=>`<li>${c} <button class="small-btn" data-i="${i}" data-action="del-cat">Delete</button></li>`).join('');
  }
}

function renderProducts() {
  const prods = read(STORAGE.PRODUCTS);
  const cat = filterCategory ? filterCategory.value : '';
  const filtered = cat ? prods.filter(p=>p.category===cat) : prods;
  if(productsEl) {
    productsEl.innerHTML = filtered.map(p=>`
      <div class="product card">
        <img src="${p.image||'https://via.placeholder.com/400x300'}" alt="">
        <h3>${p.title}</h3>
        <div class="kv">${p.category} • ৳${p.price}</div>
        <button class="primary" data-id="${p.id}" data-action="buy">Order</button>
      </div>
    `).join('') || '<p class="kv">No products yet.</p>';
  }
  // admin list
  if(productsAdminList){
    productsAdminList.innerHTML = prods.map(p=>`
      <li>
        <strong>${p.title}</strong> (${p.category}) - ৳${p.price}
        <div>
          <button class="small-btn" data-id="${p.id}" data-action="edit">Edit</button>
          <button class="small-btn" data-id="${p.id}" data-action="del">Delete</button>
        </div>
      </li>
    `).join('');
  }

  // order select
  if(orderProduct){
    orderProduct.innerHTML = prods.map(p=>`<option value="${p.id}">${p.title} — ৳${p.price}</option>`).join('');
  }
}

function renderOrders(){
  const ords = read(STORAGE.ORDERS);
  if(ordersList) ordersList.innerHTML = ords.map(o=>`
    <li>
      <strong>${o.productTitle}</strong> — ${o.name} • ${o.phone}
      <div class="kv">${o.address}</div>
      <button class="small-btn" data-id="${o.id}" data-action="mark">Mark done</button>
    </li>
  `).join('') || '<li class="kv">No orders yet.</li>';
  if(orderCount) orderCount.textContent = `(${ords.length})`;
}

// helper id
function id(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6) }

// handle product image file -> base64
function fileToBase64(file){
  return new Promise((res,rej)=>{
    const reader = new FileReader();
    reader.onload = ()=>res(reader.result);
    reader.onerror = ()=>rej('err');
    reader.readAsDataURL(file);
  })
}

// events
document.addEventListener('click', async (e)=>{
  const a = e.target;
  if(!a) return;
  const action = a.dataset && a.dataset.action;
  if(action==='buy'){
    const pid = a.dataset.id;
    const prods = read(STORAGE.PRODUCTS);
    const p = prods.find(x=>x.id===pid);
    if(p){
      // prefill order form if present
      if(orderProduct) orderProduct.value = pid;
      alert('প্রোডাক্ট সিলেক্ট করা হয়েছে, নিচে অর্ডার ফর্ম পূরণ করে submit দিন।');
      window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
    }
  }

  if(action==='del' && productsAdminList){
    const pid = a.dataset.id;
    let prods = read(STORAGE.PRODUCTS);
    prods = prods.filter(x=>x.id!==pid);
    write(STORAGE.PRODUCTS, prods);
    renderProducts();
    alert('Product deleted');
  }

  if(action==='edit' && productsAdminList){
    const pid = a.dataset.id;
    const prods = read(STORAGE.PRODUCTS);
    const p = prods.find(x=>x.id===pid);
    if(p){
      productTitle.value = p.title;
      productPrice.value = p.price;
      prodCategory.value = p.category;
      addProductBtn.dataset.edit = pid;
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }

  if(action==='del-cat'){
    const idx = a.dataset.i;
    let cats = read(STORAGE.CATEGORIES);
    const removed = cats.splice(idx,1);
    write(STORAGE.CATEGORIES, cats);
    renderCategories(); renderProducts();
  }

  if(action==='mark' && ordersList){
    const oid = a.dataset.id;
    let ords = read(STORAGE.ORDERS);
    ords = ords.filter(o=>o.id!==oid);
    write(STORAGE.ORDERS, ords);
    renderOrders();
    alert('Order marked done.');
  }
});

// add category
if(addCatBtn){
  addCatBtn.addEventListener('click', ()=>{
    const v = newCatInput.value && newCatInput.value.trim();
    if(!v) return alert('ক্যাটাগরি নাম দাও');
    let cats = read(STORAGE.CATEGORIES);
    if(cats.includes(v)) return alert('Already exists');
    cats.push(v);
    write(STORAGE.CATEGORIES, cats);
    newCatInput.value = '';
    renderCategories(); renderProducts();
  })
}

// add/update product
if(addProductBtn){
  addProductBtn.addEventListener('click', async ()=>{
    const title = productTitle.value && productTitle.value.trim();
    const price = productPrice.value && productPrice.value.trim();
    const category = prodCategory.value;
    if(!title || !price) return alert('Title and price লাগবে');
    let prods = read(STORAGE.PRODUCTS);
    let imageBase = '';
    if(productImage.files && productImage.files[0]){
      imageBase = await fileToBase64(productImage.files[0]);
    }
    if(addProductBtn.dataset.edit){
      // update
      const idEdit = addProductBtn.dataset.edit;
      prods = prods.map(p=>p.id===idEdit ? {...p, title, price, category, image: imageBase || p.image} : p);
      delete addProductBtn.dataset.edit;
      alert('Product updated');
    } else {
      const newP = { id: id(), title, price, category, image: imageBase };
      prods.push(newP);
      alert('Product added');
    }
    write(STORAGE.PRODUCTS, prods);
    productTitle.value=''; productPrice.value=''; productImage.value='';
    renderProducts(); renderOrders(); renderCategories();
  })
}

// filter
if(filterCategory){
  filterCategory.addEventListener('change', renderProducts);
}

// order form submit
if(orderForm){
  orderForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const pid = orderProduct.value;
    const prods = read(STORAGE.PRODUCTS);
    const p = prods.find(x=>x.id===pid);
    if(!p) return alert('Invalid product');
    const ords = read(STORAGE.ORDERS);
    const newOrder = { id: id(), productId: pid, productTitle: p.title, name, phone, address, created: Date.now() };
    ords.push(newOrder);
    write(STORAGE.ORDERS, ords);
    orderForm.reset();
    orderMessage.textContent = 'অর্ডার গ্রহণ করা হয়েছে। ধন্যবাদ!';
    renderOrders();
    // simple notification for admin: use localStorage flag (or alert)
    alert('নোটিফিকেশন: নতুন অর্ডার এসেছে!');
  });
}

// initial render
renderCategories();
renderProducts();
renderOrders();
