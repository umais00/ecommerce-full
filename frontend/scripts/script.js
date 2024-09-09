document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

// Initialize the application
function initializeApp() {
  const userData = checkLoginStatus();
  updateItemNumber();
  loadCartItems();
  setupEventListeners();
  calculateSubtotal();
  copyMenu();
  fetchAndDisplayUserImage(userData);
  setupToggles();
  setupCheckoutForm();
}

// Function to check login status and update UI accordingly
function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const loginElement = document.getElementById("login");
  const signupElement = document.getElementById("signup");
  const myAccountElement = document.getElementById("myAccount");
  const myOrdersElement = document.getElementById("myOrders");

  if (!token) {
    showLoginUI(loginElement, signupElement, myAccountElement, myOrdersElement);
    return null;
  }

  return fetchUserProfile(token)
    .then((data) => {
      if (data && data._id) {
        hideLoginUI(
          loginElement,
          signupElement,
          myAccountElement,
          myOrdersElement
        );
        updateUsernameDisplay(data.name);
        return data;
      } else {
        handleSessionExpired(
          loginElement,
          signupElement,
          myAccountElement,
          myOrdersElement
        );
        return null;
      }
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
      handleSessionExpired(
        loginElement,
        signupElement,
        myAccountElement,
        myOrdersElement
      );
      return null;
    });
}

// Function to fetch user profile
function fetchUserProfile(token) {
  return fetch("http://localhost:5000/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
}

// Function to show login UI elements
function showLoginUI(
  loginElement,
  signupElement,
  myAccountElement,
  myOrdersElement
) {
  loginElement.style.display = "block";
  signupElement.style.display = "block";
  myAccountElement.style.display = "none";
  myOrdersElement.style.display = "none";
}

// Function to hide login UI elements
function hideLoginUI(
  loginElement,
  signupElement,
  myAccountElement,
  myOrdersElement
) {
  loginElement.style.display = "none";
  signupElement.style.display = "none";
  myAccountElement.style.display = "block";
  myOrdersElement.style.display = "block";
}

// Handle session expiration
function handleSessionExpired(loginElement, signupElement, myAccountElement) {
  showLoginUI(loginElement, signupElement, myAccountElement, myOrdersElement);
  localStorage.clear();
  alert("Session expired, please log in again.");
}

// Update username display
function updateUsernameDisplay(username) {
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.innerText = username;
  }
}

// Fetch and display user's profile image
function fetchAndDisplayUserImage() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://localhost:5000/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((userData) => {
      if (!userData || !userData.image) {
        console.error("User data or image is missing.");
        return;
      }

      // Continue with image processing if data is present
      const userImage = userData.image;
      if (userImage.data && userImage.contentType) {
        const base64Image = arrayBufferToBase64(
          new Uint8Array(userImage.data.data).buffer,
          userImage.contentType
        );

        const userElement = document.getElementById("user");
        if (userElement) {
          userElement.style.backgroundImage = `url(${base64Image})`;
          userElement.style.backgroundSize = "cover";
          userElement.style.backgroundPosition = "center";
        } else {
          console.error("User element not found.");
        }
      } else {
        console.error("Invalid user image data.");
      }
    })
    .catch((error) => console.error("Error fetching user data:", error));
}

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer, contentType) {
  const byteArray = new Uint8Array(buffer);
  let binary = "";
  const len = byteArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(byteArray[i]);
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

// Setup all toggle functionalities
function setupToggles() {
  const siteElement = document.querySelector(".site");

  // Generic toggle function
  const toggleElement = (triggerSelector, toggleClass) => {
    const trigger = document.querySelector(triggerSelector);
    if (trigger) {
      trigger.addEventListener("click", () => {
        siteElement.classList.toggle(toggleClass);
      });
    }
  };

  toggleElement(".trigger", "showmenu");
  toggleElement(".t-search", "showsearch");
  toggleElement(".dpt-cat .dpt-trigger", "showdpt");

  // Setup mini cart toggle separately due to unique behavior
  setupMiniCartToggle();
}

// Setup mini cart toggle functionality
function setupMiniCartToggle() {
  const miniCartSelector = ".mini-cart";
  const miniCartElement = document.querySelector(miniCartSelector);
  const cartTrigger = document.querySelector(".cart-trigger");

  cartTrigger.addEventListener("click", () => {
    setTimeout(() => {
      if (!miniCartElement.classList.contains("show")) {
        miniCartElement.classList.add("show");
      }
    }, 250);
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(miniCartSelector) &&
      miniCartElement.classList.contains("show")
    ) {
      miniCartElement.classList.remove("show");
    }
  });
}

// Copy menu content for mobile/off-canvas view
function copyMenu() {
  const copyContent = (sourceSelector, targetSelector) => {
    const source = document.querySelector(sourceSelector);
    const target = document.querySelector(targetSelector);
    if (source && target) {
      target.innerHTML = source.innerHTML;
    }
  };

  copyContent(".dpt-cat", ".departments");
  copyContent(".header-nav nav", ".off-canvas nav");
  copyContent(".header-top .wrapper", ".off-canvas .thetop-nav");
}

// Initialize cart variables
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let itemNum = parseInt(localStorage.getItem("itemNum")) || 0;

// Update displayed item number in cart
function updateItemNumber() {
  const itemNumberElement = document.getElementById("itemnumber");
  if (itemNumberElement) {
    itemNumberElement.textContent = itemNum;
  }
  localStorage.setItem("itemNum", itemNum);
}

