// ==========================================
// AIRPRO APP.JS - MOCK E-COMMERCE LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const authModal = document.getElementById("authModal");
    const btnAccount = document.getElementById("btnAccount");
    const btnCloseModal = document.getElementById("btnCloseModal");
    
    const cartFormWindow = document.getElementById("cartFormWindow");
    const loginFormWindow = document.getElementById("loginFormWindow");
    const registerFormWindow = document.getElementById("registerFormWindow");
    
    const linkToRegister = document.getElementById("linkToRegister");
    const linkToLogin = document.getElementById("linkToLogin");
    
    const formLogin = document.getElementById("formLogin");
    const formRegister = document.getElementById("formRegister");
    
    const userStatusBar = document.getElementById("userStatusBar");
    const statusUsername = document.getElementById("statusUsername");
    const btnLogout = document.getElementById("btnLogout");
    
    const cartCount = document.getElementById("cartCount");
    const btnCart = document.getElementById("btnCart");
    const btnAddToCartList = document.querySelectorAll(".btn-add-to-cart");

    // Elements inside Cart Window
    const cartItemsList = document.getElementById("cartItemsList");
    const cartTotalPrice = document.getElementById("cartTotalPrice");
    const btnCheckoutSubmit = document.getElementById("btnCheckoutSubmit");
    const authNoticeText = document.getElementById("authNoticeText");
    const authNoticeTextReg = document.getElementById("authNoticeTextReg");

    // --- State Initialization from LocalStorage ---
    let currentUser = JSON.parse(localStorage.getItem("airpro_logged_user")) || null;
    let cart = JSON.parse(localStorage.getItem("airpro_cart")) || [];

    // --- Initialize UI Status ---
    updateUserUI();
    updateCartUI();

    // ==========================================
    // MULTI-WINDOW TOGGLE FUNCTIONS
    // ==========================================
    function closeAllWindows() {
        cartFormWindow.style.display = "none";
        loginFormWindow.style.display = "none";
        registerFormWindow.style.display = "none";
    }

    function showLoginWindow(isRequiredNotice = false) {
        closeAllWindows();
        authNoticeText.style.display = isRequiredNotice ? "block" : "none";
        loginFormWindow.style.display = "block";
    }

    function showRegisterWindow(isRequiredNotice = false) {
        closeAllWindows();
        authNoticeTextReg.style.display = isRequiredNotice ? "block" : "none";
        registerFormWindow.style.display = "block";
    }

    function showCartWindow() {
        closeAllWindows();
        renderCartDOM();
        cartFormWindow.style.display = "block";
    }

    // ==========================================
    // 1. AUTHENTICATION LOGIC (LOGIN & REGISTER)
    // ==========================================

    // Open Account Modal
    btnAccount.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentUser) {
            alert(`Anda sudah masuk sebagai ${currentUser.name}.`);
            return;
        }
        showLoginWindow(false);
        authModal.style.display = "flex";
    });

    // Close Modal
    btnCloseModal.addEventListener("click", () => {
        authModal.style.display = "none";
    });

    // Toggle Link inside Modals
    linkToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        showRegisterWindow(false);
    });

    linkToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        showLoginWindow(false);
    });

    // Handle Registration Submit
    formRegister.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPassword").value;

        let users = JSON.parse(localStorage.getItem("airpro_users")) || [];
        
        const userExists = users.some(u => u.email === email);
        if (userExists) {
            alert("Email sudah terdaftar! Silakan gunakan email lain.");
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem("airpro_users", JSON.stringify(users));

        formRegister.reset();
        // Otomatis arahkan ke login setelah daftar
        showLoginWindow(false);
    });

    // Handle Login Submit
    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        let users = JSON.parse(localStorage.getItem("airpro_users")) || [];
        const validUser = users.find(u => u.email === email && u.password === password);

        if (validUser) {
            currentUser = { name: validUser.name, email: validUser.email };
            localStorage.setItem("airpro_logged_user", JSON.stringify(currentUser));
            
            formLogin.reset();
            updateUserUI();

            // Logika Pintar: Jika di dalam keranjang ada barang, setelah login langsung lempar ke jendela Keranjang!
            if (cart.length > 0) {
                showCartWindow();
            } else {
                authModal.style.display = "none";
            }
        } else {
            alert("Email atau Password salah!");
        }
    });

    // Handle Logout
    btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem("airpro_logged_user");
        updateUserUI();
    });

    function updateUserUI() {
        if (currentUser) {
            userStatusBar.style.display = "block";
            statusUsername.textContent = currentUser.name;
        } else {
            userStatusBar.style.display = "none";
            statusUsername.textContent = "Guest";
        }
    }

    // ==========================================
    // 2. SHOPPING CART & CHECKOUT LOGIC
    // ==========================================

    // Handle Add to Cart Click
    btnAddToCartList.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            
            const card = e.target.closest(".product-card");
            const productId = card.getAttribute("data-id");
            const productName = card.getAttribute("data-name");
            const productPrice = parseInt(card.getAttribute("data-price"));

            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                });
            }

            localStorage.setItem("airpro_cart", JSON.stringify(cart));
            updateCartUI();

            // Efek feedback tombol kecil
            const originalText = e.target.textContent;
            e.target.textContent = "✓ DITAMBAHKAN";
            e.target.style.backgroundColor = "#28a745";
            e.target.style.color = "white";
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.backgroundColor = "";
                e.target.style.color = "";
            }, 1000);
        });
    });

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Fungsi menggambar daftar belanja di dalam modal HTML secara dinamis
    // Fungsi menggambar daftar belanja di dalam modal HTML secara dinamis dengan gaya Bro.do
    function renderCartDOM() {
        cartItemsList.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = "<p style='text-align:center; color:#888; font-size:13px; letter-spacing:1px; padding: 20px 0;'>KERANJANG ANDA KOSONG</p>";
            cartTotalPrice.textContent = "Rp 0";
            return;
        }

        cart.forEach(item => {
            const subTotal = item.price * item.quantity;
            total += subTotal;

            const itemRow = document.createElement("div");
            itemRow.className = "cart-item-row"; // Memakai class style.css yang baru
            itemRow.innerHTML = `
                <div>
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-qty">x${item.quantity}</span>
                </div>
                <div class="cart-item-price">Rp ${subTotal.toLocaleString('id-ID')}</div>
            `;
            cartItemsList.appendChild(itemRow);
        });

        cartTotalPrice.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    // KLIK ICON KERANJANG DI HEADER
    btnCart.addEventListener("click", (e) => {
        e.preventDefault();
        
        // 1. Jika User BELUM LOGIN, langsung arahkan ke Window Registrasi (Sesuai Request Anda)
        if (!currentUser) {
            showRegisterWindow(true); // Parameter true mengaktifkan notice "Silakan buat akun"
            authModal.style.display = "flex";
            return;
        }

        // 2. Jika USER SUDAH LOGIN, tampilkan struktur rincian belanja di dalam modal
        showCartWindow();
        authModal.style.display = "flex";
    });

    // SELESAIKAN TRANSAKSI (DARI DALAM MODAL)
    btnCheckoutSubmit.addEventListener("click", () => {
        if (cart.length === 0) return;
        
        alert("Simulasi Transaksi Berhasil! Terima kasih telah membeli produk AirPro.");
        cart = [];
        localStorage.removeItem("airpro_cart");
        updateCartUI();
        authModal.style.display = "none";
    });
});