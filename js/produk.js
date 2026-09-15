/* =========================================================
   QUEEN DROPSHIP
   PRODUK.JS
   DATABASE VIA SERVER API
   TIDAK MENGGUNAKAN LOCAL STORAGE
========================================================= */

"use strict";

const API_URL = "http://localhost:3000/api/produk";

let products = [];
let editingId = null;


/* =========================================================
   ELEMENT
========================================================= */

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");

const modalTitle = document.getElementById("modalTitle");

const editIdInput = document.getElementById("editId");
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

const totalProduk =
    document.getElementById("totalProduk");

const produkAktif =
    document.getElementById("produkAktif");

const rataMargin =
    document.getElementById("rataMargin");

const jumlahHasil =
    document.getElementById("jumlahHasil");

const searchInput =
    document.getElementById("search");

const filterStatus =
    document.getElementById("filterStatus");


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(number) {

    number = Number(number) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}


/* =========================================================
   FORMAT ANGKA
========================================================= */

function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    return Number(value) || 0;
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
   HITUNG HARGA JUAL
=========================================================

   Rumus:

   Harga Supplier
   + Margin %
   + Pajak/Biaya Shopee Rp 5.000

   Contoh:

   Supplier = 35.000
   Margin = 20%
   Shopee = 5.000

   35.000 + 7.000 + 5.000
   = 47.000
========================================================= */

function calculateSellingPrice() {

    const supplier =
        numberValue(hargaSupplierInput.value);

    const marginValue =
        marginInput.value;

    const biayaShopee =
        numberValue(biayaShopeeInput.value);


    /* MANUAL */

    if (marginValue === "manual") {

        return numberValue(
            hargaJualInput.value
        );
    }


    /* AUTO = 20% */

    let marginPersen;

    if (marginValue === "auto") {

        marginPersen = 20;

    } else {

        marginPersen =
            numberValue(marginValue);
    }


    const keuntunganMargin =
        supplier * marginPersen / 100;


    return Math.round(
        supplier +
        keuntunganMargin +
        biayaShopee
    );
}


/* =========================================================
   UPDATE PREVIEW HARGA
========================================================= */

function updatePricePreview() {

    const supplier =
        numberValue(hargaSupplierInput.value);

    const biayaShopee =
        numberValue(biayaShopeeInput.value);

    const marginValue =
        marginInput.value;


    let hargaJual =
        calculateSellingPrice();


    /* Kalau bukan manual, isi harga jual otomatis */

    if (marginValue !== "manual") {

        hargaJualInput.value =
            hargaJual;
    }


    hargaJualPreview.textContent =
        formatRupiah(hargaJual);


    updateProfitPreview();
}


/* =========================================================
   UPDATE PROFIT + MARGIN
========================================================= */

function updateProfitPreview() {

    const supplier =
        numberValue(hargaSupplierInput.value);

    const jual =
        numberValue(hargaJualInput.value);

    const biayaShopee =
        numberValue(biayaShopeeInput.value);


    /*
     * Keuntungan bersih:
     *
     * Harga jual
     * - Harga supplier
     * - Biaya Shopee
     */

    const profit =
        jual -
        supplier -
        biayaShopee;


    let marginPersen = 0;


    if (supplier > 0) {

        marginPersen =
            (profit / supplier) * 100;
    }


    profitPreview.textContent =
        formatRupiah(profit);


    marginPreview.textContent =
        `${marginPersen.toFixed(1)}%`;
}


/* =========================================================
   EVENT HARGA
========================================================= */

hargaSupplierInput.addEventListener(
    "input",
    updatePricePreview
);


biayaShopeeInput.addEventListener(
    "input",
    updatePricePreview
);


marginInput.addEventListener(
    "change",
    function () {

        if (this.value === "manual") {

            hargaJualInput.removeAttribute(
                "readonly"
            );

            hargaJualInput.focus();

            updateProfitPreview();

        } else {

            hargaJualInput.setAttribute(
                "readonly",
                "readonly"
            );

            updatePricePreview();
        }
    }
);


hargaJualInput.addEventListener(
    "input",
    function () {

        if (marginInput.value === "manual") {

            updateProfitPreview();
        }
    }
);


/* =========================================================
   OPEN MODAL
========================================================= */

window.openModal = function () {

    editingId = null;

    modalTitle.textContent =
        "Tambah Produk";

    productForm.reset();

    editIdInput.value = "";

    statusInput.value =
        "active";

    marginInput.value =
        "20";

    biayaShopeeInput.value =
        "5000";

    hargaJualInput.removeAttribute(
        "readonly"
    );

    updatePricePreview();

    productModal.classList.add(
        "show"
    );

    setTimeout(() => {

        namaInput.focus();

    }, 50);
};


/* =========================================================
   CLOSE MODAL
========================================================= */

window.closeModal = function () {

    productModal.classList.remove(
        "show"
    );

    editingId = null;
};


/* =========================================================
   KLIK LUAR MODAL
========================================================= */

productModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === productModal
        ) {

            closeModal();
        }
    }
);


