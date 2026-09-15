/* =========================================================
   QUEEN DROPSHIP - PRODUK.JS
   ========================================================= */

"use strict";

/* =========================================================
   KONFIGURASI
========================================================= */

const STORAGE_KEY = "queen_products";

// Biaya Shopee tetap
const SHOPEE_FEE = 5000;

// Pilihan margin
const MARGIN_OPTIONS = [
    10,
    12,
    15,
    20,
    21,
    25,
    50
];


/* =========================================================
   DATA PRODUK
========================================================= */

let products = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || [
    {
        id: 1,
        nama: "Kaos Basic",
        sku: "KSB-001",
        hargaSupplier: 35000,
        marginPersen: 20,
        biayaShopee: SHOPEE_FEE,
        hargaJual: 47000,
        status: "active",
        deskripsi: "Kaos basic pria dan wanita"
    },

    {
        id: 2,
        nama: "Tumbler Stainless",
        sku: "TMB-002",
        hargaSupplier: 40000,
        marginPersen: 20,
        biayaShopee: SHOPEE_FEE,
        hargaJual: 53000,
        status: "active",
        deskripsi: "Tumbler stainless"
    },

    {
        id: 3,
        nama: "Botol Minum",
        sku: "BTL-003",
        hargaSupplier: 28000,
        marginPersen: 20,
        biayaShopee: SHOPEE_FEE,
        hargaJual: 39000,
        status: "active",
        deskripsi: "Botol minum olahraga"
    }
];


/* =========================================================
   SIMPAN DATA
========================================================= */

function saveProducts() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(products)
    );

}


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function rupiah(number) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        maximumFractionDigits: 0

    }).format(Number(number) || 0);

}


/* =========================================================
   HITUNG HARGA JUAL
=========================================================

   Contoh:

   Harga supplier = Rp35.000
   Margin = 20%
   Biaya Shopee = Rp5.000

   Margin = 35.000 x 20% = 7.000

   Harga jual =
   35.000 + 7.000 + 5.000

   = Rp47.000
========================================================= */

function hitungHargaJual() {

    const hargaSupplier =
        Number(
            document.getElementById("hargaSupplier").value
        ) || 0;


    const marginSelect =
        document.getElementById("marginPersen");


    const hargaJualInput =
        document.getElementById("hargaJual");


    if (!marginSelect || !hargaJualInput) {
        return;
    }


    const marginPersen =
        Number(marginSelect.value) || 0;


    const biayaShopee =
        SHOPEE_FEE;


    const nilaiMargin =
        hargaSupplier *
        (marginPersen / 100);


    const hargaJual =
        hargaSupplier +
        nilaiMargin +
        biayaShopee;


    hargaJualInput.value =
        Math.ceil(hargaJual);


    updatePreviewHarga();

}


/* =========================================================
   PREVIEW HARGA
========================================================= */

