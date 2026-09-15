/* =========================================================
   QUEEN DROPSHIP
   LAPORAN.JS
   Data berasal dari server.js -> PostgreSQL/CockroachDB
   ========================================================= */


/* =========================================================
   KONFIGURASI API
========================================================= */

const API_URL = "/api/laporan";


/* =========================================================
   STATE
========================================================= */

let laporanData = [];


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function rupiah(number) {

    const value = Number(number) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(value);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(date) {

    if (!date) {
        return "-";
    }

    const tanggal = new Date(date);

    if (Number.isNaN(tanggal.getTime())) {
        return "-";
    }

    return tanggal.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   UPDATE TANGGAL TOPBAR
========================================================= */

function updateCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent =
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
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

        }
    );


    /*
     * Tutup sidebar setelah memilih menu
     * pada perangkat mobile.
     */

    const links =
        sidebar.querySelectorAll(".menu a");

    links.forEach(function(link) {

        link.addEventListener(
            "click",
            function () {

                if (window.innerWidth <= 900) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });

}


/* =========================================================
   AMBIL FILTER
========================================================= */

function getFilters() {

    const searchElement =
        document.getElementById("search");

    const mulaiElement =
        document.getElementById("tanggalMulai");

    const akhirElement =
        document.getElementById("tanggalAkhir");


    return {

        search:
            searchElement
                ? searchElement.value.trim()
                : "",

        tanggalMulai:
            mulaiElement
                ? mulaiElement.value
                : "",

        tanggalAkhir:
            akhirElement
                ? akhirElement.value
                : ""

    };

}


/* =========================================================
   BUAT QUERY API
========================================================= */

function buildApiUrl() {

    const filters =
        getFilters();


    const params =
        new URLSearchParams();


    if (filters.search) {

        params.set(
            "search",
            filters.search
        );

    }


    if (filters.tanggalMulai) {

        params.set(
            "tanggalMulai",
            filters.tanggalMulai
        );

    }


    if (filters.tanggalAkhir) {

        params.set(
            "tanggalAkhir",
            filters.tanggalAkhir
        );

    }


    const query =
        params.toString();


    if (query) {

        return `${API_URL}?${query}`;

    }


    return API_URL;

}


/* =========================================================
   LOADING TABLE
========================================================= */

function showLoading() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="empty">

                Memuat data laporan...

            </td>

        </tr>

    `;

}


/* =========================================================
   ERROR TABLE
========================================================= */

function showError(message) {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="empty">

                ${escapeHtml(message)}

            </td>

        </tr>

    `;

}


/* =========================================================
   KOSONG
========================================================= */

