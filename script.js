import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { firebaseConfig, firebaseConfigured } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const money = (n) => `₹${n.toLocaleString("en-IN")}`;

const DATA = {
  "Perinthalmanna": [
    { id:"p1", name:"Vismaya Cinemas", address:"Perinthalmanna", movies:[
      {id:"p1m1",name:"The Last Horizon", shows:["10:30 AM","2:00 PM","6:30 PM","9:30 PM"]},
      {id:"p1m2",name:"Kingdom of Fire", shows:["11:15 AM","3:15 PM","7:15 PM"]}
    ]},
    { id:"p2", name:"Alankar Theatre", address:"Perinthalmanna", movies:[
      {id:"p2m1",name:"Midnight Express", shows:["11:00 AM","2:45 PM","6:00 PM","9:15 PM"]},
      {id:"p2m2",name:"Ocean 9", shows:["12:15 PM","4:00 PM","8:00 PM"]}
    ]}
  ],
  "Kozhikode": [
    { id:"k1", name:"Crown Cinemas", address:"Kozhikode", movies:[
      {id:"k1m1",name:"The Last Horizon", shows:["10:00 AM","1:30 PM","5:00 PM","8:30 PM"]},
      {id:"k1m2",name:"Neon City", shows:["11:30 AM","3:00 PM","6:30 PM","10:00 PM"]}
    ]},
    { id:"k2", name:"Galaxy Multiplex", address:"Kozhikode", movies:[
      {id:"k2m1",name:"Kingdom of Fire", shows:["10:45 AM","2:15 PM","5:45 PM","9:00 PM"]}
    ]}
  ],
  "Kochi": [
    { id:"c1", name:"Metroplex Kochi", address:"Kochi", movies:[
      {id:"c1m1",name:"Ocean 9", shows:["10:15 AM","1:00 PM","4:15 PM","7:30 PM"]},
      {id:"c1m2",name:"Neon City", shows:["11:00 AM","2:30 PM","6:00 PM","9:30 PM"]}
    ]}
  ]
};

const MENU = [
  {id:"pop1",name:"Classic Popcorn",cat:"Popcorn",price:120,emoji:"🍿",desc:"Fresh buttery cinema popcorn."},
  {id:"pop2",name:"Large Cheese Popcorn",cat:"Popcorn",price:180,emoji:"🍿",desc:"Large serving with cheese seasoning."},
  {id:"sn1",name:"Nachos & Cheese",cat:"Snacks",price:160,emoji:"🧀",desc:"Crunchy nachos with cheese dip."},
  {id:"sn2",name:"French Fries",cat:"Snacks",price:130,emoji:"🍟",desc:"Crispy salted fries."},
  {id:"sn3",name:"Chicken Nuggets",cat:"Snacks",price:190,emoji:"🍗",desc:"Golden bite-sized nuggets."},
  {id:"dr1",name:"Cola",cat:"Drinks",price:90,emoji:"🥤",desc:"Chilled cola, regular size."},
  {id:"dr2",name:"Fresh Lime",cat:"Drinks",price:110,emoji:"🍋",desc:"Refreshing lime drink."},
  {id:"co1",name:"Movie Combo",cat:"Combos",price:260,emoji:"🎟️",desc:"Large popcorn + 2 drinks."},
  {id:"co2",name:"Family Combo",cat:"Combos",price:450,emoji:"🍿",desc:"2 large popcorn + 4 drinks."}
];

let app, auth;
let isSignup = false;
let selectedCategory = "All";
let cart = {};
let selection = {location:"", theatre:null, movie:null, show:"", seat:""};

try {
  if (firebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    onAuthStateChanged(auth, user => {
      if (user) {
        showAuthenticated(user);
      } else {
        showAuth();
      }
    });
  } else {
    showAuth();
    setAuthMessage("Firebase is not configured yet. Add your Firebase Web App config in firebase-config.js.");
  }
} catch (e) {
  console.error(e);
  showAuth();
  setAuthMessage("Firebase configuration could not be loaded. Check firebase-config.js.");
}

function showAuthenticated(user) {
  $("authView").classList.add("hidden");
  $("mainNav").classList.remove("hidden");
  $("homeView").classList.remove("hidden");
  $("profileName").textContent = user.displayName || "SeatBite User";
  $("profilePhone").textContent = user.email || "";
  $("profileAvatar").textContent = (user.displayName || "S").charAt(0).toUpperCase();
  renderLocations();
  renderCategories();
  renderMenu();
  renderOrders();
}

function showAuth() {
  $("mainNav").classList.add("hidden");
  ["homeView","paymentView","ordersView","profileView","confirmationView"].forEach(id => $(id).classList.add("hidden"));
  $("authView").classList.remove("hidden");
}