// Add item to cart
function addToCart(buttonElement) {
  if (!buttonElement) return;

  const itemContainer = buttonElement.closest(".item");
  if (itemContainer) {
    const productName = itemContainer
      .querySelector(".main-links a")
      ?.textContent.trim();
    const productImage = itemContainer.querySelector(".product-image")?.src;
    const productPriceElement = itemContainer.querySelector("#current");
    const productId = itemContainer.dataset.productId; // Extract product ID

    if (productName && productImage && productPriceElement && productId) {
      const productPrice = parseFloat(
        productPriceElement.textContent.replace(/[^0-9.-]+/g, "")
      );

      const existingProduct = cart.find((item) => item.id === productId);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          id: productId, // Include product ID
          name: productName,
          image: productImage,
          price: productPrice,
          quantity: 1,
        });
        itemNum++;
      }

      updateItemNumber();
      localStorage.setItem("cart", JSON.stringify(cart));
      showAlert(`${productName} has been added to your cart.`);
    } else {
      console.error("Product name, image, price, or ID not found.");
    }
  } else {
    console.error("Item container not found.");
  }
}

// Load cart items into DOM
function loadCartItems() {
  const tbody = document.getElementById("tbody");
  const checkoutProd = document.getElementById("checkoutprod");

  if (!tbody && !checkoutProd) return;

  const clearElement = (element) => {
    if (element) element.innerHTML = "";
  };

  clearElement(tbody);
  clearElement(checkoutProd);

  if (cart.length > 0) {
    cart.forEach((item, index) => {
      if (tbody) addItemToCartTable(item, index, tbody);
      if (checkoutProd) addItemToCheckoutSummary(item, checkoutProd);
    });
  } else {
    displayEmptyCartMessage(tbody);
  }

  calculateSubtotal();
}

// Add item to cart table
function addItemToCartTable(item, index, tbody) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="flexitem">
      <div class="thumbnail object-cover">
        <a href="#"><img src="${item.image}" alt="${item.name}" /></a>
      </div>
      <div class="content">
        <strong><a href="#">${item.name}</a></strong>
      </div>
    </td>
    <td>PKR ${item.price.toFixed(2)}</td>
    <td>
      <div class="qty-control flexitem">
        <button class="minus" data-index="${index}">-</button>
        <input type="number" disabled value="${
          item.quantity
        }" min="1" data-index="${index}" />
        <button class="plus" data-index="${index}">+</button>
      </div>
    </td>
    <td>PKR ${(item.price * item.quantity).toFixed(2)}</td>
    <td>
        <i  style="cursor: pointer;" class="item-remove ri-close-line" data-index="${index}" ></i>
    </td>
  `;

  tbody.appendChild(row);
}

// Add item to checkout summary
function addItemToCheckoutSummary(item, checkoutProd) {
  const listItem = document.createElement("li");
  listItem.className = "item";

  listItem.innerHTML = `
    <div class="thumbnail object-cover">
      <a href="#"><img src="${item.image}" alt="${item.name}" /></a>
    </div>
    <div class="item-content">
      <p>${item.name}</p>
      <span class="price">PKR ${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `;

  checkoutProd.appendChild(listItem);
}

// Display message when cart is empty
function displayEmptyCartMessage(tbody) {
  if (tbody) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5">
        <p>Your cart is empty. Add items to the cart to see them here.</p>
      </td>
    `;
    tbody.appendChild(emptyRow);
  }
}

// Calculate and display cart subtotal
function calculateSubtotal() {
  const subtotalElement = document.getElementById("price");
  const totalElement = document.getElementById("total");
  const ttElement = document.getElementById("tt");
  const totl = document.getElementById("cart-totl");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  let total = subtotal + 200;

  if (ttElement) {
    ttElement.textContent = `${total.toFixed(2)}`;
  } else if (totalElement && subtotalElement) {
    totalElement.textContent = `${total.toFixed(2)}`;
    subtotalElement.textContent = `${subtotal.toFixed(2)}`;
  }
  if (totl) {
    totl.textContent = `PKR ${total.toFixed(0)}`;
  }
}

// Remove item from cart
function removeFromCart(index) {
  console.log("Removing item at index:", index);
  cart.splice(index, 1);
  itemNum--;
  updateItemNumber();
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems();
}

// Update item quantity in cart
function updateItemQuantity(index, quantity) {
  if (quantity < 1) return;
  cart[index].quantity = quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartItems();
}

// Setup event listeners
function setupEventListeners() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("addtocart")) {
      addToCart(e.target);
    }

    if (e.target.classList.contains("minus")) {
      const index = parseInt(e.target.dataset.index);
      updateItemQuantity(index, cart[index].quantity - 1);
    }

    if (e.target.classList.contains("plus")) {
      const index = parseInt(e.target.dataset.index);
      updateItemQuantity(index, cart[index].quantity + 1);
    }

    if (e.target.classList.contains("item-remove")) {
      const index = parseInt(e.target.dataset.index);
      removeFromCart(index);
    }
  });
}

// Submit the checkout form
function setupCheckoutForm() {
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const totalAmount = parseFloat(localStorage.getItem("total")) || 0;

      // Populate hidden inputs with cart data
      document.getElementById("products").value = JSON.stringify(cart);
      document.getElementById("totalAmount").value = totalAmount.toFixed(2);

      // Proceed with form submission or further processing
      // For example, you can send the data to your server here

      // Clear cart after successful order
      cart = [];
      itemNum = 0;
      updateItemNumber();
      localStorage.removeItem("cart");
      loadCartItems();
    });
  }
}

function showAlert(message) {
  const alertBox = document.getElementById("alert-box");
  alertBox.textContent = message;
  alertBox.classList.add("show-alert");

  // Remove the alert after 3 seconds
  setTimeout(() => {
    alertBox.classList.remove("show-alert");
  }, 1400);
}