function showEmpty() {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="empty">

                Belum ada data laporan.

            </td>

        </tr>

    `;

}


/* =========================================================
   NORMALISASI DATA
========================================================= */

function normalizeData(data) {

    if (!Array.isArray(data)) {
        return [];
    }


    return data.map(function(item) {

        const produk =
            item.produk ??
            item.nama_produk ??
            item.namaProduk ??
            item.product_name ??
            item.product ??
            "-";


        const qty =
            Number(
                item.qty ??
                item.jumlah ??
                item.quantity ??
                0
            );


        const penjualan =
            Number(
                item.penjualan ??
                item.totalPenjualan ??
                item.total_jual ??
                item.totalJual ??
                item.harga_jual ??
                item.hargaJual ??
                item.total ??
                0
            );


        const modal =
            Number(
                item.modal ??
                item.totalModal ??
                item.total_modal ??
                0
            );


        const keuntungan =
            Number(
                item.keuntungan ??
                item.profit ??
                item.laba ??
                (penjualan - modal)
            );


        const tanggal =
            item.tanggal ??
            item.date ??
            item.created_at ??
            item.createdAt ??
            "";


        const id =
            item.id ??
            item.penjualan_id ??
            item.order_id ??
            item.orderId ??
            "";


        return {

            id: id,

            tanggal: tanggal,

            produk: produk,

            qty: qty,

            penjualan: penjualan,

            modal: modal,

            keuntungan: keuntungan

        };

    });

}


/* =========================================================
   RENDER SUMMARY
========================================================= */

function renderSummary(data) {

    let totalPenjualan = 0;

    let totalModal = 0;

    let totalProfit = 0;

    let totalTransaksi = data.length;


    data.forEach(function(item) {

        totalPenjualan +=
            Number(item.penjualan) || 0;


        totalModal +=
            Number(item.modal) || 0;


        totalProfit +=
            Number(item.keuntungan) || 0;

    });


    const penjualanElement =
        document.getElementById(
            "totalPenjualan"
        );


    const modalElement =
        document.getElementById(
            "totalModal"
        );


    const profitElement =
        document.getElementById(
            "totalProfit"
        );


    const transaksiElement =
        document.getElementById(
            "totalTransaksi"
        );


    const profitBesarElement =
        document.getElementById(
            "profitBesar"
        );


    if (penjualanElement) {

        penjualanElement.textContent =
            rupiah(totalPenjualan);

    }


    if (modalElement) {

        modalElement.textContent =
            rupiah(totalModal);

    }


    if (profitElement) {

        profitElement.textContent =
            rupiah(totalProfit);

    }


    if (transaksiElement) {

        transaksiElement.textContent =
            totalTransaksi.toLocaleString(
                "id-ID"
            );

    }


    if (profitBesarElement) {

        profitBesarElement.textContent =
            rupiah(totalProfit);

    }


    /*
     * Jumlah data tabel.
     */

    const jumlahData =
        document.getElementById(
            "jumlahData"
        );


    if (jumlahData) {

        jumlahData.textContent =
            `${totalTransaksi.toLocaleString("id-ID")} transaksi`;

    }

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(data) {

    const table =
        document.getElementById(
            "reportTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (!data.length) {

        showEmpty();

        return;

    }


    data.forEach(function(item) {

        const row =
            document.createElement("tr");


        const keuntungan =
            Number(item.keuntungan) || 0;


        const profitClass =
            keuntungan >= 0
                ? "profit"
                : "loss";


        row.innerHTML = `

            <td>
                ${escapeHtml(
                    formatTanggal(item.tanggal)
                )}
            </td>


            <td>
                <strong>
                    ${escapeHtml(item.produk)}
                </strong>
            </td>


            <td>
                ${Number(item.qty || 0)
                    .toLocaleString("id-ID")}
            </td>


            <td class="money">
                ${rupiah(item.penjualan)}
            </td>


            <td class="money">
                ${rupiah(item.modal)}
            </td>


            <td class="${profitClass}">
                ${rupiah(keuntungan)}
            </td>

        `;


        table.appendChild(row);

    });

}


/* =========================================================
   RENDER SEMUA DATA
========================================================= */

function renderReport(data) {

    const normalized =
        normalizeData(data);


    laporanData =
        normalized;


    renderSummary(
        normalized
    );


    renderTable(
        normalized
    );

}


/* =========================================================
   LOAD LAPORAN DARI SERVER
========================================================= */

async function loadLaporan() {

    showLoading();


    try {

        const url =
            buildApiUrl();


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        /*
         * Server error.
         */

        if (!response.ok) {

            let errorMessage =
                `Gagal mengambil laporan. HTTP ${response.status}`;


            try {

                const errorData =
                    await response.json();


                if (errorData.message) {

                    errorMessage =
                        errorData.message;

                }

            }
            catch (error) {

                /*
                 * Response bukan JSON.
                 */

            }


            throw new Error(
                errorMessage
            );

        }


        const result =
            await response.json();


        /*
         * Mendukung beberapa format
         * response dari server.
         *
         * Format utama:
         *
         * {
         *   data: [...]
         * }
         *
         * atau langsung:
         *
         * [...]
         */

        let data;


        if (Array.isArray(result)) {

            data = result;

        }
        else if (
            result &&
            Array.isArray(result.data)
        ) {

            data = result.data;

        }
        else if (
            result &&
            Array.isArray(result.laporan)
        ) {

            data =
                result.laporan;

        }
        else {

            data = [];

        }


        renderReport(data);

    }
    catch (error) {

        console.error(
            "Gagal memuat laporan:",
            error
        );


        /*
         * Jangan membuat data palsu.
         */

        laporanData = [];


        /*
         * Reset summary.
         */

        renderSummary([]);


        showError(
            "Tidak dapat mengambil data dari server. Pastikan server.js dan database aktif."
        );

    }

}


/* =========================================================
   FILTER EVENTS
========================================================= */

function setupFilters() {

    const search =
        document.getElementById(
            "search"
        );


    const tanggalMulai =
        document.getElementById(
            "tanggalMulai"
        );


    const tanggalAkhir =
        document.getElementById(
            "tanggalAkhir"
        );


    /*
     * Search.
     */

    if (search) {

        search.addEventListener(
            "input",
            debounce(
                function() {

                    loadLaporan();

                },
                400
            )
        );

    }


    /*
     * Tanggal mulai.
     */

    if (tanggalMulai) {

        tanggalMulai.addEventListener(
            "change",
            function() {

                loadLaporan();

            }
        );

    }


    /*
     * Tanggal akhir.
     */

    if (tanggalAkhir) {

        tanggalAkhir.addEventListener(
            "change",
            function() {

                loadLaporan();

            }
        );

    }

}


/* =========================================================
   DEBOUNCE
========================================================= */

function debounce(
    callback,
    delay
) {

    let timer;


    return function(...args) {

        clearTimeout(timer);


        timer =
            setTimeout(
                function() {

                    callback.apply(
                        null,
                        args
                    );

                },
                delay
            );

    };

}


/* =========================================================
   VALIDASI TANGGAL
========================================================= */

function validateDateRange() {

    const mulai =
        document.getElementById(
            "tanggalMulai"
        );


    const akhir =
        document.getElementById(
            "tanggalAkhir"
        );


    if (!mulai || !akhir) {
        return true;
    }


    if (
        mulai.value &&
        akhir.value &&
        mulai.value > akhir.value
    ) {

        alert(
            "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
        );


        akhir.value = "";


        return false;

    }


    return true;

}


/* =========================================================
   VALIDASI FILTER
========================================================= */

function setupDateValidation() {

    const mulai =
        document.getElementById(
            "tanggalMulai"
        );


    const akhir =
        document.getElementById(
            "tanggalAkhir"
        );


    if (mulai) {

        mulai.addEventListener(
            "change",
            validateDateRange
        );

    }


    if (akhir) {

        akhir.addEventListener(
            "change",
            validateDateRange
        );

    }

}


/* =========================================================
   AUTO REFRESH
========================================================= */

let refreshTimer = null;


function startAutoRefresh() {

    stopAutoRefresh();


    /*
     * Update laporan setiap 30 detik.
     *
     * Data tetap berasal dari database.
     */

    refreshTimer =
        setInterval(
            function() {

                loadLaporan();

            },
            30000
        );

}


function stopAutoRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

        refreshTimer = null;

    }

}


/* =========================================================
   VISIBILITY CHANGE
========================================================= */

function setupVisibilityRefresh() {

    document.addEventListener(
        "visibilitychange",
        function() {

            if (document.hidden) {

                stopAutoRefresh();

            }
            else {

                loadLaporan();

                startAutoRefresh();

            }

        }
    );

}


/* =========================================================
   PRINT
========================================================= */

function setupPrint() {

    /*
     * Tombol print pada HTML menggunakan:
     *
     * onclick="window.print()"
     *
     * Jadi tidak perlu event tambahan.
     */

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
         * Tanggal topbar.
         */

        updateCurrentDate();


        /*
         * Sidebar mobile.
         */

        setupMobileMenu();


        /*
         * Filter.
         */

        setupFilters();


        /*
         * Validasi tanggal.
         */

        setupDateValidation();


        /*
         * Print.
         */

        setupPrint();


        /*
         * Auto refresh.
         */

        setupVisibilityRefresh();


        /*
         * Ambil data pertama kali.
         */

        loadLaporan();


        /*
         * Refresh otomatis.
         */

        startAutoRefresh();

    }
);