function setAuthMessage(text, good=false) {
  $("authMessage").textContent = text || "";
  $("authMessage").style.color = good ? "#7ff0ca" : "#ffadad";
}

$("loginTab").onclick = () => {
  isSignup = false;
  $("loginTab").classList.add("active");
  $("signupTab").classList.remove("active");
  $("nameGroup").classList.add("hidden");
  $("authSubmitBtn").textContent = "Login";
  $("passwordInput").autocomplete = "current-password";
  setAuthMessage("");
};

$("signupTab").onclick = () => {
  isSignup = true;
  $("signupTab").classList.add("active");
  $("loginTab").classList.remove("active");
  $("nameGroup").classList.remove("hidden");
  $("authSubmitBtn").textContent = "Create Account";
  $("passwordInput").autocomplete = "new-password";
  setAuthMessage("");
};

$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return setAuthMessage("Add Firebase configuration first.");
  const email = $("emailInput").value.trim().toLowerCase();
  const password = $("passwordInput").value;
  const name = $("nameInput").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setAuthMessage("Enter a valid email address.");
  if (password.length < 6) return setAuthMessage("Password must be at least 6 characters.");
  if (isSignup && name.length < 2) return setAuthMessage("Enter your name to create the account.");
  try {
    $("authSubmitBtn").disabled = true;
    if (isSignup) {
      setAuthMessage("Creating your account…", true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, {displayName:name});
      setAuthMessage("Account created successfully.", true);
      showAuthenticated(result.user);
    } else {
      setAuthMessage("Signing you in…", true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAuthMessage("Login successful.", true);
      showAuthenticated(result.user);
    }
  } catch (err) {
    console.error(err);
    setAuthMessage(firebaseError(err));
  } finally {
    $("authSubmitBtn").disabled = false;
  }
});

function firebaseError(err) {
  const map = {
    "auth/invalid-email":"The email address is invalid.",
    "auth/user-not-found":"No account exists with this email.",
    "auth/wrong-password":"Incorrect password.",
    "auth/invalid-credential":"Incorrect email or password.",
    "auth/email-already-in-use":"An account already exists with this email.",
    "auth/weak-password":"Password must be at least 6 characters.",
    "auth/too-many-requests":"Too many attempts. Please wait and try again later.",
    "auth/network-request-failed":"Network error. Check your internet connection.",
    "auth/operation-not-allowed":"Email/password sign-in is not enabled in Firebase Authentication."
  };
  return map[err?.code] || err?.message || "Authentication failed. Please try again.";
}

function renderLocations() {
  const select = $("locationSelect");
  select.innerHTML = `<option value="">Select location</option>` + Object.keys(DATA).map(x => `<option>${x}</option>`).join("");
}

$("locationSelect").onchange = () => {
  selection.location = $("locationSelect").value;
  selection.theatre = selection.movie = null;
  selection.show = selection.seat = "";
  $("theatreSelect").disabled = !selection.location;
  $("movieSelect").disabled = true;
  $("showSelect").disabled = true;
  $("seatInput").disabled = true;
  $("unlockMenuBtn").disabled = true;
  $("theatreSelect").innerHTML = `<option value="">Select theatre</option>` + (DATA[selection.location]||[]).map(t => `<option value="${t.id}">${t.name}</option>`).join("");
  $("movieSelect").innerHTML = `<option value="">Select movie</option>`;
  $("showSelect").innerHTML = `<option value="">Select show</option>`;
  hideMenu();
};

$("theatreSelect").onchange = () => {
  const theatres = DATA[selection.location] || [];
  selection.theatre = theatres.find(t => t.id === $("theatreSelect").value) || null;
  selection.movie = null; selection.show = ""; selection.seat = "";
  $("movieSelect").disabled = !selection.theatre;
  $("showSelect").disabled = true; $("seatInput").disabled = true; $("unlockMenuBtn").disabled = true;
  $("movieSelect").innerHTML = `<option value="">Select movie</option>` + (selection.theatre?.movies||[]).map(m => `<option value="${m.id}">${m.name}</option>`).join("");
  $("showSelect").innerHTML = `<option value="">Select show</option>`;
  hideMenu();
};

$("movieSelect").onchange = () => {
  selection.movie = selection.theatre?.movies.find(m => m.id === $("movieSelect").value) || null;
  selection.show = ""; selection.seat = "";
  $("showSelect").disabled = !selection.movie;
  $("seatInput").disabled = true; $("unlockMenuBtn").disabled = true;
  $("showSelect").innerHTML = `<option value="">Select show</option>` + (selection.movie?.shows||[]).map(s => `<option>${s}</option>`).join("");
  hideMenu();
};