function updatePreviewHarga() {

    const hargaSupplier =
        Number(
            document.getElementById("hargaSupplier")?.value
        ) || 0;


    const marginPersen =
        Number(
            document.getElementById("marginPersen")?.value
        ) || 0;


    const hargaJual =
        Number(
            document.getElementById("hargaJual")?.value
        ) || 0;


    const preview =
        document.getElementById("hargaPreview");


    if (!preview) {
        return;
    }


    const margin =
        hargaSupplier *
        (marginPersen / 100);


    const keuntungan =
        hargaJual -
        hargaSupplier -
        SHOPEE_FEE;


    preview.innerHTML = `

        <div>
            <span>Harga Supplier</span>
            <strong>${rupiah(hargaSupplier)}</strong>
        </div>

        <div>
            <span>Margin ${marginPersen}%</span>
            <strong>${rupiah(margin)}</strong>
        </div>

        <div>
            <span>Biaya Shopee</span>
            <strong>${rupiah(SHOPEE_FEE)}</strong>
        </div>

        <div class="preview-total">
            <span>Harga Jual</span>
            <strong>${rupiah(hargaJual)}</strong>
        </div>

        <div class="preview-profit">
            <span>Keuntungan Bersih</span>
            <strong>${rupiah(keuntungan)}</strong>
        </div>

    `;

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderProducts() {

    const table =
        document.getElementById("productTable");


    if (!table) {
        return;
    }


    const search =
        (
            document.getElementById("search")?.value
            || ""
        )
        .toLowerCase()
        .trim();


    const filter =
        document.getElementById("filterStatus")?.value
        || "all";


    const filtered =
        products.filter(product => {

            const nama =
                String(product.nama || "")
                    .toLowerCase();


            const sku =
                String(product.sku || "")
                    .toLowerCase();


            const matchSearch =
                nama.includes(search) ||
                sku.includes(search);


            const matchStatus =
                filter === "all" ||
                product.status === filter;


            return (
                matchSearch &&
                matchStatus
            );

        });


    table.innerHTML = "";


    if (filtered.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty">

                    Tidak ada produk ditemukan.

                </td>

            </tr>

        `;

    }


    filtered.forEach(product => {

        const hargaSupplier =
            Number(product.hargaSupplier) || 0;


        const hargaJual =
            Number(product.hargaJual) || 0;


        const biayaShopee =
            Number(product.biayaShopee)
            || SHOPEE_FEE;


        const marginPersen =
            Number(product.marginPersen)
            || 0;


        const keuntungan =
            hargaJual -
            hargaSupplier -
            biayaShopee;


        const firstLetter =
            String(product.nama || "?")
                .charAt(0)
                .toUpperCase();


        table.innerHTML += `

            <tr>

                <td>

                    <div class="product">

                        <div class="product-img">
                            ${escapeHtml(firstLetter)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(product.nama)}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    product.deskripsi ||
                                    "Produk"
                                )}
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(product.sku)}
                </td>


                <td class="money">
                    ${rupiah(hargaSupplier)}
                </td>


                <td class="money">
                    ${rupiah(hargaJual)}
                </td>


                <td class="profit">

                    ${rupiah(keuntungan)}

                    <small
                        style="
                            display:block;
                            color:#64748b;
                            font-size:10px;
                            margin-top:3px;
                        "
                    >
                        ${marginPersen}%
                    </small>

                </td>


                <td>

                    ${
                        product.status === "active"

                        ?

                        `<span class="status active-status">
                            Aktif
                        </span>`

                        :

                        `<span class="status inactive-status">
                            Nonaktif
                        </span>`
                    }

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="btn-edit"
                            onclick="editProduct(${product.id})">

                            Edit

                        </button>


                        <button
                            class="btn-delete"
                            onclick="deleteProduct(${product.id})">

                            Hapus

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });


    updateSummary(filtered);

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        products.length;


    const aktif =
        products.filter(
            product =>
                product.status === "active"
        ).length;


    let totalMargin =
        0;


    products.forEach(product => {

        const hargaSupplier =
            Number(product.hargaSupplier) || 0;


        const hargaJual =
            Number(product.hargaJual) || 0;


        const biayaShopee =
            Number(product.biayaShopee)
            || SHOPEE_FEE;


        totalMargin +=
            hargaJual -
            hargaSupplier -
            biayaShopee;

    });


    const average =
        total > 0
        ? totalMargin / total
        : 0;


    const totalElement =
        document.getElementById("totalProduk");


    const aktifElement =
        document.getElementById("produkAktif");


    const marginElement =
        document.getElementById("rataMargin");


    const hasilElement =
        document.getElementById("jumlahHasil");


    if (totalElement) {
        totalElement.textContent =
            total;
    }


    if (aktifElement) {
        aktifElement.textContent =
            aktif;
    }


    if (marginElement) {
        marginElement.textContent =
            rupiah(average);
    }


    if (hasilElement) {
        hasilElement.textContent =
            `${total} produk`;
    }

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal() {

    const modal =
        document.getElementById("productModal");


    const form =
        document.getElementById("productForm");


    const title =
        document.getElementById("modalTitle");


    const editId =
        document.getElementById("editId");


    if (!modal || !form) {
        return;
    }


    modal.classList.add("show");


    title.textContent =
        "Tambah Produk";


    form.reset();


    editId.value = "";


    const marginSelect =
        document.getElementById("marginPersen");


    if (marginSelect) {

        marginSelect.value =
            "20";

    }


    const biaya =
        document.getElementById("biayaShopee");


    if (biaya) {

        biaya.value =
            SHOPEE_FEE;

    }


    const hargaJual =
        document.getElementById("hargaJual");


    if (hargaJual) {

        hargaJual.value =
            "";

    }


    updatePreviewHarga();

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    const modal =
        document.getElementById("productModal");


    if (modal) {

        modal.classList.remove("show");

    }

}


