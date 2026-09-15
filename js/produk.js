<script>
/* =========================================================
   QUEEN DROPSHIP - PRODUK.JS
   Database: server.js -> GET /api/produk
   Tidak menggunakan localStorage
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = "http://localhost:3000/api/produk";

/* =========================================================
   ELEMENT
========================================================= */

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

const modalTitle = document.getElementById("modalTitle");
const editId = document.getElementById("editId");

const namaInput = document.getElementById("nama");
const skuInput = document.getElementById("sku");
const statusInput = document.getElementById("status");

const hargaSupplierInput =
    document.getElementById("hargaSupplier");

const marginInput =
    document.getElementById("margin");

const biayaShopeeInput =
    document.getElementById("biayaShopee");

const hargaJualInput =
    document.getElementById("hargaJual");

const hargaJualPreview =
    document.getElementById("hargaJualPreview");

const profitPreview =
    document.getElementById("profitPreview");

const marginPreview =
    document.getElementById("marginPreview");

const productTable =
    document.getElementById("productTable");

const searchInput =
    document.getElementById("search");

const filterStatus =
    document.getElementById("filterStatus");

const totalProduk =
    document.getElementById("totalProduk");

const produkAktif =
    document.getElementById("produkAktif");

const rataMargin =
    document.getElementById("rataMargin");

const jumlahHasil =
    document.getElementById("jumlahHasil");

const sidebar =
    document.getElementById("sidebar");

const mobileMenu =
    document.getElementById("mobileMenu");

const currentDate =
    document.getElementById("currentDate");


/* =========================================================
   DATA
========================================================= */

let produkData = [];


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
   FORMAT ANGKA
========================================================= */

function formatNumber(value) {

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

}


/* =========================================================
   NORMALISASI DATA DATABASE
========================================================= */

function normalizeProduct(item) {

    return {

        id:
            item.id ??
            item.ID ??
            "",

        nama:
            item.nama ??
            item.name ??
            item.nama_produk ??
            item.product_name ??
            "",

        sku:
            item.sku ??
            item.SKU ??
            "",

        hargaSupplier:
            Number(
                item.harga_supplier ??
                item.hargaSupplier ??
                item.supplier_price ??
                item.harga_beli ??
                0
            ),

        hargaJual:
            Number(
                item.harga_jual ??
                item.hargaJual ??
                item.selling_price ??
                0
            ),

        margin:
            Number(
                item.margin ??
                item.margin_persen ??
                item.margin_percent ??
                0
            ),

        biayaShopee:
            Number(
                item.biaya_shopee ??
                item.biayaShopee ??
                item.shopee_fee ??
                5000
            ),

        status:
            item.status ??
            "active",

        deskripsi:
            item.deskripsi ??
            item.description ??
            ""

    };

}


/* =========================================================
   LOAD PRODUK DARI SERVER
========================================================= */