$("showSelect").onchange = () => {
  selection.show = $("showSelect").value;
  $("seatInput").disabled = !selection.show;
  $("unlockMenuBtn").disabled = true;
  hideMenu();
};

$("seatInput").oninput = () => {
  selection.seat = $("seatInput").value.trim().toUpperCase();
  $("unlockMenuBtn").disabled = !/^[A-Z]\d{1,3}$/.test(selection.seat);
};

$("unlockMenuBtn").onclick = () => {
  $("showSummary").classList.remove("hidden");
  $("showSummary").innerHTML = `<b>🎬 ${selection.movie.name}</b> · ${selection.theatre.name} · ${selection.show} · 💺 Seat ${selection.seat}`;
  $("menuSection").classList.remove("hidden");
  $("menuSection").scrollIntoView({behavior:"smooth"});
};

function hideMenu() {
  $("menuSection").classList.add("hidden");
  $("showSummary").classList.add("hidden");
}

function renderCategories() {
  const cats = ["All", ...new Set(MENU.map(x => x.cat))];
  $("categoryTabs").innerHTML = cats.map(c => `<button class="${c===selectedCategory?"active":""}" data-cat="${c}">${c}</button>`).join("");
  $("categoryTabs").querySelectorAll("button").forEach(btn => btn.onclick = () => {
    selectedCategory = btn.dataset.cat; renderCategories(); renderMenu();
  });
}

function renderMenu() {
  const items = selectedCategory === "All" ? MENU : MENU.filter(x => x.cat === selectedCategory);
  $("menuGrid").innerHTML = items.map(item => `
    <article class="food-card">
      <div class="food-emoji">${item.emoji}</div>
      <h3>${item.name}</h3><p>${item.desc}</p>
      <div class="food-footer"><span class="price">${money(item.price)}</span><button class="add-btn" data-add="${item.id}">+ Add</button></div>
    </article>`).join("");
  $("menuGrid").querySelectorAll("[data-add]").forEach(b => b.onclick = () => addToCart(b.dataset.add));
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast("Added to cart");
}

function renderCart() {
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  $("cartCount").textContent = `${ids.reduce((a,id)=>a+cart[id],0)} items`;
  if (!ids.length) {
    $("cartItems").innerHTML = `<p class="muted">Your cart is empty.</p>`;
    $("cartTotals").innerHTML = "";
    $("checkoutBtn").disabled = true;
    return;
  }
  $("cartItems").innerHTML = ids.map(id => {
    const item = MENU.find(x => x.id === id), q = cart[id];
    return `<div class="cart-row"><div><b>${item.name}</b><div class="muted">${money(item.price)} each</div></div>
      <div class="qty"><button data-dec="${id}">−</button><b>${q}</b><button data-inc="${id}">+</button></div>
      <b>${money(item.price*q)}</b></div>`;
  }).join("");
  ids.forEach(id => {
    $(`[data-dec="${id}"]`).onclick = () => {cart[id]--; renderCart();};
    $(`[data-inc="${id}"]`).onclick = () => {cart[id]++; renderCart();};
  });
  const subtotal = ids.reduce((sum,id)=>sum+MENU.find(x=>x.id===id).price*cart[id],0);
  const fee = Math.round(subtotal * 0.05);
  $("cartTotals").innerHTML = `<div class="total-line"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="total-line"><span>Service fee</span><span>${money(fee)}</span></div>
    <div class="total-line grand"><span>Total</span><span>${money(subtotal+fee)}</span></div>`;
  $("checkoutBtn").disabled = false;
}

$("checkoutBtn").onclick = () => {
  renderCheckout();
  navigate("payment");
};

function getCartTotals() {
  const ids = Object.keys(cart).filter(id=>cart[id]>0);
  const subtotal = ids.reduce((sum,id)=>sum+MENU.find(x=>x.id===id).price*cart[id],0);
  const fee = Math.round(subtotal*0.05);
  return {ids,subtotal,fee,total:subtotal+fee};
}

function renderCheckout() {
  const t = getCartTotals();
  $("checkoutSummary").innerHTML = `
    <div class="order-meta">🎬 ${selection.movie.name}<br>🏢 ${selection.theatre.name}<br>🕐 ${selection.show}<br>💺 Seat ${selection.seat}</div>
    ${t.ids.map(id => `<div class="total-line"><span>${MENU.find(x=>x.id===id).name} × ${cart[id]}</span><span>${money(MENU.find(x=>x.id===id).price*cart[id])}</span></div>`).join("")}
    <div class="total-line"><span>Service fee</span><span>${money(t.fee)}</span></div>
    <div class="total-line grand"><span>Total</span><span>${money(t.total)}</span></div>`;
}