/* =========================================================
   ESC UNTUK TUTUP MODAL
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            productModal.classList.contains("show")
        ) {

            closeModal();
        }
    }
);


/* =========================================================
   LOAD PRODUK DARI DATABASE
========================================================= */

async function loadProducts() {

    try {

        productTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Memuat produk...
                </td>
            </tr>
        `;


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
         * Server kamu mengembalikan langsung:
         *
         * result.rows
         *
         * bukan:
         * { success:true, data:[] }
         */

        if (Array.isArray(data)) {

            products = data;

        } else if (
            Array.isArray(data.data)
        ) {

            products = data.data;

        } else {

            products = [];
        }


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
                    Gagal mengambil data produk.
                    <br>
                    <small>
                        Pastikan server.js berjalan di port 3000.
                    </small>
                </td>
            </tr>
        `;
    }
}


/* =========================================================
   NORMALISASI DATA DATABASE
========================================================= */

function normalizeProduct(product) {

    return {

        id:
            product.id,

        nama:
            product.nama ??
            product.name ??
            "",

        sku:
            product.sku ??
            "",

        hargaSupplier:
            numberValue(
                product.harga_supplier ??
                product.hargaSupplier ??
                product.supplier_price
            ),

        hargaJual:
            numberValue(
                product.harga_jual ??
                product.hargaJual ??
                product.selling_price
            ),

        margin:
            numberValue(
                product.margin ??
                product.margin_persen ??
                product.marginPersen
            ),

        biayaShopee:
            numberValue(
                product.biaya_shopee ??
                product.biayaShopee ??
                product.shopee_fee
            ),

        status:
            product.status ??
            "active",

        deskripsi:
            product.deskripsi ??
            ""
    };
}


/* =========================================================
   RENDER PRODUK
========================================================= */

function renderProducts() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();


    const status =
        filterStatus.value;


    const filtered =
        products
            .map(normalizeProduct)
            .filter(product => {

                const cocokSearch =
                    !keyword ||
                    product.nama
                        .toLowerCase()
                        .includes(keyword) ||
                    product.sku
                        .toLowerCase()
                        .includes(keyword);


                const cocokStatus =
                    status === "all" ||
                    product.status === status;


                return (
                    cocokSearch &&
                    cocokStatus
                );
            });


    jumlahHasil.textContent =
        `${filtered.length} produk`;


    if (filtered.length === 0) {

        productTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Belum ada produk.
                </td>
            </tr>
        `;

        return;
    }


    productTable.innerHTML =
        filtered.map(product => {

            const supplier =
                product.hargaSupplier;

            const jual =
                product.hargaJual;

            const biaya =
                product.biayaShopee;


            /*
             * Profit bersih
             */

            const profit =
                jual -
                supplier -
                biaya;


            let marginPersen = 0;


            if (supplier > 0) {

                marginPersen =
                    (profit / supplier) * 100;
            }


            const initial =
                product.nama
                    ? product.nama
                        .charAt(0)
                        .toUpperCase()
                    : "?";


            const active =
                product.status === "active";


            return `

                <tr>

                    <td>

                        <div class="product">

                            <div class="product-img">
                                ${escapeHTML(initial)}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(product.nama)}
                                </strong>

                                <span>
                                    ${escapeHTML(product.deskripsi)}
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(product.sku)}
                    </td>


                    <td class="money">
                        ${formatRupiah(supplier)}
                    </td>


                    <td class="money">
                        ${formatRupiah(jual)}
                    </td>


                    <td>

                        <div class="profit">
                            ${formatRupiah(profit)}
                        </div>

                        <span class="margin-percent">
                            ${marginPersen.toFixed(1)}%
                        </span>

                    </td>


                    <td>

                        <span class="
                            status
                            ${active
                                ? "active-status"
                                : "inactive-status"}
                        ">

                            ${active
                                ? "Aktif"
                                : "Nonaktif"}

                        </span>

                    </td>


                    <td>

                        <div class="actions">

                            <button
                                class="btn-edit"
                                type="button"
                                onclick="editProduct(${Number(product.id)})">

                                Edit

                            </button>


                            <button
                                class="btn-delete"
                                type="button"
                                onclick="deleteProduct(${Number(product.id)})">

                                Hapus

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");
}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const data =
        products.map(normalizeProduct);


    const total =
        data.length;


    const aktif =
        data.filter(
            product =>
                product.status === "active"
        ).length;


    let totalMargin = 0;


    data.forEach(product => {

        if (product.hargaSupplier > 0) {

            const profit =
                product.hargaJual -
                product.hargaSupplier -
                product.biayaShopee;


            totalMargin +=
                (profit / product.hargaSupplier) * 100;
        }
    });


    const averageMargin =
        total > 0
            ? totalMargin / total
            : 0;


    totalProduk.textContent =
        total;


    produkAktif.textContent =
        aktif;


    rataMargin.textContent =
        `${averageMargin.toFixed(1)}%`;
}


/* =========================================================
   EDIT PRODUK
========================================================= */

