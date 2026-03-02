function logout() {
  location.reload();
}

function updateDashboard() {
  const totalOrdersEl = document.getElementById("totalOrders");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const totalUsersEl = document.getElementById("totalUsers");
  const totalRestaurantsEl = document.getElementById("totalRestaurants");
  const totalDishesEl = document.getElementById("totalDishes");
  const activeDeliveriesEl = document.getElementById("activeDeliveries");

  if (!totalOrdersEl) return; // not on this page

  totalOrdersEl.innerText = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  totalRevenueEl.innerText = revenue;
  totalUsersEl.innerText = users.length;
  totalRestaurantsEl.innerText = restaurants.length;

  let totalDishes = 0;
  for (const key in menus) {
    totalDishes += menus[key].length;
  }
  totalDishesEl.innerText = totalDishes;
  activeDeliveriesEl.innerText = activeDeliveries;

  renderChart();
}

function renderChart() {
  const ctx = document.getElementById("ordersChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (ordersChartInstance) {
    ordersChartInstance.destroy();
  }
  ordersChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Orders",
          data: [5, 8, 6, 10, 12, 9, 7],
          backgroundColor: "rgba(34, 197, 94, 0.85)",
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "rgba(17, 24, 39, 0.6)" },
        },
        y: {
          grid: { color: "rgba(17, 24, 39, 0.08)" },
          ticks: { color: "rgba(17, 24, 39, 0.6)" },
        },
      },
    },
  });
}

function renderOrders() {
  const container = document.getElementById("orderList");
  if (!container) return;

  container.innerHTML = "";
  if (!orders.length) {
    container.innerHTML = `
      <div class="admin-list-card">
        <div>
          <strong>No orders yet</strong>
          <p>New orders will appear here after checkout.</p>
        </div>
      </div>
    `;
    return;
  }
  orders.forEach((o, i) => {
    container.innerHTML += `
      <div class="admin-list-card">
        <div>
          <strong>Order #${o.id}</strong>
          <p>Total: ₹${Math.round(o.total)} • Status: <b>${o.status}</b></p>
          <p>${o.customer?.name ? "Customer: " + o.customer.name : ""}</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
          <button class="admin-action" type="button" onclick="updateOrderStatus(${i})">Mark Delivered</button>
        </div>
      </div>
    `;
  });
}

function updateOrderStatus(index) {
  orders[index].status = "Delivered";
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
  updateDashboard();
}

function renderUsers() {
  const container = document.getElementById("userList");
  if (!container) return;

  container.innerHTML = "";
  if (!users.length) {
    container.innerHTML = `
      <div class="admin-list-card">
        <div>
          <strong>No users yet</strong>
          <p>Users will appear here after user login.</p>
        </div>
      </div>
    `;
    return;
  }
  users.forEach((u, i) => {
    container.innerHTML += `
      <div class="admin-list-card">
        <div>
          <strong>${u.email}</strong>
          <p>Registered user</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="admin-action danger" type="button" onclick="deleteUser(${i})">Delete</button>
        </div>
      </div>
    `;
  });
}

function deleteUser(index) {
  users.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users));
  renderUsers();
  updateDashboard();
}

function addRestaurant() {
  const nameEl = document.getElementById("newResName");
  const typeEl = document.getElementById("newResType");
  const deliveryEl = document.getElementById("newResDelivery");
  const imgEl = document.getElementById("newResImg");

  const name = nameEl.value.trim();
  const type = typeEl.value.trim();
  const delivery = deliveryEl.value.trim();
  const img = imgEl.value.trim() || "https://picsum.photos/400";
  if (!name || !type || !delivery) {
    alert("Fill name, type and delivery time.");
    return;
  }
  restaurants.push({
    name,
    type,
    rating: 4,
    status: "open",
    delivery,
    offer: "New",
    location: "Bangalore",
    img,
  });
  nameEl.value = "";
  typeEl.value = "";
  deliveryEl.value = "";
  imgEl.value = "";
  updateDashboard();
  renderAdminRestaurants();
}

function renderAdminRestaurants() {
  const list = document.getElementById("adminRestaurantList");
  if (!list) return;
  list.innerHTML = "";
  const mapped = restaurants.map((r, idx) => ({ ...r, idx })).reverse();
  if (!mapped.length) {
    list.innerHTML = `
      <div class="admin-list-card">
        <div>
          <strong>No restaurants</strong>
          <p>Add your first restaurant using the form above.</p>
        </div>
      </div>
    `;
    return;
  }
  mapped.slice(0, 12).forEach((r) => {
    const open = (r.status || "open") === "open";
    list.innerHTML += `
      <div class="admin-list-card">
        <div>
          <strong>${r.name}</strong>
          <p>
            ${String(r.type || "").toUpperCase()} • ${
              r.location || "Bangalore"
            } •
            ${r.delivery} mins •
            <b style="color:${open ? "#16a34a" : "#b91c1c"}">${
              open ? "OPEN" : "CLOSED"
            }</b>
          </p>
        </div>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
          <button class="admin-action" type="button" onclick="openRestaurantEditor(${
            r.idx
          })">Edit</button>
        </div>
      </div>
    `;
  });
}

