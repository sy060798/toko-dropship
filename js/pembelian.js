/* =====================================================
   QUEEN DROPSHIP
   JAVASCRIPT PEMBELIAN
===================================================== */


/* =====================================================
   DATA PEMBELIAN
===================================================== */

let purchases =
    JSON.parse(
        localStorage.getItem("queen_purchases")
    ) || [

        {
            id: 1,
            tanggal: "2026-09-14",
            produk: "Kaos Basic",
            supplier: "Supplier Fashion Jakarta",
            order: "ORD-001",
            qty: 2,
            hargaBeli: 35000,
            status: "selesai"
        },

        {
            id: 2,
            tanggal: "2026-09-14",
            produk: "Tumbler Stainless",
            supplier: "Tumbler Store",
            order: "ORD-002",
            qty: 1,
            hargaBeli: 40000,
            status: "selesai"
        },

        {
            id: 3,
            tanggal: "2026-09-15",
            produk: "Botol Minum",
            supplier: "Grosir Online",
            order: "ORD-003",
            qty: 3,
            hargaBeli: 28000,
            status: "proses"
        }

    ];


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
   SIMPAN DATA
===================================================== */

function savePurchases() {

    localStorage.setItem(
        "queen_purchases",
        JSON.stringify(purchases)
    );

}


/* =====================================================
   FORMAT TANGGAL
===================================================== */

