async function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remove the product from the frontend list
        fetchProducts();
      } else {
        alert("Failed to delete the product: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while trying to delete the product.");
    }
  }
}

async function deleteOrder(orderId, index) {
  if (confirm("Are you sure you want to delete this order?")) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remove the order from the frontend list
        location.reload();
      } else {
        alert("Failed to delete the order: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while trying to delete the order.");
    }
  }
}
async function acceptOrder(orderId, index) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}/accept`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Accepted" }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      for (const product of data.order.products) {
        await reduceProductStock(product.productId, product.quantity);
      }

      document.querySelectorAll(".accept-order-btn")[index].remove();
      alert("Order accepted and stock updated successfully!");
    } else {
      alert("Failed to accept the order: " + data.message);
    }
  } catch (error) {
    console.error("Error accepting order:", error);
    alert("An error occurred while trying to accept the order.");
  }
}

async function reduceProductStock(productId, quantity) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${productId}/rStock`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }), // Send the quantity to reduce from the stock
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to reduce product stock: " + data.message);
    }

    console.log(`Stock updated for product ${productId}`);
  } catch (error) {
    console.error("Error reducing product stock:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Token check
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    console.log("bad token");
    return;
  }
  let userRole = null; // Variable to store the user's role

  // Function to validate token and check user role
  async function validateToken() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/validate-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const user = await response.json();
      userRole = user.role; // Store the user's role

      console.log("User data:", user); // Debugging line

      // Check user role
      if (user.role === "admin" || user.role === "editor") {
        document.getElementById("admin-content").classList.remove("hidden");
        document.getElementById("access-denied").classList.add("hidden");

        // Load the dashboard stats
        fetchDashboardStats();
      } else {
        window.location.href = "index.html";

        document.getElementById("admin-content").classList.add("hidden");
        document.getElementById("access-denied").classList.remove("hidden");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      window.location.href = "login.html";
    }
  }
  function isUserAllowedToModify() {
    return userRole === "editor";
  }

  // Call the function to validate the token and user role
  validateToken();
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".sidebar ul li a");

  // Attach event listeners for Accept Order buttons
  document.querySelectorAll(".accept-order-btn").forEach((button, index) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-order-id");
      acceptOrder(orderId, index);
    });
  });

  async function fetchDashboardStats() {
    try {
      // Fetch statistics from your backend API
      const [usersResponse, ordersResponse, productsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/stats/users/stats"),
          fetch("http://localhost:5000/api/stats/orders/stats"),
          fetch("http://localhost:5000/api/stats/products/stats"),
        ]);

      // Check if all responses are OK
      if (!usersResponse.ok || !ordersResponse.ok || !productsResponse.ok) {
        throw new Error("Network response was not ok");
      }

      // Parse the JSON data from responses
      const userStats = await usersResponse.json();
      const orderStats = await ordersResponse.json();
      const productStats = await productsResponse.json();

      // Update the DOM with fetched data
      document.getElementById("user-count-value").textContent =
        userStats.userCount; // Change this to match your actual data structure
      document.getElementById("order-count-value").textContent =
        orderStats.orderCount; // Change this to match your actual data structure
      document.getElementById("product-count-value").textContent =
        productStats.productCount; // Change this to match your actual data structure
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
      document.getElementById("user-count-value").textContent = "Error";
      document.getElementById("order-count-value").textContent = "Error";
      document.getElementById("product-count-value").textContent = "Error";
    }
  }

  // Call the function to populate statistics
  fetchDashboardStats();

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const targetSection = document.querySelector(this.getAttribute("href"));

      sections.forEach((section) => section.classList.remove("active"));
      targetSection.classList.add("active");

      if (this.getAttribute("href") === "#users") {
        fetchUsers();
      } else if (this.getAttribute("href") === "#products") {
        fetchProducts();
      } else if (this.getAttribute("href") === "#orders") {
        fetchOrders();
      } else if (this.getAttribute("href") === "#historyPage") {
        fetchCompletedOrders();
      }
    });
  });

  async function fetchUsers() {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const users = await response.json();
      displayUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }

  function displayUsers(users) {
    const usersList = document.getElementById("users-list");
    usersList.innerHTML = users
      .map(
        (user) =>
          `
                  <li>
                    ${user.name} (${user.email})
           <select class="role-select" data-id="${user._id}">
            <option value="admin" ${
              user.role === "admin" ? "selected" : ""
            }>Admin</option>
            <option value="editor" ${
              user.role === "editor" ? "selected" : ""
            }>Editor</option>
            <option value="viewer" ${
              user.role === "viewer" ? "selected" : ""
            }>viewer</option>
          </select>
                    <i class="fa-solid fa-trash" data-id="${user._id}"></i>
                  </li>`
      )
      .join("");

    // Add event listener for role change
    document.querySelectorAll(".role-select").forEach((select) => {
      select.addEventListener("change", async function () {
        const userId = this.getAttribute("data-id");
        const newRole = this.value;
        await changeUserRole(userId, newRole);
        fetchUsers(); // Refresh the user list
      });
    });

    document.querySelectorAll(".fa-trash").forEach((icon) => {
      icon.addEventListener("click", async function () {
        const userId = this.getAttribute("data-id");
        await deleteUser(userId);
        fetchUsers();
      });
    });
  }

  async function changeUserRole(userId, newRole) {
    if (!isUserAllowedToModify()) {
      alert("You do not have permission to perform this action.");
      return;
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: newRole }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update user role");
        }

        const updatedUser = await response.json();
        console.log("User role updated:", updatedUser);
      } catch (error) {
        console.error("Failed to change user role:", error);
      }
    }
  }

  async function deleteUser(userId) {
    if (!isUserAllowedToModify()) {
      alert("You do not have permission to perform this action.");
      return;
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  }
  async function editProduct(productId) {
    if (!isUserAllowedToModify()) {
      alert("You do not have permission to perform this action.");
      return;
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const product = await response.json();

        // Populate the edit form with product data
        document.getElementById("edit-product-name").value = product.name;
        document.getElementById("edit-product-description").value =
          product.description;
        document.getElementById("edit-product-price").value = product.price;
        document.getElementById("edit-product-stock").value = product.stock;
        document.getElementById("edit-options").value = product.category;
        document.getElementById("edit-options2").value = product.brand;

        // Show the edit form
        document.getElementById("edit-product-form").classList.remove("hidden");

        // Set up the save button
        document
          .getElementById("save-product-btn")
          .addEventListener("click", function () {
            saveProductChanges(productId);
          });
        document
          .getElementById("nvm-product-btn")
          .addEventListener("click", function () {
            document
              .getElementById("edit-product-form")
              .classList.add("hidden");
          });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
  }

  async function delProduct(productId) {
    if (!isUserAllowedToModify()) {
      alert("You do not have permission to perform this action.");
      return;
    } else {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        } else {
          alert("Product deleted successfully!");
          fetchProducts(); // Refresh the product list
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  }
  async function saveProductChanges(productId) {
    const updatedProduct = {
      name: document.getElementById("edit-product-name").value,
      description: document.getElementById("edit-product-description").value,
      price: document.getElementById("edit-product-price").value,
      stock: document.getElementById("edit-product-stock").value,
      category: document.getElementById("edit-options").value,
      brand: document.getElementById("edit-options2").value,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProductData = await response.json();
      console.log("Product updated successfully:", updatedProductData);

      // Hide the edit form and refresh the product list
      document.getElementById("edit-product-form").classList.add("hidden");
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product changes:", error);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }

  function displayProducts(products) {
    const productsList = document.getElementById("products-list");
    productsList.innerHTML = products
      .map(
        (product) => `
<div class="product-card">
<img src="${product.productlink}" alt="${product.name}" style="width:100px; height:100px; object-fit:cover;"/>
<div class="product-details">
  <label>Name:</label>
  <input type="text" value="${product.name}" disabled/><br/>
  <label>Description:</label>
  <input type="text" value="${product.description}" disabled/><br/>
  <label>Price:</label>
  <input type="text" value="${product.price}" disabled/><br/>
  <label>Stock:</label>
  <input type="text" value="${product.stock}" disabled/><br/>
  <label>Category:</label>
  <input type="text" value="${product.category}" disabled/><br/>
  <label>Brand:</label>
  <input type="text" value="${product.brand}" disabled/><br/>
</div>
<button class="edit-product-btn" data-id="${product._id}">Edit</button>
<button class="delete-product-btn" data-id="${product._id}">Delete</button>
</div>`
      )
      .join("");

    document.querySelectorAll(".edit-product-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        editProduct(productId);
      });
    });
    document.querySelectorAll(".delete-product-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const productId = this.getAttribute("data-id");
        delProduct(productId);
        fetchProducts();
      });
    });
  }

  // Initial fetch of products
  fetchProducts();
  async function saveProductChanges(productId) {
    const updatedProduct = {
      name: document.getElementById("edit-product-name").value,
      description: document.getElementById("edit-product-description").value,
      price: document.getElementById("edit-product-price").value,
      stock: document.getElementById("edit-product-stock").value,
      category: document.getElementById("edit-options").value,
      brand: document.getElementById("edit-options2").value,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProduct),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      // Hide the product form and refresh the product list
      document.getElementById("product-form").classList.add("hidden");
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product changes:", error);
    }
  }

  async function fetchCompletedOrders() {
    console.log("hello");
    try {
      const response = await fetch("http://localhost:5000/api/orders");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const orders = await response.json();
      console.log(orders);

      // Filter orders that have status "completed"
      const completedOrders = orders.filter(
        (order) => order.status === "Completed"
      );

      displayCompletedOrders(completedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }

  function displayCompletedOrders(orders) {
    const ordersList = document.getElementById("orders-completed-list");
    ordersList.innerHTML = orders
      .filter((order) => order.status === "Completed") // Only show non-completed orders
      .map(
        (order, index) => `
        <div class="order-card">
        <h3>order id: ${order.orderId}</h3>
        <h3>Order by: ${order.user.firstName} ${order.user.lastName}</h3>
          <div class="order-details">
            <strong>Email:</strong> ${order.user.email}<br/>
            <strong>Address:</strong> ${order.user.address}, ${
          order.user.city
        }, ${order.user.state} - ${order.user.postalCode}<br/>
        <strong>Phone:</strong> ${order.user.phone}<br/>
            <strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleString()}
          </div>
          <div class="order-products">
            <strong>Products:</strong>
            <ul>
            ${order.products
              .map(
                (product) => `
                  <li>
                  <img src="${product.image}" alt="${product.name}" style="width:50px; height:50px; object-fit:cover;"/>
                    ${product.name} - PKR ${product.price} x ${product.quantity}
                  </li>`
              )
              .join("")}
                </ul>
                </div>
                <div class="order-footer">
            <strong>Total Amount:</strong> PKR ${order.totalAmount}<br/>
            <strong>Order Notes:</strong> ${order.orderNotes || "None"} <br/>
            Status: ${order.status}
            </div>
        </div>
      `
      )
      .join("");
  }
  async function fetchOrders() {
    try {
      const response = await fetch("http://localhost:5000/api/orders");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const orders = await response.json();
      displayOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }
  function displayOrders(orders) {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = orders
      .filter((order) => order.status !== "Completed") // Only show non-completed orders
      .map(
        (order, index) => `
        <div class="order-card">
        <h3>order id: ${order.orderId}</h3>
          <h3>Order by: ${order.user.firstName} ${order.user.lastName}</h3>
          <div class="order-details">
            <strong>Email:</strong> ${order.user.email}<br/>
            <strong>Address:</strong> ${order.user.address}, ${
          order.user.city
        }, ${order.user.state} - ${order.user.postalCode}<br/>
            <strong>Phone:</strong> ${order.user.phone}<br/>
            <strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleString()}
          </div>
          <div class="order-products">
            <strong>Products:</strong>
            <ul>
              ${order.products
                .map(
                  (product) => `
                  <li>
                    <img src="${product.image}" alt="${product.name}" style="width:50px; height:50px; object-fit:cover;"/>
                    ${product.name} - PKR ${product.price} x ${product.quantity}
                  </li>`
                )
                .join("")}
            </ul>
          </div>
          <div class="order-footer">
            <strong>Total Amount:</strong> PKR ${order.totalAmount}<br/>
            <strong>Order Notes:</strong> ${order.orderNotes || "None"} <br/>
            Status: ${order.status}
          </div>
                <button class="delete-order-btn" data-order-id="${
                  order._id
                }" onclick="deleteOrder('${order._id}', ${index})">
          Cancel Order
        </button>
          ${
            order.status === "Pending"
              ? `<button class="accept-order-btn" id="aob" data-order-id="${order._id}" data-index="${index}">Accept Order</button>`
              : ""
          }
          <button class="complete-order-btn" id="cob" data-order-id="${
            order._id
          }">order completed</button>
        </div>
      `
      )
      .join("");
    document.querySelectorAll(".accept-order-btn").forEach((button, index) => {
      button.addEventListener("click", function () {
        const orderId = this.getAttribute("data-order-id");
        acceptOrder(orderId, index);
      });
    });

    // Add event listeners for complete order buttons
    document.querySelectorAll(".complete-order-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const orderId = this.getAttribute("data-order-id");
        completeOrder(orderId);
      });
    });
  }

  async function completeOrder(orderId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        alert("Order marked as completed successfully!");
        fetchOrders(); // Reload the orders after completion
      } else {
        alert("Failed to complete the order: " + data.message);
      }
    } catch (error) {
      console.error("Error completing order:", error);
      alert("An error occurred while trying to complete the order.");
    }
  }

  document
    .getElementById("add-product-btn")
    .addEventListener("click", async function () {
      if (!isUserAllowedToModify()) {
        alert("You do not have permission to perform this action.");
        return;
      } else {
        const name = document.getElementById("product-name").value;
        const description = document.getElementById(
          "product-description"
        ).value;
        const price = document.getElementById("product-price").value;
        const stock = document.getElementById("product-stock").value;
        // const link = document.getElementById("product-link").value;
        const imageUpload = document.getElementById("imageUpload").files[0]; // Get the selected file

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("stock", stock);
        // formData.append("productlink", link);
        formData.append("category", document.getElementById("options").value);
        formData.append("brand", document.getElementById("options2").value);
        formData.append("image", imageUpload); // Append the image file

        try {
          const response = await fetch("http://localhost:5000/api/products", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to create product");
          }

          const newProduct = await response.json();
          fetchProducts(); // Refresh the product list
        } catch (error) {
          console.error("Failed to add product:", error);
        }
      }
    });

  // Add User Form Submission
  document
    .getElementById("add-user-btn")
    .addEventListener("click", async function () {
      if (!isUserAllowedToModify()) {
        alert("You do not have permission to perform this action.");
        return;
      } else {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;
        const city = document.getElementById("city").value;
        const province = document.getElementById("province").value;
        const address = document.getElementById("address").value;
        const pcode = document.getElementById("pcode").value;
        const contact = document.getElementById("contact").value;
        const role = document.getElementById("user-role").value;

        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        const userData = {
          name,
          email,
          password,
          city,
          province,
          address,
          pcode,
          contact,
          role,
        };

        try {
          const response = await fetch(
            "http://localhost:5000/api/users/manual-create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message); // Catch server-side error messages
          }

          console.log("New user added:", result);
          fetchUsers(); // Refresh the user list
          document.getElementById("add-user-form").reset(); // Clear form
        } catch (error) {
          alert(error.message); // Display the error message from the backend
          console.error("Failed to add user:", error);
        }
      }
    });
});
