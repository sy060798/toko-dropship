<script>

    /* =====================================================
       QUEEN DROPSHIP - JAVASCRIPT PRODUK
       Storage : queen_products
    ===================================================== */


    /* =====================================================
       DATA PRODUK
    ===================================================== */

    const DEFAULT_PRODUCTS = [

        {
            id: 1,
            nama: "Kaos Basic",
            sku: "KSB-001",
            hargaSupplier: 35000,
            hargaJual: 59000,
            status: "active",
            deskripsi: "Kaos basic pria dan wanita"
        },

        {
            id: 2,
            nama: "Tumbler Stainless",
            sku: "TMB-002",
            hargaSupplier: 40000,
            hargaJual: 69000,
            status: "active",
            deskripsi: "Tumbler stainless"
        },

        {
            id: 3,
            nama: "Botol Minum",
            sku: "BTL-003",
            hargaSupplier: 28000,
            hargaJual: 45000,
            status: "active",
            deskripsi: "Botol minum olahraga"
        }

    ];


    let products = loadProducts();


    /* =====================================================
       LOAD DATA
    ===================================================== */

    function loadProducts() {

        try {

            const saved =
                localStorage.getItem(
                    "queen_products"
                );


            if (saved) {

                const data =
                    JSON.parse(saved);


                if (Array.isArray(data)) {

                    return data;

                }

            }

        } catch (error) {

            console.error(
                "Gagal membaca data produk:",
                error
            );

        }


        const initialData =
            DEFAULT_PRODUCTS.map(product => ({
                ...product
            }));


        localStorage.setItem(
            "queen_products",
            JSON.stringify(initialData)
        );


        return initialData;

    }


    /* =====================================================
       SIMPAN DATA
    ===================================================== */

    function saveProducts() {

        try {

            localStorage.setItem(
                "queen_products",
                JSON.stringify(products)
            );

        } catch (error) {

            console.error(
                "Gagal menyimpan produk:",
                error
            );

            alert(
                "Data produk gagal disimpan."
            );

        }

    }


    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    function rupiah(number) {

        number = Number(number) || 0;


        return new Intl.NumberFormat(
            "id-ID",
            {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")

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


    /* =====================================================
       RENDER PRODUK
    ===================================================== */

    function renderProducts() {

        const table =
            document.getElementById(
                "productTable"
            );


        if (!table) return;


        const searchElement =
            document.getElementById(
                "search"
            );


        const filterElement =
            document.getElementById(
                "filterStatus"
            );


        const search =
            (
                searchElement?.value || ""
            )
            .trim()
            .toLowerCase();


        const filter =
            filterElement?.value || "all";


        const filtered =
            products.filter(product => {

                const nama =
                    String(
                        product.nama || ""
                    )
                    .toLowerCase();


                const sku =
                    String(
                        product.sku || ""
                    )
                    .toLowerCase();


                const matchSearch =
                    nama.includes(search)
                    ||
                    sku.includes(search);


                const matchStatus =
                    filter === "all"
                    ||
                    product.status === filter;


                return (
                    matchSearch &&
                    matchStatus
                );

            });


        table.innerHTML = "";


        /* =========================
           EMPTY
        ========================= */

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


        /* =========================
           DATA
        ========================= */

        filtered.forEach(product => {

            const hargaSupplier =
                Number(
                    product.hargaSupplier
                ) || 0;


            const hargaJual =
                Number(
                    product.hargaJual
                ) || 0;


            const margin =
                hargaJual -
                hargaSupplier;


            const nama =
                String(
                    product.nama || "-"
                );


            const sku =
                String(
                    product.sku || "-"
                );


            const deskripsi =
                String(
                    product.deskripsi || "Produk"
                );


            const firstLetter =
                nama
                    .charAt(0)
                    .toUpperCase();


            const statusHTML =

                product.status === "active"

                ?

                `
                    <span class="status active-status">
                        Aktif
                    </span>
                `

                :

                `
                    <span class="status inactive-status">
                        Nonaktif
                    </span>
                `;


            const row = document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="product">

                        <div class="product-img">

                            ${escapeHtml(firstLetter)}

                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(nama)}
                            </strong>

                            <span>
                                ${escapeHtml(deskripsi)}
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(sku)}
                </td>


                <td class="money">
                    ${rupiah(hargaSupplier)}
                </td>


                <td class="money">
                    ${rupiah(hargaJual)}
                </td>


                <td class="profit">
                    ${rupiah(margin)}
                </td>


                <td>
                    ${statusHTML}
                </td>


                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="btn-edit"
                            data-action="edit"
                            data-id="${product.id}">

                            Edit

                        </button>


                        <button
                            type="button"
                            class="btn-delete"
                            data-action="delete"
                            data-id="${product.id}">

                            Hapus

                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        });


        updateSummary(filtered);

    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary(filtered = products) {

        const total =
            products.length;


        const aktif =
            products.filter(
                product =>
                    product.status === "active"
            ).length;


        let totalMargin = 0;


        products.forEach(product => {

            const hargaSupplier =
                Number(
                    product.hargaSupplier
                ) || 0;


            const hargaJual =
                Number(
                    product.hargaJual
                ) || 0;


            totalMargin +=
                hargaJual -
                hargaSupplier;

        });


        const average =
            total > 0
            ?
            totalMargin / total
            :
            0;


        const totalElement =
            document.getElementById(
                "totalProduk"
            );


        const aktifElement =
            document.getElementById(
                "produkAktif"
            );


        const marginElement =
            document.getElementById(
                "rataMargin"
            );


        const jumlahElement =
            document.getElementById(
                "jumlahHasil"
            );


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


        if (jumlahElement) {

            jumlahElement.textContent =
                `${filtered.length} produk`;

        }

    }


    /* =====================================================
       OPEN MODAL - TAMBAH
    ===================================================== */

    function openModal() {

        const modal =
            document.getElementById(
                "productModal"
            );


        const form =
            document.getElementById(
                "productForm"
            );


        const title =
            document.getElementById(
                "modalTitle"
            );


        const editId =
            document.getElementById(
                "editId"
            );


        if (!modal || !form) return;


        form.reset();


        if (title) {

            title.textContent =
                "Tambah Produk";

        }


        if (editId) {

            editId.value = "";

        }


        modal.classList.add("show");


        setTimeout(() => {

            document
                .getElementById("nama")
                ?.focus();

        }, 100);

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        const modal =
            document.getElementById(
                "productModal"
            );


        if (!modal) return;


        modal.classList.remove("show");

    }


    /* =====================================================
       EDIT PRODUK
    ===================================================== */

    function editProduct(id) {

        const product =
            products.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!product) {

            alert(
                "Produk tidak ditemukan."
            );

            return;

        }


        const modal =
            document.getElementById(
                "productModal"
            );


        const title =
            document.getElementById(
                "modalTitle"
            );


        const editId =
            document.getElementById(
                "editId"
            );


        if (!modal) return;


        modal.classList.add("show");


        if (title) {

            title.textContent =
                "Edit Produk";

        }


        if (editId) {

            editId.value =
                product.id;

        }


        document.getElementById(
            "nama"
        ).value =
            product.nama || "";


        document.getElementById(
            "sku"
        ).value =
            product.sku || "";


        document.getElementById(
            "hargaSupplier"
        ).value =
            Number(
                product.hargaSupplier
            ) || 0;


        document.getElementById(
            "hargaJual"
        ).value =
            Number(
                product.hargaJual
            ) || 0;


        document.getElementById(
            "status"
        ).value =
            product.status || "active";


        document.getElementById(
            "deskripsi"
        ).value =
            product.deskripsi || "";

    }


    /* =====================================================
       DELETE PRODUK
    ===================================================== */

    function deleteProduct(id) {

        const index =
            products.findIndex(
                product =>
                    Number(product.id) ===
                    Number(id)
            );


        if (index === -1) {

            alert(
                "Produk tidak ditemukan."
            );

            return;

        }


        const product =
            products[index];


        const yakin =
            confirm(
                `Hapus produk "${product.nama}"?`
            );


        if (!yakin) return;


        products.splice(
            index,
            1
        );


        saveProducts();

        renderProducts();

    }


    /* =====================================================
       SUBMIT FORM
    ===================================================== */

    const productForm =
        document.getElementById(
            "productForm"
        );


    if (productForm) {

        productForm.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();


                const editId =
                    document.getElementById(
                        "editId"
                    ).value;


                const nama =
                    document.getElementById(
                        "nama"
                    ).value
                    .trim();


                const sku =
                    document.getElementById(
                        "sku"
                    ).value
                    .trim();


                const hargaSupplier =
                    Number(
                        document.getElementById(
                            "hargaSupplier"
                        ).value
                    );


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
                    ).value
                    .trim();


                /* =========================
                   VALIDASI
                ========================= */

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
                    !Number.isFinite(
                        hargaSupplier
                    )
                    ||
                    hargaSupplier < 0
                ) {

                    alert(
                        "Harga supplier tidak valid."
                    );

                    return;

                }


                if (
                    !Number.isFinite(
                        hargaJual
                    )
                    ||
                    hargaJual < 0
                ) {

                    alert(
                        "Harga jual tidak valid."
                    );

                    return;

                }


                if (
                    hargaJual <
                    hargaSupplier
                ) {

                    alert(
                        "Harga jual tidak boleh lebih kecil dari harga supplier."
                    );

                    return;

                }


                /* =========================
                   CEK SKU DUPLIKAT
                ========================= */

                const duplicateSKU =
                    products.some(product => {

                        const sameSKU =
                            String(
                                product.sku
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            sku
                                .toLowerCase();


                        const sameProduct =
                            editId
                            &&
                            Number(
                                product.id
                            ) ===
                            Number(editId);


                        return (
                            sameSKU &&
                            !sameProduct
                        );

                    });


                if (duplicateSKU) {

                    alert(
                        `SKU "${sku}" sudah digunakan produk lain.`
                    );

                    return;

                }


                /* =========================
                   EDIT
                ========================= */

                if (editId) {

                    const product =
                        products.find(
                            item =>
                                Number(
                                    item.id
                                ) ===
                                Number(editId)
                        );


                    if (!product) {

                        alert(
                            "Produk yang ingin diedit tidak ditemukan."
                        );

                        return;

                    }


                    product.nama =
                        nama;


                    product.sku =
                        sku;


                    product.hargaSupplier =
                        hargaSupplier;


                    product.hargaJual =
                        hargaJual;


                    product.status =
                        status;


                    product.deskripsi =
                        deskripsi;

                }


                /* =========================
                   TAMBAH
                ========================= */

                else {

                    products.push({

                        id:
                            Date.now(),

                        nama,

                        sku,

                        hargaSupplier,

                        hargaJual,

                        status,

                        deskripsi

                    });

                }


                /* =========================
                   SAVE + RENDER
                ========================= */

                saveProducts();

                renderProducts();

                closeModal();

            }
        );

    }


    /* =====================================================
       EVENT TABLE
       Tidak perlu onclick inline
    ===================================================== */

    const productTable =
        document.getElementById(
            "productTable"
        );


    if (productTable) {

        productTable.addEventListener(
            "click",
            function(event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) return;


                const id =
                    button.dataset.id;


                const action =
                    button.dataset.action;


                if (action === "edit") {

                    editProduct(id);

                }


                if (action === "delete") {

                    deleteProduct(id);

                }

            }
        );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    const searchInput =
        document.getElementById(
            "search"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderProducts
        );

    }


    /* =====================================================
       FILTER
    ===================================================== */

    const filterStatus =
        document.getElementById(
            "filterStatus"
        );


    if (filterStatus) {

        filterStatus.addEventListener(
            "change",
            renderProducts
        );

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

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
            function() {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* =====================================================
       CLOSE SIDEBAR SAAT MENU DIKLIK
    ===================================================== */

    if (sidebar) {

        sidebar
            .querySelectorAll(".menu a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    function() {

                        sidebar.classList.remove(
                            "open"
                        );

                    }
                );

            });

    }


    /* =====================================================
       CLOSE MODAL KLIK AREA LUAR
    ===================================================== */

    const productModal =
        document.getElementById(
            "productModal"
        );


    if (productModal) {

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

    }


    /* =====================================================
       ESC UNTUK CLOSE MODAL
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();

                sidebar?.classList.remove(
                    "open"
                );

            }

        }
    );


    /* =====================================================
       TANGGAL HARI INI
    ===================================================== */

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


    /* =====================================================
       SINKRONISASI ANTAR TAB
       
       Kalau produk diubah dari tab lain,
       halaman ini otomatis membaca ulang.
    ===================================================== */

    window.addEventListener(
        "storage",
        function(event) {

            if (
                event.key ===
                "queen_products"
            ) {

                products =
                    loadProducts();

                renderProducts();

            }

        }
    );


    /* =====================================================
       START
    ===================================================== */

    renderProducts();

</script>
