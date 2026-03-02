document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const orders =
    JSON.parse(localStorage.getItem("orders") || "[]") || [];
  const users =
    JSON.parse(localStorage.getItem("users") || "[]") || [];

  const ordersContainer = document.getElementById("logsOrders");
  const usersContainer = document.getElementById("logsUsers");
  const statsContainer = document.getElementById("logsStats");

  if (!ordersContainer || !usersContainer || !statsContainer) {
    // logs.js is also loaded on index.html; just exit quietly there
    return;
  }

  // Orders log
  if (!orders.length) {
    ordersContainer.innerHTML = `
      <div style="font-size:13px;color:#9ca3af;">
        No orders stored yet. Place an order from the main app.
      </div>
    `;
  } else {
    orders.forEach((o) => {
      const itemsText = (o.items || [])
        .map((it) => `${it.name} ×${it.qty}`)
        .join(", ");
      ordersContainer.innerHTML += `
        <div class="admin-list-card" style="background:#020617;border-color:#1f2937;">
          <div>
            <strong style="color:#e5e7eb;">Order #${o.id}</strong>
            <p style="color:#9ca3af;">
              Total: ₹${Math.round(o.total)} • Status: ${o.status || "Unknown"}
            </p>
            <p style="color:#9ca3af;">Items: ${itemsText || "N/A"}</p>
            ${
              o.customer
                ? `<p style="color:#9ca3af;">Customer: ${
                    o.customer.name || "-"
                  } • ${o.customer.phone || "-"}</p>`
                : ""
            }
          </div>
        </div>
      `;
    });
  }

  // Users log
  if (!users.length) {
    usersContainer.innerHTML = `
      <div style="font-size:13px;color:#9ca3af;">
        No users stored yet. Login as a user from the main app.
      </div>
    `;
  } else {
    users.forEach((u) => {
      usersContainer.innerHTML += `
        <div class="admin-list-card" style="background:#020617;border-color:#1f2937;">
          <div>
            <strong style="color:#e5e7eb;">${u.email}</strong>
            <p style="color:#9ca3af;">Registered user (demo)</p>
          </div>
        </div>
      `;
    });
  }

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  statsContainer.innerHTML = `
    <div class="admin-kpi">
      <div class="admin-kpi-row">
        <span>Total Orders</span>
        <strong>${orders.length}</strong>
      </div>
      <div class="admin-kpi-row">
        <span>Total Users</span>
        <strong>${users.length}</strong>
      </div>
      <div class="admin-kpi-row">
        <span>Total Revenue</span>
        <strong>₹${Math.round(totalRevenue)}</strong>
      </div>
    </div>
  `;
});