function openRestaurantEditor(index) {
  currentRestaurantIndex = index;
  const res = restaurants[index];
  if (!res) return;

  const modal = document.getElementById("restaurantModal");
  if (!modal) return;

  const nameLabel = document.getElementById("editResNameLabel");
  const typeInput = document.getElementById("editResType");
  const deliveryInput = document.getElementById("editResDelivery");
  const statusInput = document.getElementById("editResStatus");
  const meta = document.getElementById("editResMeta");

  if (nameLabel) nameLabel.textContent = res.name || "";
  if (typeInput) typeInput.value = res.type || "";
  if (deliveryInput) deliveryInput.value = res.delivery || "";
  if (statusInput) statusInput.value = res.status || "open";
  if (meta) {
    meta.textContent = res.location
      ? `${res.location} • Rating ${res.rating || 0}★`
      : "Bangalore";
  }

  renderRestaurantDishes(res.name);

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeRestaurantEditor() {
  const modal = document.getElementById("restaurantModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  currentRestaurantIndex = null;
}

function renderRestaurantDishes(restaurantName) {
  const list = document.getElementById("restaurantDishesList");
  if (!list) return;
  list.innerHTML = "";

  const items = menus[restaurantName] || [];
  if (!items.length) {
    list.innerHTML = `
      <div class="admin-dish-row is-empty">
        <div class="admin-dish-meta">No dishes yet. Use the form below to add one.</div>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    list.innerHTML += `
      <div class="admin-dish-row">
        <div>
          <strong>${item.name}</strong>
          <div class="admin-dish-meta">₹${item.price}</div>
        </div>
        <div class="admin-dish-meta">
          ${item.img ? "Image set" : "No image"}
        </div>
      </div>
    `;
  });
}

function addDishToRestaurant() {
  if (currentRestaurantIndex === null) {
    alert("Select a restaurant to add dishes.");
    return;
  }
  const res = restaurants[currentRestaurantIndex];
  if (!res) return;

  const nameInput = document.getElementById("newDishName");
  const priceInput = document.getElementById("newDishPrice");
  const imgInput = document.getElementById("newDishImg");

  const dishName = nameInput?.value.trim() || "";
  const priceValue = priceInput?.value.trim() || "";
  const dishImg = imgInput?.value.trim() || "";

  const price = Number(priceValue);
  if (!dishName || !price || price <= 0) {
    alert("Please enter a dish name and valid price.");
    return;
  }

  if (!menus[res.name]) {
    menus[res.name] = [];
  }
  menus[res.name].push({
    name: dishName,
    price,
    img: dishImg,
  });

  if (nameInput) nameInput.value = "";
  if (priceInput) priceInput.value = "";
  if (imgInput) imgInput.value = "";

  renderRestaurantDishes(res.name);
  updateDashboard();
}

function saveRestaurantDetails() {
  if (currentRestaurantIndex === null) return;
  const res = restaurants[currentRestaurantIndex];
  if (!res) return;

  const typeInput = document.getElementById("editResType");
  const deliveryInput = document.getElementById("editResDelivery");
  const statusInput = document.getElementById("editResStatus");

  if (typeInput) {
    const v = typeInput.value.trim();
    if (v) res.type = v;
  }
  if (deliveryInput) {
    const v = deliveryInput.value.trim();
    if (v) res.delivery = v;
  }
  if (statusInput) {
    res.status = statusInput.value || res.status;
  }

  updateDashboard();
  renderAdminRestaurants();
  alert("Restaurant details updated.");
}

function showAdminTab(tab, btn) {
  const contentWrappers = document.querySelectorAll("#adminContent > div");
  if (!contentWrappers.length) return;

  contentWrappers.forEach((div) => {
    div.classList.add("hidden");
  });
  const activeSection = document.getElementById("admin-" + tab);
  if (activeSection) activeSection.classList.remove("hidden");

  const navBtns = document.querySelectorAll(".admin-nav-btn");
  navBtns.forEach((b) => b.classList.remove("is-active"));
  const activeBtn =
    btn || document.querySelector(`.admin-nav-btn[data-admin-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add("is-active");

  if (tab === "orders") renderOrders();
  if (tab === "users") renderUsers();
  if (tab === "restaurants") renderAdminRestaurants();

  closeAdminSidebar();
}

function toggleAdminSidebar() {
  const dash = document.getElementById("adminDashboard");
  if (!dash) return;
  dash.classList.toggle("sidebar-open");
}

function closeAdminSidebar() {
  const dash = document.getElementById("adminDashboard");
  if (!dash) return;
  dash.classList.remove("sidebar-open");
}