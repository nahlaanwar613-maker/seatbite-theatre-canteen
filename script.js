const menu = [
  { id: 1, name: "Classic Popcorn", desc: "Freshly popped, lightly salted", price: 120, category: "popcorn", emoji: "🍿" },
  { id: 2, name: "Caramel Popcorn", desc: "Sweet caramel-coated popcorn", price: 160, category: "popcorn", emoji: "🍿" },
  { id: 3, name: "Cheese Nachos", desc: "Crispy nachos with cheese dip", price: 180, category: "snacks", emoji: "🧀" },
  { id: 4, name: "Veg Sandwich", desc: "Fresh vegetables and cheese", price: 150, category: "snacks", emoji: "🥪" },
  { id: 5, name: "Chicken Burger", desc: "Crispy chicken with special sauce", price: 220, category: "snacks", emoji: "🍔" },
  { id: 6, name: "French Fries", desc: "Golden crispy fries", price: 130, category: "snacks", emoji: "🍟" },
  { id: 7, name: "Cola", desc: "Chilled 500ml soft drink", price: 90, category: "drinks", emoji: "🥤" },
  { id: 8, name: "Fresh Lime", desc: "Chilled lime drink", price: 100, category: "drinks", emoji: "🍋" },
  { id: 9, name: "Water", desc: "500ml bottled water", price: 40, category: "drinks", emoji: "💧" },
  { id: 10, name: "Movie Combo", desc: "Large popcorn + 2 soft drinks", price: 290, category: "combos", emoji: "🎁" },
  { id: 11, name: "Couple Combo", desc: "Popcorn + nachos + 2 drinks", price: 420, category: "combos", emoji: "🍿" },
  { id: 12, name: "Family Combo", desc: "Large popcorn + fries + 4 drinks", price: 590, category: "combos", emoji: "🎉" }
];

let cart = {};

function money(value) {
  return "₹" + value.toLocaleString("en-IN");
}

function renderMenu(category = "all") {
  const container = document.getElementById("menu");
  const items = category === "all" ? menu : menu.filter(item => item.category === category);

  container.innerHTML = items.map(item => `
    <article class="item">
      <div class="food-image">${item.emoji}</div>
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      <div class="item-bottom">
        <span class="price">${money(item.price)}</span>
        <button class="add" onclick="addToCart(${item.id})">+ Add</button>
      </div>
    </article>
  `).join("");
}

function filterMenu(category, button) {
  document.querySelectorAll(".categories button").forEach(btn => btn.classList.remove("active"));
  button.classList.add("active");
  renderMenu(category);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();
}

function changeQty(id, amount) {
  cart[id] = (cart[id] || 0) + amount;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const entries = Object.entries(cart);

  if (!entries.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 10px;color:#71717a">
        <div style="font-size:55px">🍿</div>
        <p>Your cart is empty.</p>
        <p style="font-size:12px;margin-top:6px">Add something delicious for the movie!</p>
      </div>`;
    document.getElementById("subtotal").textContent = "₹0";
    document.getElementById("serviceFee").textContent = "₹0";
    document.getElementById("total").textContent = "₹0";
    return;
  }

  let subtotal = 0;

  container.innerHTML = entries.map(([id, qty]) => {
    const item = menu.find(x => x.id === Number(id));
    subtotal += item.price * qty;

    return `
      <div class="cart-row">
        <div class="cart-emoji">${item.emoji}</div>
        <div>
          <strong>${item.name}</strong><br>
          <small>${money(item.price)} each</small>
          <div class="qty">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <span>${qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <strong>${money(item.price * qty)}</strong>
      </div>`;
  }).join("");

  const serviceFee = subtotal > 0 ? 20 : 0;
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("serviceFee").textContent = money(serviceFee);
  document.getElementById("total").textContent = money(subtotal + serviceFee);
}

function openCart() {
  renderCart();
  document.getElementById("cartOverlay").classList.remove("hidden");
}

function closeCart(event) {
  if (!event || event.target.id === "cartOverlay") {
    document.getElementById("cartOverlay").classList.add("hidden");
  }
}

function placeOrder() {
  const seat = document.getElementById("seat").value.trim().toUpperCase();

  if (!seat) {
    alert("Please enter your seat number first.");
    document.getElementById("seat").focus();
    return;
  }

  if (!Object.keys(cart).length) {
    alert("Please add at least one item.");
    return;
  }

  const orderId = "SB-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("orderMessage").textContent =
    `Your food is being prepared for seat ${seat}.`;
  document.getElementById("orderNumber").textContent = `Order ${orderId}`;

  cart = {};
  updateCartCount();
  closeCart();
  document.getElementById("successModal").classList.remove("hidden");
}

function closeSuccess() {
  document.getElementById("successModal").classList.add("hidden");
}

renderMenu();