document.querySelectorAll('input[name="payment"]').forEach(r => r.onchange = () => {
  $("upiBox").classList.toggle("hidden", r.value !== "upi" || !r.checked);
});

$("placeOrderBtn").onclick = () => {
  const method = document.querySelector('input[name="payment"]:checked').value;
  const t = getCartTotals();
  if (!t.ids.length) return;
  if (method === "upi" && !/^[\w.-]+@[\w.-]+$/.test($("upiId").value.trim())) {
    $("paymentMessage").textContent = "Enter a valid demo UPI ID, such as name@upi.";
    return;
  }
  const user = auth?.currentUser;
  const order = {
    id:"SB"+Math.floor(10000+Math.random()*90000),
    createdAt:new Date().toISOString(),
    userId:user?.uid || "local",
    location:selection.location, theatre:selection.theatre.name, movie:selection.movie.name,
    show:selection.show, seat:selection.seat,
    items:t.ids.map(id=>({name:MENU.find(x=>x.id===id).name,qty:cart[id],price:MENU.find(x=>x.id===id).price})),
    total:t.total, payment:method==="upi"?"UPI Paid":"Cash on Delivery",
    status:"Order Placed"
  };
  const orders = JSON.parse(localStorage.getItem("seatbiteOrders")||"[]");
  orders.unshift(order);
  localStorage.setItem("seatbiteOrders",JSON.stringify(orders));
  cart = {};
  renderCart();
  $("upiId").value="";
  $("confirmationText").textContent = `Order ${order.id} has been placed for Seat ${order.seat}.`;
  $("confirmationDetails").innerHTML = `<b>${order.movie}</b><br>${order.theatre} · ${order.show}<br>Seat ${order.seat}<br><br><b>${money(order.total)}</b> · ${order.payment}`;
  navigate("confirmation");
  renderOrders();
};

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem("seatbiteOrders")||"[]");
  if (!orders.length) {
    $("ordersList").innerHTML = `<div class="panel"><h3>No orders yet</h3><p class="muted">Select a movie show and order your first snack.</p></div>`;
    return;
  }
  $("ordersList").innerHTML = orders.map(order => {
    const statusIndex = ["Order Placed","Payment Confirmed","Preparing","Ready","Delivered"].indexOf(order.status);
    const steps = ["Order Placed","Payment Confirmed","Preparing","Ready","Delivered"];
    return `<article class="order-card">
      <div class="order-top"><div><div class="order-id">${order.id}</div><div class="order-meta">${new Date(order.createdAt).toLocaleString()}</div></div><span class="status ${order.status==="Delivered"?"delivered":""}">${order.status}</span></div>
      <div class="order-meta">🎬 ${order.movie} · 🏢 ${order.theatre} · 🕐 ${order.show} · 💺 ${order.seat}</div>
      <div class="order-items">${order.items.map(i=>`<div class="total-line"><span>${i.name} × ${i.qty}</span><span>${money(i.price*i.qty)}</span></div>`).join("")}</div>
      <div class="order-bottom"><span>${order.payment}</span><b>${money(order.total)}</b></div>
      <div class="timeline">${steps.map((s,i)=>`<div class="timeline-step ${i<=statusIndex?"done":""}"><div class="timeline-dot"></div>${s}</div>`).join("")}</div>
    </article>`;
  }).join("");
}

function resetSelections() {
  selection={location:"",theatre:null,movie:null,show:"",seat:""};
  cart={};
  $("locationSelect").value="";
  $("theatreSelect").innerHTML='<option value="">Select theatre</option>';
  $("movieSelect").innerHTML='<option value="">Select movie</option>';
  $("showSelect").innerHTML='<option value="">Select show</option>';
  $("theatreSelect").disabled=$("movieSelect").disabled=$("showSelect").disabled=$("seatInput").disabled=true;
  $("unlockMenuBtn").disabled=true; $("seatInput").value="";
  hideMenu();
}

function navigate(view) {
  if (!$("homeView").classList.contains("hidden") && view === "home") {}
  ["home","payment","orders","profile","confirmation"].forEach(v => $(`${v}View`).classList.toggle("hidden",v!==view));
  if(view==="orders") renderOrders();
  if(view==="home") renderCart();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", e => {
  e.preventDefault(); navigate(el.dataset.view);
}));

function toast(msg) {
  const el=$("toast"); el.textContent=msg; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),1800);
}

renderCart();
