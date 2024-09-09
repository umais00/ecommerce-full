document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/login.html"; // Redirect to login if not authenticated
    return;
  }

  // Fetch user info
  fetch("http://localhost:5000/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((user) => {
      document.getElementById("username").textContent = user.name;
      document.getElementById("user-name").textContent = user.name;
      document.getElementById("user-email").textContent = user.email;
      document.getElementById("user-address").textContent = user.address;
      document.getElementById("user-contact").textContent = user.contact;
      document.getElementById("user-city").textContent = user.city;
      document.getElementById("user-province").textContent = user.province;
      document.getElementById("user-pcode").textContent = user.pcode;

      // Check if the user is an admin
      const isAdmin = user.role == "admin" || user.role == "editor";
      if (isAdmin) {
        const button = document.createElement("button"); // Create the button element
        button.textContent = "Admin Panel"; // Set the button text
        button.style.marginTop = "20px"; // Add styling if necessary
        console.log(button);
        const anchor = document.getElementById("forAdmin"); // Get the anchor element
        console.log(anchor);
        anchor.appendChild(button); // Append the button to the anchor tag
      }

      // Pre-fill the form for editing
      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("address").value = user.address;
      document.getElementById("contact").value = user.contact;
      document.getElementById("city").value = user.city;
      document.getElementById("province").value = user.province;
      document.getElementById("pcode").value = user.pcode;
    })
    .catch((error) => console.error("Error fetching user data:", error));

  // Toggle edit form visibility
  document.getElementById("edit-btn").addEventListener("click", () => {
    const editForm = document.getElementById("edit-form");
    editForm.classList.toggle("active");
  });
  // Toggle edit form visibility
  document.getElementById("cancel-btn").addEventListener("click", () => {
    const editForm = document.getElementById("edit-form");
    editForm.classList.toggle("active");
  });

  document.getElementById("edit-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("pfp");
    const file = fileInput.files[0];

    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("File size exceeds 5MB. Please choose a smaller file.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("contact", document.getElementById("contact").value);
    formData.append("city", document.getElementById("city").value);
    formData.append("province", document.getElementById("province").value);
    formData.append("pcode", document.getElementById("pcode").value);
    if (file) {
      formData.append("pfp", file);
    }

    fetch("http://localhost:5000/api/users/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert("User updated successfully");
        // Update the displayed info
        document.getElementById("user-name").textContent =
          document.getElementById("name").value;
        document.getElementById("user-email").textContent =
          document.getElementById("email").value;
        document.getElementById("user-address").textContent =
          document.getElementById("address").value;
        document.getElementById("user-contact").textContent =
          document.getElementById("contact").value;
        document.getElementById("user-city").textContent =
          document.getElementById("city").value;
        document.getElementById("user-province").textContent =
          document.getElementById("province").value;
        document.getElementById("user-pcode").textContent =
          document.getElementById("pcode").value;
        document.getElementById("edit-form").classList.remove("active"); // Hide form
      })
      .catch((error) => console.error("Error updating user data:", error));
  });
});
