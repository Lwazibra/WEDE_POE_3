// ====================================================
//  VHASHUMI INTERN CAFÉ – COMPLETE JAVASCRIPT SYSTEM
//  Works on ALL pages | Sends EVERY transaction to Order Page
//  Created for Lwazi Mkhonto – ST10476467
// ====================================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("Vhashumi Café Full System Active");

    // ================== GLOBAL SEARCH ==================
    window.performSearch = function () {
        const query = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
        const map = {
            home: "index.html", print: "print.html", tshirt: "printt.html", "t-shirt": "printt.html",
            repair: "repair.html", internet: "internetS.html", deposit: "payment.html", pay: "payment.html",
            order: "Order page.html", orders: "Order page.html", history: "Order page.html",
            contact: "contact us.html", about: "About us.html"
        };
        for (let [key, url] of Object.entries(map)) {
            if (query.includes(key)) {
                window.location.href = url;
                return;
            }
        }
        alert("Try: print, tshirt, repair, internet, deposit, order");
    };
    document.getElementById("searchInput")?.addEventListener("keypress", e => e.key === "Enter" && performSearch());

    // ================== USER SYSTEM ==================
    const user = JSON.parse(localStorage.getItem("vhashumiUser") || "{}");
    if (localStorage.getItem("isLoggedIn") === "true" && user.name) {
        document.querySelectorAll(".user-greeting, .user-name").forEach(el => {
            el.innerHTML = `Welcome back, <strong>${user.name.split(" ")[0]}</strong> | <a href="#" onclick="logout()" style="color:#FF6B35">Logout</a>`;
        });
    }
    window.logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("vhashumiUser");
        alert("Logged out successfully!");
        location.href = "index.html";
    };

    // ================== WALLET SYSTEM ==================
    function updateBalanceDisplay() {
        const balanceEls = document.querySelectorAll("#currentBalance, .wallet-balance");
        const balance = parseFloat(localStorage.getItem("vhashumiBalance") || "0");
        balanceEls.forEach(el => el.textContent = "R" + balance.toFixed(2));
    }
    updateBalanceDisplay();

    // Quick deposit buttons
    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".quick-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById("amount").value = btn.dataset.amount;
        });
    });

    // Deposit function
    window.deposit = function () {
        const amount = parseFloat(document.getElementById("amount")?.value || 0);
        if (amount < 10) {
            alert("Minimum deposit is R10");
            return;
        }
        let balance = parseFloat(localStorage.getItem("vhashumiBalance") || "0") + amount;
        localStorage.setItem("vhashumiBalance", balance.toFixed(2));

        // SAVE DEPOSIT TO ORDER HISTORY
        saveOrder({
            type: "Wallet Deposit",
            service: "Top-Up",
            amount: amount,
            total: amount,
            status: "Completed",
            timestamp: new Date().toLocaleString()
        });

        alert(`R${amount} added! New balance: R${balance.toFixed(2)}`);
        updateBalanceDisplay();
        document.getElementById("amount").value = "";
    };

    // ================== SAVE ORDER FUNCTION (Centralized) ==================
    window.saveOrder = function (order) {
        let orders = JSON.parse(localStorage.getItem("vhashumiOrders") || "[]");
        order.id = Date.now();
        order.timestamp = new Date().toLocaleString();
        orders.unshift(order); // newest first
        localStorage.setItem("vhashumiOrders", JSON.stringify(orders));
        console.log("Order saved:", order);
    };

    // ================== ORDER HISTORY PAGE – FULLY WORKING ==================
    if (document.getElementById("order-history")) {
        const container = document.getElementById("order-history");
        const orders = JSON.parse(localStorage.getItem("vhashumiOrders") || "[]");

        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#666;">
                    <h3>No orders yet</h3>
                    <p>Start by printing, booking internet, or topping up your wallet!</p>
                </div>`;
            return;
        }

        let html = `<div style="background:white; border-radius:15px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">`;
        orders.forEach(order => {
            const statusColor = order.status === "Completed" ? "#4CAF50" : "#FF6B35";
            html += `
                <div style="padding:20px; border-bottom:1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="font-size:1.3rem; color:#8B4513">${order.service || order.type}</strong><br>
                            <small style="color:#666">${order.timestamp}</small>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.5rem; font-weight:bold; color:${statusColor}">
                                R${parseFloat(order.total || order.amount || 0).toFixed(2)}
                            </div>
                            <span style="background:${statusColor}; color:white; padding:5px 12px; border-radius:20px; font-size:0.8rem;">
                                ${order.status || "Pending"}
                            </span>
                        </div>
                    </div>
                    ${order.details ? `<p style="margin-top:10px; color:#444">${order.details}</p>` : ""}
                </div>`;
        });
        html += `</div>
                 <button onclick="clearAllOrders()" style="margin-top:20px; padding:12px 30px; background:#e74c3c; color:white; border:none; border-radius:50px; cursor:pointer;">
                    Clear All History
                 </button>`;
        container.innerHTML = html;
    }

    window.clearAllOrders = function () {
        if (confirm("Delete ALL order history? This cannot be undone.")) {
            localStorage.removeItem("vhashumiOrders");
            location.reload();
        }
    };

    // ================== T-SHIRT PRINTING – FULLY WORKING ==================
    if (document.getElementById("tshirtForm")) {
        const basePrices = { front: 120, back: 120, both: 200 };
        function updateTshirtPrice() {
            const loc = document.getElementById("printLocation").value;
            const color = document.getElementById("color").value;
            const size = document.getElementById("size").value;
            const qty = parseInt(document.getElementById("quantity").value) || 1;

            let price = basePrices[loc] || 0;
            if (color === "black") price += 10;
            if (size === "XXL") price += 20;

            document.getElementById("totalPrice").textContent = "R" + (price * qty).toFixed(2);
        }

        document.querySelectorAll("#printLocation, #color, #size, #quantity").forEach(el => {
            el.addEventListener("change", updateTshirtPrice);
        });

        document.getElementById("designUpload").addEventListener("change", e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => document.getElementById("tshirt-preview").src = ev.target.result;
                reader.readAsDataURL(file);
            }
        });

        document.getElementById("tshirtForm").addEventListener("submit", e => {
            e.preventDefault();
            const total = document.getElementById("totalPrice").textContent;
            saveOrder({
                type: "T-Shirt Print",
                service: "Custom T-Shirt",
                details: `${document.getElementById("size").value} ${document.getElementById("color").value} – ${document.getElementById("printLocation").selectedOptions[0].text}`,
                total: parseFloat(total.replace("R", "")),
                status: "Order Placed"
            });
            alert("T-Shirt order saved! View in Order History");
            location.href = "Order page.html";
        });

        updateTshirtPrice();
    }

    // ================== REPAIR REQUEST – FULLY WORKING ==================
    if (document.getElementById("repairForm")) {
        function updateRepairCost() {
            const device = document.getElementById("device").value;
            const service = document.getElementById("service").value;
            const prices = {
                screen: { phone: 650, laptop: 1200 },
                battery: { phone: 350, laptop: 850 },
                charging: 400,
                software: 300,
                diagnostic: 150
            };
            let cost = prices[service]?.[device] || prices[service] || 250;
            document.getElementById("estimatedCost").textContent = "R" + cost;
        }

        document.querySelectorAll("#device, #service").forEach(el => el.addEventListener("change", updateRepairCost));

        document.getElementById("photo").addEventListener("change", e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = ev => {
                    document.getElementById("imagePreview").style.display = "block";
                    document.getElementById("previewImg").src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById("repairForm").addEventListener("submit", e => {
            e.preventDefault();
            const cost = document.getElementById("estimatedCost").textContent;
            saveOrder({
                type: "Repair",
                service: "Device Repair",
                details: `${document.getElementById("device").value} – ${document.getElementById("service").selectedOptions[0].text}`,
                total: parseFloat(cost.replace("R", "")),
                status: "Request Sent"
            });
            alert("Repair request sent! Check Order History");
            location.href = "Order page.html";
        });

        updateRepairCost();
    }

    console.log("Vhashumi Full System Ready – All Transactions Tracked!");
});