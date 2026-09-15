/* =========================================================
   QUEEN DROPSHIP
   DASHBOARD - index.js
   ========================================================= */


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);

}


/* =========================================================
   ESCAPE HTML
   Mencegah data database menjadi HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   TANGGAL
   ========================================================= */

function updateDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileMenu() {

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    if (!mobileMenu || !sidebar) {
        return;
    }

    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

        }
    );


    const menuLinks =
        sidebar.querySelectorAll(".menu a");


    menuLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function () {

                if (window.innerWidth <= 800) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });

}


/* =========================================================
   UPDATE STATISTIK
   ========================================================= */

function updateStatistics(data) {

    const statistics =
        data || {};


    const omzet =
        Number(statistics.omzet) || 0;

    const modal =
        Number(statistics.modal) || 0;

    const profit =
        Number(statistics.profit) || 0;

    const terjual =
        Number(statistics.terjual) || 0;


    const omzetElement =
        document.getElementById(
            "totalOmzet"
        );

    const modalElement =
        document.getElementById(
            "totalModal"
        );

    const profitElement =
        document.getElementById(
            "totalProfit"
        );

    const terjualElement =
        document.getElementById(
            "totalTerjual"
        );


    if (omzetElement) {

        omzetElement.textContent =
            formatRupiah(omzet);

    }


    if (modalElement) {

        modalElement.textContent =
            formatRupiah(modal);

    }


    if (profitElement) {

        profitElement.textContent =
            formatRupiah(profit);

    }


    if (terjualElement) {

        terjualElement.textContent =
            terjual.toLocaleString("id-ID");

    }

}


/* =========================================================
   CHART
   ========================================================= */

function renderChart(data) {

    const chart =
        document.getElementById(
            "salesChart"
        );

    const empty =
        document.getElementById(
            "chartEmpty"
        );


    if (!chart) {
        return;
    }


    /*
     * Hapus bar lama.
     */

    chart
        .querySelectorAll(".bar-wrap")
        .forEach(function(element) {

            element.remove();

        });


    /*
     * Kalau database belum punya transaksi.
     */

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        if (empty) {
            empty.style.display = "flex";
        }

        return;
    }


    if (empty) {
        empty.style.display = "none";
    }


    /*
     * Cari nilai penjualan terbesar.
     */

    const values =
        data.map(function(item) {

            return Number(item.total) || 0;

        });


    const max =
        Math.max(...values, 1);


    /*
     * Buat bar berdasarkan data database.
     */

    data.forEach(function(item) {

        const total =
            Number(item.total) || 0;


        let percentage =
            (total / max) * 100;


        /*
         * Supaya bar kecil tetap terlihat.
         */

        if (total > 0 && percentage < 3) {
            percentage = 3;
        }


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "bar-wrap";


        const bar =
            document.createElement("div");

        bar.className =
            "bar";

        bar.style.height =
            percentage + "%";


        /*
         * Label tanggal/hari.
         */

        const label =
            document.createElement("span");

        label.className =
            "bar-label";

        label.textContent =
            item.label || "-";


        wrapper.appendChild(bar);

        wrapper.appendChild(label);

        chart.appendChild(wrapper);

    });

}


/* =========================================================
   PENJUALAN TERBARU
   ========================================================= */