/* =========================================================
   EDIT PRODUK
========================================================= */

function editProduct(id) {

    const product =
        products.find(
            product =>
                product.id === id
        );


    if (!product) {
        return;
    }


    const modal =
        document.getElementById("productModal");


    modal.classList.add("show");


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Produk";


    document.getElementById(
        "editId"
    ).value =
        product.id;


    document.getElementById(
        "nama"
    ).value =
        product.nama;


    document.getElementById(
        "sku"
    ).value =
        product.sku;


    document.getElementById(
        "hargaSupplier"
    ).value =
        product.hargaSupplier;


    document.getElementById(
        "status"
    ).value =
        product.status;


    document.getElementById(
        "deskripsi"
    ).value =
        product.deskripsi || "";


    const marginSelect =
        document.getElementById(
            "marginPersen"
        );


    if (marginSelect) {

        marginSelect.value =
            String(
                product.marginPersen || 20
            );

    }


    const biayaShopee =
        document.getElementById(
            "biayaShopee"
        );


    if (biayaShopee) {

        biayaShopee.value =
            product.biayaShopee ||
            SHOPEE_FEE;

    }


    document.getElementById(
        "hargaJual"
    ).value =
        product.hargaJual;


    updatePreviewHarga();

}


/* =========================================================
   DELETE PRODUK
========================================================= */

function deleteProduct(id) {

    const product =
        products.find(
            product =>
                product.id === id
        );


    if (!product) {
        return;
    }


    const confirmDelete =
        confirm(
            `Hapus produk "${product.nama}"?`
        );


    if (!confirmDelete) {
        return;
    }


    products =
        products.filter(
            product =>
                product.id !== id
        );


    saveProducts();

    renderProducts();

}


/* =========================================================
   SUBMIT FORM
========================================================= */