function formatTanggal(date) {

    if (!date) {
        return "-";
    }

    const parsedDate =
        new Date(
            date + "T00:00:00"
        );

    if (isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   ESCAPE HTML
   Supaya input user aman ditampilkan ke tabel
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
   NORMALISASI DATA
===================================================== */

function normalizePurchase(item) {

    return {

        id:
            item.id,

        tanggal:
            item.tanggal ||
            "",

        produk:
            String(
                item.produk ||
                ""
            ),

        supplier:
            String(
                item.supplier ||
                ""
            ),

        order:
            String(
                item.order ||
                ""
            ),

        qty:
            Number(
                item.qty
            ) || 0,

        hargaBeli:
            Number(
                item.hargaBeli
            ) || 0,

        status:
            item.status ||
            "proses"

    };

}


/* =====================================================
   STATUS HTML
===================================================== */

function getStatusHTML(status) {

    if (status === "selesai") {

        return `
            <span class="status success-status">
                Selesai
            </span>
        `;

    }


    if (status === "proses") {

        return `
            <span class="status process-status">
                Diproses
            </span>
        `;

    }


    if (status === "batal") {

        return `
            <span class="status cancel-status">
                Batal
            </span>
        `;

    }


    return `
        <span class="status process-status">
            Diproses
        </span>
    `;

}


/* =====================================================
   GET FILTERED DATA
===================================================== */

function getFilteredPurchases() {

    const searchElement =
        document.getElementById(
            "search"
        );


    const statusElement =
        document.getElementById(
            "filterStatus"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const filterStatus =
        statusElement
            ? statusElement.value
            : "all";


    const filtered =
        purchases
            .map(normalizePurchase)
            .filter(item => {

                const produk =
                    item.produk
                        .toLowerCase();

                const supplier =
                    item.supplier
                        .toLowerCase();

                const order =
                    item.order
                        .toLowerCase();


                const cocokSearch =

                    produk.includes(search) ||

                    supplier.includes(search) ||

                    order.includes(search);


                const cocokStatus =

                    filterStatus === "all" ||

                    item.status === filterStatus;


                return (
                    cocokSearch &&
                    cocokStatus
                );

            });


    return filtered;

}


/* =====================================================
   RENDER PEMBELIAN
===================================================== */

function renderPurchases() {

    const table =
        document.getElementById(
            "purchaseTable"
        );


    if (!table) {
        return;
    }


    const filtered =
        getFilteredPurchases();


    table.innerHTML = "";


    /* =================================================
       EMPTY DATA
    ================================================= */

    if (filtered.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty">

                    Belum ada pembelian.

                </td>

            </tr>

        `;

        updateSummary(filtered);

        return;

    }


    /* =================================================
       RENDER DATA
    ================================================= */

    filtered.forEach(item => {

        const total =
            item.qty *
            item.hargaBeli;


        const firstLetter =
            item.produk
                .trim()
                .charAt(0)
                .toUpperCase() || "P";


        const statusHTML =
            getStatusHTML(
                item.status
            );


        table.innerHTML += `

            <tr>

                <!-- TANGGAL -->

                <td>
                    ${formatTanggal(item.tanggal)}
                </td>


                <!-- PRODUK -->

                <td>

                    <div class="product">

                        <div class="product-img">
                            ${escapeHtml(firstLetter)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(item.produk)}
                            </strong>

                            <span>
                                Barang dropship
                            </span>

                        </div>

                    </div>

                </td>


                <!-- SUPPLIER -->

                <td>
                    ${escapeHtml(item.supplier)}
                </td>


                <!-- ORDER -->

                <td>
                    ${escapeHtml(item.order)}
                </td>


                <!-- QTY -->

                <td>
                    ${item.qty}
                </td>


                <!-- HARGA BELI -->

                <td class="money">
                    ${rupiah(item.hargaBeli)}
                </td>


                <!-- TOTAL MODAL -->

                <td class="money">
                    ${rupiah(total)}
                </td>


                <!-- STATUS -->

                <td>
                    ${statusHTML}
                </td>


                <!-- AKSI -->

                <td>

                    <div class="actions">

                        <button
                            type="button"
                            class="btn-edit"
                            onclick="editPurchase(${item.id})">

                            Edit

                        </button>


                        <button
                            type="button"
                            class="btn-delete"
                            onclick="deletePurchase(${item.id})">

                            Hapus

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });


    updateSummary(
        filtered
    );

}


/* =====================================================
   UPDATE SUMMARY
===================================================== */

function updateSummary(filtered) {

    let totalPembelian = 0;

    let totalQty = 0;

    let totalTransaksi = 0;


    filtered.forEach(item => {

        /*
           Pembelian batal tidak dihitung
           sebagai modal aktif.
        */

        if (
            item.status === "batal"
        ) {

            return;

        }


        totalQty +=
            item.qty;


        totalPembelian +=
            item.qty *
            item.hargaBeli;


        totalTransaksi++;

    });


    const totalPembelianElement =
        document.getElementById(
            "totalPembelian"
        );


    const totalQtyElement =
        document.getElementById(
            "totalQty"
        );


    const totalTransaksiElement =
        document.getElementById(
            "totalTransaksi"
        );


    const jumlahHasilElement =
        document.getElementById(
            "jumlahHasil"
        );


    if (totalPembelianElement) {

        totalPembelianElement.textContent =
            rupiah(totalPembelian);

    }


    if (totalQtyElement) {

        totalQtyElement.textContent =
            totalQty;

    }


    if (totalTransaksiElement) {

        totalTransaksiElement.textContent =
            totalTransaksi;

    }


    if (jumlahHasilElement) {

        jumlahHasilElement.textContent =
            `${filtered.length} transaksi`;

    }

}


/* =====================================================
   OPEN MODAL TAMBAH
===================================================== */

function openModal() {

    const modal =
        document.getElementById(
            "purchaseModal"
        );


    const form =
        document.getElementById(
            "purchaseForm"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const editId =
        document.getElementById(
            "editId"
        );


    if (!modal || !form) {
        return;
    }


    form.reset();


    if (title) {

        title.textContent =
            "Tambah Pembelian";

    }


    if (editId) {

        editId.value = "";

    }


    const tanggal =
        document.getElementById(
            "tanggal"
        );


    if (tanggal) {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        tanggal.value =
            `${year}-${month}-${day}`;

    }


    const qty =
        document.getElementById(
            "qty"
        );


    if (qty) {

        qty.value = 1;

    }


    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        status.value =
            "proses";

    }


    modal.classList.add(
        "show"
    );


    setTimeout(() => {

        const produk =
            document.getElementById(
                "produk"
            );

        if (produk) {
            produk.focus();
        }

    }, 100);

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    const modal =
        document.getElementById(
            "purchaseModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    const form =
        document.getElementById(
            "purchaseForm"
        );


    if (form) {

        form.reset();

    }


    const editId =
        document.getElementById(
            "editId"
        );


    if (editId) {

        editId.value = "";

    }


    const title =
        document.getElementById(
            "modalTitle"
        );


    if (title) {

        title.textContent =
            "Tambah Pembelian";

    }

}


/* =====================================================
   EDIT PEMBELIAN
===================================================== */

function editPurchase(id) {

    const item =
        purchases.find(
            purchase =>
                Number(purchase.id) ===
                Number(id)
        );


    if (!item) {

        alert(
            "Data pembelian tidak ditemukan."
        );

        return;

    }


    const modal =
        document.getElementById(
            "purchaseModal"
        );


    if (!modal) {
        return;
    }


    const title =
        document.getElementById(
            "modalTitle"
        );


    const editId =
        document.getElementById(
            "editId"
        );


    const tanggal =
        document.getElementById(
            "tanggal"
        );


    const produk =
        document.getElementById(
            "produk"
        );


    const supplier =
        document.getElementById(
            "supplier"
        );


    const order =
        document.getElementById(
            "order"
        );


    const qty =
        document.getElementById(
            "qty"
        );


    const hargaBeli =
        document.getElementById(
            "hargaBeli"
        );


    const status =
        document.getElementById(
            "status"
        );


    if (title) {

        title.textContent =
            "Edit Pembelian";

    }


    if (editId) {

        editId.value =
            item.id;

    }


    if (tanggal) {

        tanggal.value =
            item.tanggal || "";

    }


    if (produk) {

        produk.value =
            item.produk || "";

    }


    if (supplier) {

        supplier.value =
            item.supplier || "";

    }


    if (order) {

        order.value =
            item.order || "";

    }


    if (qty) {

        qty.value =
            item.qty || 1;

    }


    if (hargaBeli) {

        hargaBeli.value =
            item.hargaBeli || 0;

    }


    if (status) {

        status.value =
            item.status || "proses";

    }


    modal.classList.add(
        "show"
    );


    setTimeout(() => {

        if (produk) {
            produk.focus();
        }

    }, 100);

}


/* =====================================================
   HAPUS PEMBELIAN
===================================================== */

function deletePurchase(id) {

    const item =
        purchases.find(
            purchase =>
                Number(purchase.id) ===
                Number(id)
        );


    if (!item) {

        alert(
            "Data pembelian tidak ditemukan."
        );

        return;

    }


    const yakin =
        confirm(
            `Hapus pembelian "${item.order}"?`
        );


    if (!yakin) {
        return;
    }


    purchases =
        purchases.filter(
            purchase =>
                Number(purchase.id) !==
                Number(id)
        );


    savePurchases();

    renderPurchases();

}


/* =====================================================
   SUBMIT FORM PEMBELIAN
===================================================== */

const purchaseForm =
    document.getElementById(
        "purchaseForm"
    );


if (purchaseForm) {

    purchaseForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /* =========================================
               AMBIL INPUT
            ========================================= */

            const editId =
                document.getElementById(
                    "editId"
                ).value;


            const tanggal =
                document.getElementById(
                    "tanggal"
                ).value;


            const produk =
                document.getElementById(
                    "produk"
                ).value
                .trim();


            const supplier =
                document.getElementById(
                    "supplier"
                ).value
                .trim();


            const order =
                document.getElementById(
                    "order"
                ).value
                .trim();


            const qty =
                Number(
                    document.getElementById(
                        "qty"
                    ).value
                );


            const hargaBeli =
                Number(
                    document.getElementById(
                        "hargaBeli"
                    ).value
                );


            const status =
                document.getElementById(
                    "status"
                ).value;


            /* =========================================
               VALIDASI
            ========================================= */

            if (!tanggal) {

                alert(
                    "Tanggal pembelian wajib diisi."
                );

                return;

            }


            if (!produk) {

                alert(
                    "Nama produk wajib diisi."
                );

                return;

            }


            if (!supplier) {

                alert(
                    "Nama supplier wajib diisi."
                );

                return;

            }


            if (!order) {

                alert(
                    "Nomor order wajib diisi."
                );

                return;

            }


            if (
                !Number.isFinite(qty) ||
                qty <= 0
            ) {

                alert(
                    "QTY harus lebih dari 0."
                );

                return;

            }


            if (
                !Number.isFinite(hargaBeli) ||
                hargaBeli < 0
            ) {

                alert(
                    "Harga beli tidak valid."
                );

                return;

            }


            if (
                ![
                    "proses",
                    "selesai",
                    "batal"
                ].includes(status)
            ) {

                alert(
                    "Status pembelian tidak valid."
                );

                return;

            }


            /* =========================================
               EDIT DATA
            ========================================= */

            if (editId) {

                const item =
                    purchases.find(
                        purchase =>
                            Number(purchase.id) ===
                            Number(editId)
                    );


                if (!item) {

                    alert(
                        "Data pembelian tidak ditemukan."
                    );

                    return;

                }


                item.tanggal =
                    tanggal;


                item.produk =
                    produk;


                item.supplier =
                    supplier;


                item.order =
                    order;


                item.qty =
                    qty;


                item.hargaBeli =
                    hargaBeli;


                item.status =
                    status;


                savePurchases();

                renderPurchases();

                closeModal();

                return;

            }


            /* =========================================
               TAMBAH DATA BARU
            ========================================= */

            const newPurchase = {

                id:
                    Date.now(),

                tanggal:
                    tanggal,

                produk:
                    produk,

                supplier:
                    supplier,

                order:
                    order,

                qty:
                    qty,

                hargaBeli:
                    hargaBeli,

                status:
                    status

            };


            purchases.push(
                newPurchase
            );


            savePurchases();

            renderPurchases();

            closeModal();

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
        function() {

            renderPurchases();

        }
    );

}


/* =====================================================
   FILTER STATUS
===================================================== */

const filterStatus =
    document.getElementById(
        "filterStatus"
    );


if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        function() {

            renderPurchases();

        }
    );

}