function renderRecentSales(data) {

    const table =
        document.getElementById(
            "salesTable"
        );


    if (!table) {
        return;
    }


    /*
     * Bersihkan isi tabel.
     */

    table.innerHTML = "";


    /*
     * Tidak ada transaksi.
     */

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-row"
                >
                    Belum ada transaksi penjualan
                </td>
            </tr>
        `;

        return;
    }


    /*
     * Tampilkan transaksi.
     */

    data.forEach(function(item) {

        const row =
            document.createElement("tr");


        const orderId =
            item.order_id ||
            item.orderId ||
            "-";


        const productName =
            item.produk ||
            item.product_name ||
            item.nama_produk ||
            "-";


        const qty =
            Number(item.qty) || 0;


        const hargaJual =
            Number(
                item.harga_jual ??
                item.hargaJual ??
                0
            );


        const total =
            Number(item.total) ||
            (qty * hargaJual);


        const status =
            item.status ||
            "-";


        /*
         * Huruf pertama nama produk.
         */

        const initial =
            productName
                .charAt(0)
                .toUpperCase();


        /*
         * Tentukan warna status.
         */

        const statusLower =
            String(status)
                .toLowerCase()
                .trim();


        let statusClass =
            "status-process";


        if (
            statusLower === "selesai" ||
            statusLower === "completed" ||
            statusLower === "success"
        ) {

            statusClass =
                "status-success";

        }
        else if (
            statusLower === "menunggu" ||
            statusLower === "pending" ||
            statusLower === "diproses"
        ) {

            statusClass =
                "status-wait";

        }
        else if (
            statusLower === "dikirim" ||
            statusLower === "dalam pengiriman"
        ) {

            statusClass =
                "status-process";

        }


        row.innerHTML = `

            <td>
                ${escapeHTML(orderId)}
            </td>


            <td>

                <div class="product-name">

                    <div class="product-image">
                        ${escapeHTML(initial)}
                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(productName)}
                        </strong>

                        <span>
                            Produk
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${qty.toLocaleString("id-ID")}
            </td>


            <td class="money">
                ${formatRupiah(hargaJual)}
            </td>


            <td class="money">
                ${formatRupiah(total)}
            </td>


            <td>

                <span
                    class="status ${statusClass}"
                >
                    ${escapeHTML(status)}
                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================================
   LOAD DASHBOARD
   ========================================================= */

async function loadDashboard() {

    try {

        /*
         * Ambil periode grafik.
         */

        const chartPeriod =
            document.getElementById(
                "chartPeriod"
            );


        const period =
            chartPeriod
                ? chartPeriod.value
                : "7";


        /*
         * Request ke server.js.
         *
         * Tidak ada data dummy.
         */

        const response =
            await fetch(
                `/api/dashboard?period=${encodeURIComponent(period)}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );


        /*
         * Cek HTTP.
         */

        if (!response.ok) {

            throw new Error(
                `Server mengembalikan HTTP ${response.status}`
            );

        }


        /*
         * Ambil JSON.
         */

        const result =
            await response.json();


        /*
         * Format response yang diharapkan:

         {
             statistics: {
                 omzet: 0,
                 modal: 0,
                 profit: 0,
                 terjual: 0
             },

             chart: [],

             recentSales: []
         }

         */


        updateStatistics(
            result.statistics || {}
        );


        renderChart(
            result.chart || []
        );


        renderRecentSales(
            result.recentSales || []
        );


    }
    catch (error) {

        console.error(
            "Gagal mengambil dashboard:",
            error
        );


        /*
         * Kalau server/database belum tersedia,
         * dashboard tidak menampilkan data palsu.
         */

        updateStatistics({
            omzet: 0,
            modal: 0,
            profit: 0,
            terjual: 0
        });


        renderChart([]);


        renderRecentSales([]);

    }

}


/* =========================================================
   EVENT PERIODE CHART
   ========================================================= */

function setupChartPeriod() {

    const chartPeriod =
        document.getElementById(
            "chartPeriod"
        );


    if (!chartPeriod) {
        return;
    }


    chartPeriod.addEventListener(
        "change",
        function () {

            loadDashboard();

        }
    );

}


/* =========================================================
   REFRESH DATA
   ========================================================= */

let dashboardRefreshTimer = null;


function startAutoRefresh() {

    /*
     * Refresh setiap 30 detik.
     *
     * Data tetap berasal dari database.
     */

    dashboardRefreshTimer =
        setInterval(
            function () {

                loadDashboard();

            },
            30000
        );

}


/* =========================================================
   STOP REFRESH
   ========================================================= */

function stopAutoRefresh() {

    if (dashboardRefreshTimer) {

        clearInterval(
            dashboardRefreshTimer
        );

        dashboardRefreshTimer = null;

    }

}


/* =========================================================
   SAAT HALAMAN DIBUKA
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDate();

        setupMobileMenu();

        setupChartPeriod();

        loadDashboard();

        startAutoRefresh();

    }
);


/* =========================================================
   SAAT TAB DITINGGALKAN
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.hidden) {

            stopAutoRefresh();

        }
        else {

            loadDashboard();

            startAutoRefresh();

        }

    }
);
