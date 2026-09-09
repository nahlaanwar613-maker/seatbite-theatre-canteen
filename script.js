const menu=[
{id:1,name:"Classic Popcorn",desc:"Freshly popped, lightly salted",price:120,category:"popcorn",emoji:"🍿"},
{id:2,name:"Caramel Popcorn",desc:"Sweet caramel-coated popcorn",price:160,category:"popcorn",emoji:"🍿"},
{id:3,name:"Cheese Nachos",desc:"Crispy nachos with cheese dip",price:180,category:"snacks",emoji:"🧀"},
{id:4,name:"Veg Sandwich",desc:"Fresh vegetables and cheese",price:150,category:"snacks",emoji:"🥪"},
{id:5,name:"Chicken Burger",desc:"Crispy chicken with special sauce",price:220,category:"snacks",emoji:"🍔"},
{id:6,name:"French Fries",desc:"Golden crispy fries",price:130,category:"snacks",emoji:"🍟"},
{id:7,name:"Cola",desc:"Chilled 500ml soft drink",price:90,category:"drinks",emoji:"🥤"},
{id:8,name:"Fresh Lime",desc:"Chilled lime drink",price:100,category:"drinks",emoji:"🍋"},
{id:9,name:"Water",desc:"500ml bottled water",price:40,category:"drinks",emoji:"💧"},
{id:10,name:"Movie Combo",desc:"Large popcorn + 2 soft drinks",price:290,category:"combos",emoji:"🎁"},
{id:11,name:"Couple Combo",desc:"Popcorn + nachos + 2 drinks",price:420,category:"combos",emoji:"🍿"},
{id:12,name:"Family Combo",desc:"Large popcorn + fries + 4 drinks",price:590,category:"combos",emoji:"🎉"}];

let cart={},paymentMethod="upi";

function money(v){return"₹"+v.toLocaleString("en-IN")}
function login(e){e.preventDefault();document.getElementById("loginPage").classList.add("hidden");document.getElementById("app").classList.remove("hidden");renderMenu();sessionStorage.setItem("seatbiteLoggedIn","true")}
function renderMenu(category="all"){const c=document.getElementById("menu"),items=category==="all"?menu:menu.filter(x=>x.category===category);c.innerHTML=items.map(x=>`<article class="item"><div class="food-image">${x.emoji}</div><h3>${x.name}</h3><p>${x.desc}</p><div class="item-bottom"><span class="price">${money(x.price)}</span><button class="add" onclick="addToCart(${x.id})">+ Add</button></div></article>`).join("")}
function filterMenu(cat,b){document.querySelectorAll(".categories button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderMenu(cat)}
function addToCart(id){cart[id]=(cart[id]||0)+1;updateCount()}
function changeQty(id,n){cart[id]=(cart[id]||0)+n;if(cart[id]<=0)delete cart[id];renderCart();updateCount()}
function updateCount(){document.getElementById("cartCount").textContent=Object.values(cart).reduce((a,b)=>a+b,0)}
function renderCart(){const c=document.getElementById("cartItems"),entries=Object.entries(cart);if(!entries.length){c.innerHTML='<div style="text-align:center;padding:60px 10px;color:#71717a"><div style="font-size:55px">🍿</div><p>Your cart is empty.</p></div>';setTotals(0);return}let sub=0;c.innerHTML=entries.map(([id,q])=>{const x=menu.find(i=>i.id===+id);sub+=x.price*q;return`<div class="cart-row"><div class="cart-emoji">${x.emoji}</div><div><strong>${x.name}</strong><br><small>${money(x.price)} each</small><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button><span>${q}</span><button onclick="changeQty(${x.id},1)">+</button></div></div><strong>${money(x.price*q)}</strong></div>`}).join("");setTotals(sub)}
function setTotals(sub){let fee=sub?20:0;document.getElementById("subtotal").textContent=money(sub);document.getElementById("serviceFee").textContent=money(fee);document.getElementById("total").textContent=money(sub+fee);document.getElementById("paymentAmount").textContent=money(sub+fee)}
function openCart(){renderCart();document.getElementById("cartOverlay").classList.remove("hidden")}
function closeCart(e){if(!e||e.target.id==="cartOverlay")document.getElementById("cartOverlay").classList.add("hidden")}
function openPayment(){if(!Object.keys(cart).length)return alert("Please add at least one item.");const seat=document.getElementById("seat").value.trim();if(!seat)return alert("Please enter your seat number first.");renderCart();document.getElementById("cartOverlay").classList.add("hidden");document.getElementById("paymentOverlay").classList.remove("hidden")}
function closePayment(){document.getElementById("paymentOverlay").classList.add("hidden")}
function selectPayment(method,b){paymentMethod=method;document.querySelectorAll(".payment-option").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById("upiBox").classList.toggle("hidden",method!=="upi");document.getElementById("codBox").classList.toggle("hidden",method!=="cod")}
function confirmPayment(){if(paymentMethod==="upi"){const id=document.getElementById("upiId").value.trim();if(!/^[\w.-]+@[\w.-]+$/.test(id))return alert("Enter a valid demo UPI ID, for example name@upi.");}const seat=document.getElementById("seat").value.trim().toUpperCase(),order="SB-"+Math.floor(100000+Math.random()*900000);document.getElementById("orderMessage").textContent=`Your ${paymentMethod==="upi"?"UPI":"cash-on-delivery"} order is confirmed for seat ${seat}.`;document.getElementById("orderNumber").textContent=`Order ${order}`;cart={};updateCount();closePayment();document.getElementById("successModal").classList.remove("hidden")}
function closeSuccess(){document.getElementById("successModal").classList.add("hidden")}
if(sessionStorage.getItem("seatbiteLoggedIn")==="true"){document.getElementById("loginPage").classList.add("hidden");document.getElementById("app").classList.remove("hidden");renderMenu()}