/* =====================================================
   MOBILE MENU
===================================================== */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function() {

            const sidebar =
                document.getElementById(
                    "sidebar"
                );


            if (!sidebar) {
                return;
            }


            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


/* =====================================================
   TUTUP SIDEBAR SAAT KLIK MENU
===================================================== */

const menuLinks =
    document.querySelectorAll(
        ".menu a"
    );


menuLinks.forEach(link => {

    link.addEventListener(
        "click",
        function() {

            if (
                window.innerWidth <= 900
            ) {

                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );


                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }

        }
    );

});


/* =====================================================
   TANGGAL DI TOPBAR
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
   TUTUP MODAL KETIKA KLIK AREA LUAR
===================================================== */

const purchaseModal =
    document.getElementById(
        "purchaseModal"
    );


if (purchaseModal) {

    purchaseModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                purchaseModal
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   TOMBOL ESC UNTUK TUTUP MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "purchaseModal"
                );


            if (
                modal &&
                modal.classList.contains("show")
            ) {

                closeModal();

            }

        }

    }
);


/* =====================================================
   SINKRONISASI LOCALSTORAGE
   Jika data diubah dari halaman/tab lain
===================================================== */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            "queen_purchases"
        ) {

            try {

                purchases =
                    JSON.parse(
                        event.newValue
                    ) || [];

            } catch (error) {

                purchases = [];

            }


            renderPurchases();

        }

    }
);


/* =====================================================
   CEK DATA LOCALSTORAGE
===================================================== */

function loadPurchases() {

    try {

        const saved =
            localStorage.getItem(
                "queen_purchases"
            );


        if (
            saved !== null
        ) {

            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(parsed)
            ) {

                purchases =
                    parsed;

            }

        }

    } catch (error) {

        console.error(
            "Gagal membaca data pembelian:",
            error
        );

    }

}


/* =====================================================
   START APPLICATION
===================================================== */

loadPurchases();

renderPurchases();
