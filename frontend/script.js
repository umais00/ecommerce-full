document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
});

function checkLoginStatus() {
  const token = localStorage.getItem("token");

  const loginElement = document.getElementById("login");
  const signupElement = document.getElementById("signup");
  const myAccountElement = document.getElementById("myAccount");
  console.log(loginElement);
  if (token) {
    loginElement.setAttribute("style", "display: none !important; ");
    signupElement.setAttribute("style", "display: none !important;");
    myAccountElement.setAttribute("style", "display: block !important;");
  } else {
    loginElement.setAttribute("style", "display: block !important;");
    signupElement.setAttribute("style", "display: block !important;");
    myAccountElement.setAttribute("style", "display: none !important; ");
  }
  console.log("Token found:", !!token);
  console.log("Login element visibility:", loginElement.style.display);
  console.log("Signup element visibility:", signupElement.style.display);
  console.log("My Account element visibility:", myAccountElement.style.display);
}

// Initialize cart and itemNum from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let itemNum = parseInt(localStorage.getItem("itemNum")) || 0;
// Call the checkLoginStatus function on page load
function updateItemNumber() {
  const itemNumberElement = document.getElementById("itemnumber");

  // Ensure that the element exists before updating it
  if (itemNumberElement) {
    itemNumberElement.innerHTML = itemNum;
  } else {
    console.error("Element with ID 'itemnumber' not found.");
  }

  // Save the itemNum to localStorage
  localStorage.setItem("itemNum", itemNum);
}

// Function to check if the user is logged in
// Function to check if the user is logged in

// Call the checkLoginStatus function on page load
window.onload = function () {
  updateItemNumber(); // Update item number when the page loads
};

// Function to add an item to the cart
function addToCart(buttonElement) {
  if (!buttonElement) {
    console.error("Button element is undefined.");
    return;
  }

  const itemContainer = buttonElement.closest(".item");
  if (itemContainer) {
    const productName =
      itemContainer.querySelector(".main-links a")?.textContent;
    const productImage = itemContainer.querySelector(".product-image")?.src;
    const productPriceElement = itemContainer.querySelector("#current");

    if (productName && productImage && productPriceElement) {
      const productPrice = parseFloat(
        productPriceElement.textContent.replace(/[^0-9.-]+/g, "")
      );

      console.log("Product added to cart:", productName);
      console.log("Image link:", productImage);

      cart.push({
        name: productName,
        image: productImage,
        price: productPrice, // Store the numeric price.
      });

      itemNum++;
      updateItemNumber();

      // Save the updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      console.error("Product name, image, or price not found.");
    }
  } else {
    console.error("Item container not found.");
  }
}

// Function to calculate and display the subtotal
function calculateSubtotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cart.forEach((item) => {
    subtotal += item.price * (item.quantity || 1);
  });
  let total = subtotal + 200;

  // Update the subtotal in the DOM
  const subtotalElement = document.getElementById("price");
  const totalElement = document.getElementById("total");
  if (subtotalElement) {
    subtotalElement.textContent = subtotal.toFixed(2);
    totalElement.textContent = total.toFixed(2);
  } else {
    console.error("Subtotal element with ID 'subt' not found.");
  }
}

// checkout page
document.addEventListener("DOMContentLoaded", () => {
  // Load cart items from localStorage and display them
  loadCartItems();

  // Handle quantity changes and item removal
  document.getElementById("tbody").addEventListener("click", handleCartActions);
});

function loadCartItems() {
  const tbody = document.getElementById("tbody");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Clear existing rows
  tbody.innerHTML = "";

  // Generate rows for each cart item
  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    // Thumbnail and item name
    const thumbnailTd = document.createElement("td");
    thumbnailTd.className = "flexitem";
    thumbnailTd.innerHTML = `
      <div class="thumbnail object-cover">
        <a href="#"><img src="${item.image}" alt="" /></a>
      </div>
      <div class="content">
        <strong><a href="#">${item.name}</a></strong>
      </div>
    `;

    // Price
    const priceTd = document.createElement("td");
    priceTd.textContent = `PKR ${item.price.toFixed(2)}`;

    // Quantity control and total price
    const qtyControlTd = document.createElement("td");
    qtyControlTd.innerHTML = `
      <div class="qty-control flexitem">
        <button class="minus" data-index="${index}">-</button>
        <input type="text" value="${
          item.quantity || 1
        }" min="1" data-index="${index}" />
        <button class="plus" data-index="${index}">+</button>
      </div>
    `;

    const totalPriceTd = document.createElement("td");
    totalPriceTd.textContent = `PKR ${(
      item.price * (item.quantity || 1)
    ).toFixed(2)}`;

    // Remove button
    const removeTd = document.createElement("td");
    removeTd.innerHTML = `
      <a style="cursor: pointer;" class="item-remove" data-index="${index}">
        <i class="ri-close-line"></i>
      </a>
    `;

    // Append all cells to the row
    row.appendChild(thumbnailTd);
    row.appendChild(priceTd);
    row.appendChild(qtyControlTd);
    row.appendChild(totalPriceTd);
    row.appendChild(removeTd);

    // Append the row to the tbody
    tbody.appendChild(row);
  });

  // Calculate and display the subtotal
  calculateSubtotal();
}