async function loadProducts() {

    productTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty">
                Memuat data produk...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "Format data produk tidak valid"
            );

        }

        produkData =
            data.map(normalizeProduct);

        renderProducts();

        updateSummary();

    } catch (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );

        productTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    <strong>Gagal mengambil data produk.</strong>
                    <br>
                    Pastikan server.js berjalan di
                    <b>http://localhost:3000</b>.
                    <br><br>
                    <button
                        class="btn-primary"
                        type="button"
                        onclick="loadProducts()">
                        Coba Lagi
                    </button>
                </td>
            </tr>
        `;

        totalProduk.textContent = "0";
        produkAktif.textContent = "0";
        rataMargin.textContent = "Rp 0";
        jumlahHasil.textContent = "0 produk";

    }

}


/* =========================================================
   RENDER PRODUK
========================================================= */

function renderProducts() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        filterStatus.value;

    const filtered =
        produkData.filter(product => {

            const nama =
                String(product.nama)
                    .toLowerCase();

            const sku =
                String(product.sku)
                    .toLowerCase();

            const cocokSearch =
                !keyword ||
                nama.includes(keyword) ||
                sku.includes(keyword);

            const cocokStatus =
                selectedStatus === "all" ||
                normalizeStatus(product.status) ===
                selectedStatus;

            return cocokSearch && cocokStatus;

        });


    jumlahHasil.textContent =
        `${filtered.length} produk`;


    if (filtered.length === 0) {

        productTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Tidak ada produk ditemukan.
                </td>
            </tr>
        `;

        return;

    }


    productTable.innerHTML =
        filtered.map(product => {

            const supplier =
                Number(product.hargaSupplier) || 0;

            const jual =
                Number(product.hargaJual) || 0;

            const profit =
                jual - supplier;

            const margin =
                supplier > 0
                    ? (profit / supplier) * 100
                    : 0;

            const status =
                normalizeStatus(product.status);

            const initial =
                product.nama
                    ? product.nama
                        .trim()
                        .charAt(0)
                        .toUpperCase()
                    : "P";


            return `

                <tr>

                    <td>

                        <div class="product">

                            <div class="product-img">
                                ${escapeHTML(initial)}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        product.nama ||
                                        "Tanpa Nama"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        product.deskripsi || "-"
                                    )}
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(
                            product.sku || "-"
                        )}
                    </td>


                    <td class="money">
                        ${formatRupiah(supplier)}
                    </td>


                    <td class="money">
                        ${formatRupiah(jual)}
                    </td>


                    <td>

                        <span class="profit">
                            ${formatRupiah(profit)}
                        </span>

                        <br>

                        <span class="margin-percent">
                            ${margin.toFixed(1)}%
                        </span>

                    </td>


                    <td>

                        <span class="status ${
                            status === "active"
                                ? "active-status"
                                : "inactive-status"
                        }">

                            ${
                                status === "active"
                                    ? "Aktif"
                                    : "Nonaktif"
                            }

                        </span>

                    </td>


                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="btn-edit"
                                onclick="editProduct('${escapeAttribute(product.id)}')">

                                Edit

                            </button>


                            <button
                                type="button"
                                class="btn-delete"
                                onclick="deleteProduct('${escapeAttribute(product.id)}')">

                                Hapus

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {

    const value =
        String(status || "")
            .toLowerCase()
            .trim();

    if (
        value === "active" ||
        value === "aktif" ||
        value === "true" ||
        value === "1"
    ) {

        return "active";

    }

    return "inactive";

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        produkData.length;

    const active =
        produkData.filter(product =>
            normalizeStatus(product.status) === "active"
        ).length;


    let totalMargin = 0;
    let marginCount = 0;


    produkData.forEach(product => {

        const supplier =
            Number(product.hargaSupplier) || 0;

        const jual =
            Number(product.hargaJual) || 0;

        if (supplier > 0) {

            totalMargin +=
                jual - supplier;

            marginCount++;

        }

    });


    const average =
        marginCount > 0
            ? totalMargin / marginCount
            : 0;


    totalProduk.textContent =
        formatNumber(total);

    produkAktif.textContent =
        formatNumber(active);

    rataMargin.textContent =
        formatRupiah(average);

}


/* =========================================================
   HITUNG HARGA JUAL
========================================================= */

function calculateSellingPrice() {

    const supplier =
        Number(hargaSupplierInput.value) || 0;

    const biaya =
        Number(biayaShopeeInput.value) || 0;

    const selectedMargin =
        marginInput.value;


    let hargaJual = 0;


    /*
     * AUTO
     *
     * Auto menggunakan 20%
     */

    if (selectedMargin === "auto") {

        const marginPersen = 20;

        hargaJual =
            supplier +
            (supplier * marginPersen / 100) +
            biaya;

    }


    /*
     * MARGIN PERSEN
     */

    else if (selectedMargin !== "manual") {

        const marginPersen =
            Number(selectedMargin) || 0;

        hargaJual =
            supplier +
            (supplier * marginPersen / 100) +
            biaya;

    }


    /*
     * MANUAL
     */

    else {

        hargaJual =
            Number(hargaJualInput.value) || 0;

    }


    /*
     * Bulatkan
     */

    hargaJual =
        Math.round(hargaJual);


    /*
     * Tampilkan preview
     */

    hargaJualPreview.textContent =
        formatRupiah(hargaJual);


    /*
     * Isi input harga jual
     */

    if (selectedMargin !== "manual") {

        hargaJualInput.value =
            hargaJual;

    }


    updateProfitPreview();

}


/* =========================================================
   PREVIEW PROFIT
========================================================= */

function updateProfitPreview() {

    const supplier =
        Number(hargaSupplierInput.value) || 0;

    const jual =
        Number(hargaJualInput.value) || 0;

    const profit =
        jual - supplier;


    let marginPersen = 0;

    if (supplier > 0) {

        marginPersen =
            (profit / supplier) * 100;

    }


    profitPreview.textContent =
        formatRupiah(profit);

    marginPreview.textContent =
        `${marginPersen.toFixed(1)}%`;

    hargaJualPreview.textContent =
        formatRupiah(jual);

}


/* =========================================================
   UPDATE MODE MARGIN
========================================================= */

function updateMarginMode() {

    const mode =
        marginInput.value;


    if (mode === "manual") {

        hargaJualInput.removeAttribute(
            "readonly"
        );

        hargaJualInput.focus();

        updateProfitPreview();

        return;

    }


    /*
     * Persen / Auto
     */

    hargaJualInput.removeAttribute(
        "readonly"
    );

    calculateSellingPrice();

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal() {

    productForm.reset();

    editId.value = "";

    modalTitle.textContent =
        "Tambah Produk";


    /*
     * Default
     */

    statusInput.value =
        "active";

    marginInput.value =
        "20";

    biayaShopeeInput.value =
        "5000";


    hargaSupplierInput.value =
        "";

    hargaJualInput.value =
        "";


    productModal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(() => {

        namaInput.focus();

    }, 50);


    updateProfitPreview();

    hargaJualPreview.textContent =
        "Rp 0";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    productModal.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        produkData.find(item =>
            String(item.id) === String(id)
        );


    if (!product) {

        alert(
            "Data produk tidak ditemukan."
        );

        return;

    }


    editId.value =
        product.id;

    modalTitle.textContent =
        "Edit Produk";


    namaInput.value =
        product.nama || "";

    skuInput.value =
        product.sku || "";

    statusInput.value =
        normalizeStatus(product.status);


    hargaSupplierInput.value =
        product.hargaSupplier || "";


    biayaShopeeInput.value =
        product.biayaShopee ||
        5000;


    /*
     * Tentukan mode margin
     */

    const margin =
        Number(product.margin);


    const allowedMargins = [
        10,
        12,
        15,
        20,
        21,
        25,
        50
    ];


    if (
        allowedMargins.includes(margin)
    ) {

        marginInput.value =
            String(margin);

    } else {

        marginInput.value =
            "manual";

    }


    hargaJualInput.value =
        product.hargaJual || "";


    document.getElementById(
        "deskripsi"
    ).value =
        product.deskripsi || "";


    productModal.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";


    updateMarginMode();

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const product =
        produkData.find(item =>
            String(item.id) === String(id)
        );


    if (!product) {

        alert(
            "Produk tidak ditemukan."
        );

        return;

    }


    const yakin =
        confirm(
            `Hapus produk "${product.nama}"?`
        );


    if (!yakin) {

        return;

    }


    /*
     * Server kamu saat ini BELUM memiliki
     * DELETE /api/produk/:id.
     *
     * Jangan pura-pura menghapus dari browser.
     */

    alert(
        "API hapus belum tersedia di server.js. " +
        "Data database tidak diubah."
    );

}


/* =========================================================
   SUBMIT FORM
========================================================= */

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            editId.value.trim();


        const nama =
            namaInput.value.trim();

        const sku =
            skuInput.value.trim();

        const status =
            statusInput.value;

        const hargaSupplier =
            Number(
                hargaSupplierInput.value
            ) || 0;

        const hargaJual =
            Number(
                hargaJualInput.value
            ) || 0;

        const biayaShopee =
            Number(
                biayaShopeeInput.value
            ) || 0;

        const deskripsi =
            document.getElementById(
                "deskripsi"
            ).value.trim();


        /*
         * Validasi
         */

        if (!nama) {

            alert(
                "Nama produk wajib diisi."
            );

            namaInput.focus();

            return;

        }


        if (!sku) {

            alert(
                "SKU wajib diisi."
            );

            skuInput.focus();

            return;

        }


        if (hargaSupplier < 0) {

            alert(
                "Harga supplier tidak valid."
            );

            return;

        }


        if (hargaJual < 0) {

            alert(
                "Harga jual tidak valid."
            );

            return;

        }


        /*
         * Margin sebenarnya
         */

        const profit =
            hargaJual -
            hargaSupplier;

        const marginPersen =
            hargaSupplier > 0
                ? (profit / hargaSupplier) * 100
                : 0;


        /*
         * Payload.
         *
         * Nama field disiapkan mengikuti
         * pola database Indonesia.
         */

        const payload = {

            nama: nama,

            sku: sku,

            harga_supplier:
                hargaSupplier,

            harga_jual:
                hargaJual,

            margin:
                Number(
                    marginInput.value
                ) || 0,

            margin_persen:
                Number(
                    marginPersen.toFixed(2)
                ),

            biaya_shopee:
                biayaShopee,

            status:
                status,

            deskripsi:
                deskripsi

        };


        /*
         * SERVER SAAT INI BELUM PUNYA
         * POST / PUT.
         *
         * Jadi jangan kirim request yang pasti 404.
         */

        alert(
            "API simpan produk belum tersedia di server.js. " +
            "Data belum disimpan ke database."
        );


        console.log(
            "Payload produk yang siap dikirim:",
            payload
        );

    }
);


/* =========================================================
   EVENT HARGA
========================================================= */

hargaSupplierInput.addEventListener(
    "input",
    function() {

        if (
            marginInput.value !==
            "manual"
        ) {

            calculateSellingPrice();

        } else {

            updateProfitPreview();

        }

    }
);


marginInput.addEventListener(
    "change",
    function() {

        updateMarginMode();

    }
);


biayaShopeeInput.addEventListener(
    "input",
    function() {

        if (
            marginInput.value !==
            "manual"
        ) {

            calculateSellingPrice();

        } else {

            updateProfitPreview();

        }

    }
);


hargaJualInput.addEventListener(
    "input",
    function() {

        updateProfitPreview();

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    function() {

        renderProducts();

    }
);


/* =========================================================
   FILTER
========================================================= */

filterStatus.addEventListener(
    "change",
    function() {

        renderProducts();

    }
);


/* =========================================================
   CLOSE MODAL KLIK OVERLAY
========================================================= */

productModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            productModal
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   ESC CLOSE MODAL
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            productModal.classList.contains("show")
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


/* =========================================================
   DATE
========================================================= */

if (currentDate) {

    currentDate.textContent =
        new Date().toLocaleDateString(
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
   ESCAPE HTML
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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


/* =========================================================
   GLOBAL FUNCTION
   Supaya onclick="openModal()" dari HTML bekerja.
========================================================= */

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.loadProducts =
    loadProducts;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        /*
         * Set preview awal
         */

        updateProfitPreview();

    }
);

</script>