function handleProductSubmit(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "editId"
        ).value;


    const nama =
        document.getElementById(
            "nama"
        ).value.trim();


    const sku =
        document.getElementById(
            "sku"
        ).value.trim();


    const hargaSupplier =
        Number(
            document.getElementById(
                "hargaSupplier"
            ).value
        );


    const marginPersen =
        Number(
            document.getElementById(
                "marginPersen"
            )?.value
        ) || 0;


    const biayaShopee =
        Number(
            document.getElementById(
                "biayaShopee"
            )?.value
        ) || SHOPEE_FEE;


    const hargaJual =
        Number(
            document.getElementById(
                "hargaJual"
            ).value
        );


    const status =
        document.getElementById(
            "status"
        ).value;


    const deskripsi =
        document.getElementById(
            "deskripsi"
        ).value.trim();


    if (!nama) {

        alert(
            "Nama produk wajib diisi."
        );

        return;

    }


    if (!sku) {

        alert(
            "SKU wajib diisi."
        );

        return;

    }


    if (
        !Number.isFinite(hargaSupplier) ||
        hargaSupplier < 0
    ) {

        alert(
            "Harga supplier tidak valid."
        );

        return;

    }


    if (
        !Number.isFinite(hargaJual) ||
        hargaJual <= 0
    ) {

        alert(
            "Harga jual tidak valid."
        );

        return;

    }


    if (hargaJual < hargaSupplier) {

        alert(
            "Harga jual tidak boleh lebih kecil dari harga supplier."
        );

        return;

    }


    /* =========================
       EDIT
    ========================= */

    if (editId) {

        const product =
            products.find(
                product =>
                    product.id ===
                    Number(editId)
            );


        if (product) {

            product.nama =
                nama;

            product.sku =
                sku;

            product.hargaSupplier =
                hargaSupplier;

            product.marginPersen =
                marginPersen;

            product.biayaShopee =
                biayaShopee;

            product.hargaJual =
                hargaJual;

            product.status =
                status;

            product.deskripsi =
                deskripsi;

        }

    }


    /* =========================
       TAMBAH
    ========================= */

    else {

        products.push({

            id:
                Date.now(),

            nama:
                nama,

            sku:
                sku,

            hargaSupplier:
                hargaSupplier,

            marginPersen:
                marginPersen,

            biayaShopee:
                biayaShopee,

            hargaJual:
                hargaJual,

            status:
                status,

            deskripsi:
                deskripsi

        });

    }


    saveProducts();

    renderProducts();

    closeModal();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!button || !sidebar) {
        return;
    }


    button.addEventListener(
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

function setupDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {
        return;
    }


    dateElement.textContent =
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
   EVENT INPUT HARGA
========================================================= */

function setupPriceCalculation() {

    const hargaSupplier =
        document.getElementById(
            "hargaSupplier"
        );


    const marginPersen =
        document.getElementById(
            "marginPersen"
        );


    const hargaJual =
        document.getElementById(
            "hargaJual"
        );


    if (hargaSupplier) {

        hargaSupplier.addEventListener(
            "input",
            hitungHargaJual
        );

    }


    if (marginPersen) {

        marginPersen.addEventListener(
            "change",
            hitungHargaJual
        );

    }


    if (hargaJual) {

        hargaJual.addEventListener(
            "input",
            updatePreviewHarga
        );

    }

}


/* =========================================================
   EVENT SEARCH
========================================================= */

function setupSearch() {

    const search =
        document.getElementById(
            "search"
        );


    if (search) {

        search.addEventListener(
            "input",
            renderProducts
        );

    }

}


/* =========================================================
   EVENT FILTER
========================================================= */

function setupFilter() {

    const filter =
        document.getElementById(
            "filterStatus"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            renderProducts
        );

    }

}


/* =========================================================
   EVENT FORM
========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleProductSubmit
    );

}


/* =========================================================
   CLOSE MODAL KLIK LUAR
========================================================= */

function setupModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   ESC CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   NORMALISASI DATA LAMA
========================================================= */

function normalizeProducts() {

    products =
        products.map(product => {

            const hargaSupplier =
                Number(
                    product.hargaSupplier
                ) || 0;


            let hargaJual =
                Number(
                    product.hargaJual
                ) || 0;


            let marginPersen =
                Number(
                    product.marginPersen
                );


            if (
                !Number.isFinite(
                    marginPersen
                )
            ) {

                if (
                    hargaSupplier > 0 &&
                    hargaJual > hargaSupplier
                ) {

                    marginPersen =
                        (
                            (
                                hargaJual -
                                hargaSupplier
                            )
                            /
                            hargaSupplier
                        ) * 100;

                } else {

                    marginPersen = 20;

                }

            }


            const biayaShopee =
                Number(
                    product.biayaShopee
                ) || SHOPEE_FEE;


            if (!hargaJual) {

                hargaJual =
                    Math.ceil(
                        hargaSupplier +
                        (
                            hargaSupplier *
                            marginPersen /
                            100
                        ) +
                        biayaShopee
                    );

            }


            return {

                ...product,

                hargaSupplier:
                    hargaSupplier,

                hargaJual:
                    hargaJual,

                marginPersen:
                    marginPersen,

                biayaShopee:
                    biayaShopee

            };

        });


    saveProducts();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        normalizeProducts();

        setupMobileMenu();

        setupDate();

        setupPriceCalculation();

        setupSearch();

        setupFilter();

        setupForm();

        setupModal();

        renderProducts();

    }
);