function handleCartActions(event) {
  let target = event.target;

  // Check if the target is inside an "item-remove" button (or is the button itself)
  if (
    target.classList.contains("item-remove") ||
    target.closest(".item-remove")
  ) {
    event.preventDefault(); // Prevent the default link behavior

    // Get the closest element with the "item-remove" class
    if (!target.classList.contains("item-remove")) {
      target = target.closest(".item-remove");
    }

    const index = target.dataset.index;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Remove item from cart
    cart = cart.filter((_, i) => i !== parseInt(index));
    localStorage.setItem("cart", JSON.stringify(cart));

    // Decrease the item count and update the DOM
    itemNum--;
    updateItemNumber();

    // Reload cart items
    loadCartItems();
  }

  if (target.classList.contains("minus") || target.classList.contains("plus")) {
    const index = target.dataset.index;
    const input = document.querySelector(`input[data-index="${index}"]`);
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (target.classList.contains("minus") && input.value > 1) {
      input.value = parseInt(input.value) - 1;
    } else if (target.classList.contains("plus")) {
      input.value = parseInt(input.value) + 1;
    }

    // Update localStorage with new quantity
    cart[index].quantity = parseInt(input.value);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Recalculate total price for the row
    const totalPriceTd = input.closest("tr").querySelector("td:nth-child(4)");
    totalPriceTd.textContent = `PKR ${(
      cart[index].price * cart[index].quantity
    ).toFixed(2)}`;

    // Recalculate and display the subtotal
    calculateSubtotal();
  }
}

// The rest of your script remains unchanged

function copyMenu() {
  var dptCategory = document.querySelector(".dpt-cat");
  var dptPlace = document.querySelector(".departments");
  dptPlace.innerHTML = dptCategory.innerHTML;
  // copy inside nav to nav
  var mainNav = document.querySelector(".header-nav nav");
  var navPlace = document.querySelector(".off-canvas nav");
  navPlace.innerHTML = mainNav.innerHTML;
  ////
  var topNav = document.querySelector(".header-top .wrapper");
  var topPlace = document.querySelector(".off-canvas .thetop-nav");
  topPlace.innerHTML = topNav.innerHTML;
}
copyMenu();

const menuButton = document.querySelector(".trigger"),
  closeButton = document.querySelector(".t-close"),
  addclass = document.querySelector(".site");
menuButton.addEventListener("click", function () {
  addclass.classList.toggle("showmenu");
});
closeButton.addEventListener("click", function () {
  addclass.classList.remove("showmenu");
});

// show sub menu on mobile

const submenu = document.querySelectorAll(".has-child", ".icon-small");
submenu.forEach((menu) => menu.addEventListener("click", toggle));

function toggle(e) {
  e.preventDefault();
  submenu.forEach((item) =>
    item != this ? item.closest(".has-child").classList.remove("expand") : null
  );
  if (this.closest(".has-child").classList != "expand");
  this.closest(".has-child").classList.toggle("expand");
}

///slider
const swiper = new Swiper(".swiper", {
  loop: true,

  pagination: {
    el: ".swiper-pagination",
  },
});
// .search bottom

const searchButton = document.querySelector(".t-search"),
  tClose = document.querySelector(".search-close"),
  showClass = document.querySelector(".site");
searchButton.addEventListener("click", function () {
  showClass.classList.toggle("showsearch");
});
tClose.addEventListener("click", function () {
  showClass.classList.remove("showsearch");
});

const dptButton = document.querySelector(".dpt-cat .dpt-trigger"),
  dptClass = document.querySelector(".site");

dptButton.addEventListener("click", function () {
  dptClass.classList.toggle("showdpt");
});

var productThumb = new Swiper(".small-image", {
  loop: true,
  spaceBetween: 10,
  slidesPerView: 3,
  freeMode: true,
  watchSlidesProgress: true,
  breakpoints: {
    481: {
      spaceBetween: 32,
    },
  },
});
var productBig = new Swiper(".big-image", {
  loop: true,
  autoHeight: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  thumbs: {
    swiper: productThumb,
  },
});

var stocks = document.querySelectorAll(".products", ".stock");
for (let x = 0; x < stocks.length; x++) {
  let stock = stocks[x].dataset.stock,
    available = stocks[x].querySelector(".qty-available").innerHTML,
    sold = stocks[x].querySelector(".qty-sold").innerHTML,
    percent = (sold * 109) / stock;

  stocks[x].querySelector(".available").style.width = percent + "%";
}

const divtoShow = ".mini-cart";
const divPopup = document.querySelector(divtoShow);
const divTrigger = document.querySelector(".cart-trigger");

divTrigger.addEventListener("click", () => {
  setTimeout(() => {
    if (!divPopup.classList.contains("show")) {
      divPopup.classList.add("show");
    }
  }, 250);
});

document.addEventListener("click", (e) => {
  const isClosest = e.target.closest(divtoShow);
  if (!isClosest && divPopup.classList.contains("show")) {
    divPopup.classList.remove("show");
  }
});
