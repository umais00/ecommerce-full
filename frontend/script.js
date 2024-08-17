document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  updateItemNumber();
  loadCartItems();
  setupEventListeners();

  // Functions related to menu and search toggles
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
});

function checkLoginStatus() {
  const token = localStorage.getItem("token");
  const loginElement = document.getElementById("login");
  const signupElement = document.getElementById("signup");
  const myAccountElement = document.getElementById("myAccount");

  if (!token) {
    loginElement.style.display = "block";
    signupElement.style.display = "block";
    myAccountElement.style.display = "none";
    return;
  }

  // Fetch user profile using the token
  fetch("http://localhost:5000/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data._id) {
        // Token is valid, display the account options
        loginElement.style.display = "none";
        signupElement.style.display = "none";
        myAccountElement.style.display = "block";
        // You can also display user's name or other details
        document.getElementById("username").innerText = data.name;
      } else {
        // Token is invalid or expired
        localStorage.removeItem("token");
        loginElement.style.display = "block";
        signupElement.style.display = "block";
        myAccountElement.style.display = "none";
        localStorage.clear();
        alert("Session expired, please log in again.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      loginElement.style.display = "block";
      signupElement.style.display = "block";
      myAccountElement.style.display = "none";
    });
}

function updateItemNumber() {
  const itemNumberElement = document.getElementById("itemnumber");
  let itemNum = parseInt(localStorage.getItem("itemNum")) || 0;

  if (itemNumberElement) {
    itemNumberElement.innerHTML = itemNum;
  }

  localStorage.setItem("itemNum", itemNum);
}

function loadCartItems() {
  const tbody = document.getElementById("tbody");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!tbody) return;

  tbody.innerHTML = "";
  cart.forEach((item, index) => {
    const row = document.createElement("tr");

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

    const priceTd = document.createElement("td");
    priceTd.textContent = `PKR ${item.price.toFixed(2)}`;

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

    const removeTd = document.createElement("td");
    removeTd.innerHTML = `
      <a style="cursor: pointer;" class="item-remove" data-index="${index}">
        <i class="ri-close-line"></i>
      </a>
    `;

    row.appendChild(thumbnailTd);
    row.appendChild(priceTd);
    row.appendChild(qtyControlTd);
    row.appendChild(totalPriceTd);
    row.appendChild(removeTd);

    tbody.appendChild(row);
  });

  calculateSubtotal();
}

function calculateSubtotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cart.forEach((item) => {
    subtotal += item.price * (item.quantity || 1);
  });

  let total = subtotal + 200;

  const subtotalElement = document.getElementById("price");
  const totalElement = document.getElementById("total");

  if (subtotalElement) {
    subtotalElement.textContent = subtotal.toFixed(2);
    totalElement.textContent = total.toFixed(2);
  }
}

function setupEventListeners() {
  const tbody = document.getElementById("tbody");

  if (tbody) {
    tbody.addEventListener("click", handleCartActions);
  }
}

function handleCartActions(event) {
  let target = event.target;

  if (
    target.classList.contains("item-remove") ||
    target.closest(".item-remove")
  ) {
    event.preventDefault();
    if (!target.classList.contains("item-remove")) {
      target = target.closest(".item-remove");
    }

    const index = target.dataset.index;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((_, i) => i !== parseInt(index));
    localStorage.setItem("cart", JSON.stringify(cart));

    itemNum--;
    updateItemNumber();
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

    cart[index].quantity = parseInt(input.value);
    localStorage.setItem("cart", JSON.stringify(cart));

    const totalPriceTd = input.closest("tr").querySelector("td:nth-child(4)");
    totalPriceTd.textContent = `PKR ${(
      cart[index].price * cart[index].quantity
    ).toFixed(2)}`;

    calculateSubtotal();
  }
}

function copyMenu() {
  const dptCategory = document.querySelector(".dpt-cat");
  const dptPlace = document.querySelector(".departments");
  dptPlace.innerHTML = dptCategory.innerHTML;

  const mainNav = document.querySelector(".header-nav nav");
  const navPlace = document.querySelector(".off-canvas nav");
  navPlace.innerHTML = mainNav.innerHTML;

  const topNav = document.querySelector(".header-top .wrapper");
  const topPlace = document.querySelector(".off-canvas .thetop-nav");
  topPlace.innerHTML = topNav.innerHTML;
}
