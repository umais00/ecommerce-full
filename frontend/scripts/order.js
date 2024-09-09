// Function to fetch orders from the server
function fetchUserOrders() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to view your orders.");
    return;
  }

  fetch("http://localhost:5000/api/orders/user-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in or check your token.");
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((orders) => {
      const orderList = document.getElementById("user-orders");
      orderList.innerHTML = ""; // Clear existing orders

      if (Array.isArray(orders) && orders.length === 0) {
        orderList.innerHTML = "<li>No orders found</li>";
      } else if (Array.isArray(orders)) {
        orders.forEach((order) => {
          const orderItem = document.createElement("li");
          orderItem.textContent = `Order ID: ${order.orderId} | Status: ${order.status}`;
          orderItem.className = "orders-user";
          orderList.appendChild(orderItem);
        });
      } else {
        orderList.innerHTML = "<li>No orders found</li>";
      }
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      document.getElementById(
        "user-orders"
      ).innerHTML = `<li>${error.message}</li>`;
    });
}

function showAlert(message) {
  const alertBox = document.getElementById("alert-box");
  alertBox.textContent = message;
  alertBox.classList.add("show-alert");

  // Remove the alert after 3 seconds
  setTimeout(() => {
    alertBox.classList.remove("show-alert");
  }, 1500);
}
// Fetch orders when the page loads
window.addEventListener("load", fetchUserOrders);

// Refresh orders when the Refresh button is clicked
document.getElementById("refresh").addEventListener("click", () => {
  fetchUserOrders();
  showAlert("Orders refreshed");
});