window.editProduct = function (id) {

    const product =
        products
            .map(normalizeProduct)
            .find(
                item =>
                    String(item.id) === String(id)
            );


    if (!product) {

        alert(
            "Data produk tidak ditemukan."
        );

        return;
    }


    editingId =
        product.id;


    editIdInput.value =
        product.id;


    modalTitle.textContent =
        "Edit Produk";


    namaInput.value =
        product.nama;


    skuInput.value =
        product.sku;


    statusInput.value =
        product.status;


    hargaSupplierInput.value =
        product.hargaSupplier;


    biayaShopeeInput.value =
        product.biayaShopee ||
        5000;


    /*
     * Cari margin yang paling sesuai
     */

    const marginNumber =
        product.margin;


    const marginOptions = [
        "10",
        "12",
        "15",
        "20",
        "21",
        "25",
        "50"
    ];


    if (
        marginOptions.includes(
            String(marginNumber)
        )
    ) {

        marginInput.value =
            String(marginNumber);

    } else {

        marginInput.value =
            "manual";
    }


    hargaJualInput.value =
        product.hargaJual;


    deskripsiInput.value =
        product.deskripsi;


    if (
        marginInput.value === "manual"
    ) {

        hargaJualInput.removeAttribute(
            "readonly"
        );

    } else {

        hargaJualInput.setAttribute(
            "readonly",
            "readonly"
        );
    }


    updatePricePreview();


    productModal.classList.add(
        "show"
    );
};


/* =========================================================
   DESKRIPSI
========================================================= */

const deskripsiInput =
    document.getElementById("deskripsi");


/* =========================================================
   AMBIL DATA FORM
========================================================= */

function getFormData() {

    const supplier =
        numberValue(
            hargaSupplierInput.value
        );

    const jual =
        numberValue(
            hargaJualInput.value
        );

    const biaya =
        numberValue(
            biayaShopeeInput.value
        );


    let marginPersen = 0;


    if (
        marginInput.value === "manual"
    ) {

        if (supplier > 0) {

            marginPersen =
                ((jual - supplier - biaya) /
                    supplier) *
                100;
        }

    } else if (
        marginInput.value === "auto"
    ) {

        marginPersen = 20;

    } else {

        marginPersen =
            numberValue(
                marginInput.value
            );
    }


    return {

        nama:
            namaInput.value.trim(),

        sku:
            skuInput.value.trim(),

        harga_supplier:
            supplier,

        harga_jual:
            jual,

        margin:
            Number(
                marginPersen.toFixed(2)
            ),

        biaya_shopee:
            biaya,

        status:
            statusInput.value,

        deskripsi:
            deskripsiInput.value.trim()
    };
}


/* =========================================================
   SIMPAN PRODUK
========================================================= */

productForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const data =
            getFormData();


        if (!data.nama) {

            alert(
                "Nama produk wajib diisi."
            );

            return;
        }


        if (!data.sku) {

            alert(
                "SKU wajib diisi."
            );

            return;
        }


        if (
            data.harga_supplier <= 0
        ) {

            alert(
                "Harga supplier harus lebih dari 0."
            );

            return;
        }


        if (
            data.harga_jual <= 0
        ) {

            alert(
                "Harga jual harus lebih dari 0."
            );

            return;
        }


        const isEdit =
            editingId !== null;


        const url =
            isEdit
                ? `${API_URL}/${editingId}`
                : API_URL;


        const method =
            isEdit
                ? "PUT"
                : "POST";


        const submitButton =
            productForm.querySelector(
                'button[type="submit"]'
            );


        const originalText =
            submitButton.textContent;


        submitButton.disabled =
            true;

        submitButton.textContent =
            "Menyimpan...";


        try {

            const response =
                await fetch(
                    url,
                    {
                        method,
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    `HTTP ${response.status}`
                );
            }


            alert(
                isEdit
                    ? "Produk berhasil diperbarui."
                    : "Produk berhasil ditambahkan."
            );


            closeModal();


            await loadProducts();


        } catch (error) {

            console.error(
                "Gagal menyimpan produk:",
                error
            );


            alert(
                "Gagal menyimpan produk.\n\n" +
                error.message
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                originalText;
        }
    }
);


/* =========================================================
   DELETE PRODUK
========================================================= */

window.deleteProduct = async function (id) {

    const product =
        products
            .map(normalizeProduct)
            .find(
                item =>
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


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );
        }


        alert(
            "Produk berhasil dihapus."
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Gagal menghapus produk:",
            error
        );


        alert(
            "Gagal menghapus produk.\n\n" +
            error.message
        );
    }
};


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    renderProducts
);


/* =========================================================
   FILTER
========================================================= */

filterStatus.addEventListener(
    "change",
    renderProducts
);


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


if (
    mobileMenu &&
    sidebar
) {

    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );
        }
    );
}


/* =========================================================
   DATE
========================================================= */

const currentDate =
    document.getElementById(
        "currentDate"
    );


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
   INITIAL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Default pajak/biaya Shopee = Rp5.000
         */

        biayaShopeeInput.value =
            biayaShopeeInput.value ||
            "5000";


        /*
         * Harga jual otomatis
         */

        updatePricePreview();


        /*
         * Ambil data langsung dari DATABASE
         */

        loadProducts();
    }
);
