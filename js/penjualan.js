<script>

/* =====================================================
   STORAGE KEY
===================================================== */

const SALES_STORAGE_KEY = "queen_sales";
const PURCHASE_STORAGE_KEY = "queen_purchases";


/* =====================================================
   DATA DEFAULT
   HANYA DIGUNAKAN JIKA queen_sales BELUM ADA
===================================================== */

const defaultSales = [

    {
        id: 1,
        tanggal: "2026-09-14",
        produk: "Kaos Basic",
        order: "ORD-001",
        qty: 2,
        modal: 35000,
        hargaJual: 59000,
        status: "selesai"
    },

    {
        id: 2,
        tanggal: "2026-09-14",
        produk: "Tumbler Stainless",
        order: "ORD-002",
        qty: 1,
        modal: 40000,
        hargaJual: 69000,
        status: "selesai"
    },

    {
        id: 3,
        tanggal: "2026-09-15",
        produk: "Botol Minum",
        order: "ORD-003",
        qty: 3,
        modal: 28000,
        hargaJual: 45000,
        status: "proses"
    }

];


/* =====================================================
   LOAD SALES
===================================================== */

function loadSales() {

    const saved =
        localStorage.getItem(
            SALES_STORAGE_KEY
        );


    /*
     * Kalau key sudah ada,
     * jangan masukkan data default lagi.
     */

    if (saved !== null) {

        try {

            const parsed =
                JSON.parse(saved);


            if (Array.isArray(parsed)) {

                return parsed;

            }

        } catch (error) {

            console.error(
                "Data penjualan tidak valid:",
                error
            );

        }

    }


    /*
     * Data hanya dibuat pertama kali.
     */

    const initialData =
        JSON.parse(
            JSON.stringify(
                defaultSales
            )
        );


    localStorage.setItem(
        SALES_STORAGE_KEY,
        JSON.stringify(initialData)
    );


    return initialData;

}


let sales =
    loadSales();


/* =====================================================
   LOAD PEMBELIAN
===================================================== */

function loadPurchases() {

    const saved =
        localStorage.getItem(
            PURCHASE_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Data pembelian tidak valid:",
            error
        );

        return [];

    }

}


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function rupiah(number) {

    const value =
        Number(number) || 0;


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =====================================================
   SAVE SALES
===================================================== */

function saveSales() {

    localStorage.setItem(
        SALES_STORAGE_KEY,
        JSON.stringify(sales)
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


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

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
   TANGGAL HARI INI
   Aman untuk timezone Indonesia
===================================================== */

function getTodayLocal() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =====================================================
   NORMALISASI DATA PENJUALAN
===================================================== */

function normalizeSale(sale) {

    return {

        id:
            Number(sale.id) ||
            Date.now(),

        tanggal:
            String(
                sale.tanggal || ""
            ),

        produk:
            String(
                sale.produk || ""
            ),

        order:
            String(
                sale.order || ""
            ),

        qty:
            Math.max(
                0,
                Number(sale.qty) || 0
            ),

        modal:
            Math.max(
                0,
                Number(sale.modal) || 0
            ),

        hargaJual:
            Math.max(
                0,
                Number(sale.hargaJual) || 0
            ),

        status:
            [
                "selesai",
                "proses",
                "batal"
            ].includes(
                sale.status
            )
                ? sale.status
                : "proses"

    };

}


/* =====================================================
   NORMALISASI SEMUA SALES
===================================================== */

function normalizeSales() {

    sales =
        sales.map(
            normalizeSale
        );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

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
   STATUS HTML
===================================================== */

function getStatusHTML(status) {

    if (
        status === "selesai"
    ) {

        return `

            <span class="status success-status">
                Selesai
            </span>

        `;

    }


    if (
        status === "proses"
    ) {

        return `

            <span class="status process-status">
                Diproses
            </span>

        `;

    }


    if (
        status === "batal"
    ) {

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
   CARI HARGA BELI DARI PEMBELIAN
===================================================== */

function getHargaBeliProduk(
    namaProduk
) {

    const purchases =
        loadPurchases();


    if (!namaProduk) {

        return null;

    }


    const target =
        namaProduk
            .trim()
            .toLowerCase();


    /*
     * Ambil pembelian terbaru
     * untuk produk tersebut.
     */

    const matches =
        purchases
            .filter(item => {

                if (
                    item.status ===
                    "batal"
                ) {

                    return false;

                }


                return String(
                    item.produk || ""
                )
                    .trim()
                    .toLowerCase()
                    === target;

            })
            .sort(
                (a, b) => {

                    return (
                        String(
                            b.tanggal || ""
                        )
                        .localeCompare(
                            String(
                                a.tanggal || ""
                            )
                        )
                    );

                }
            );


    if (
        matches.length === 0
    ) {

        return null;

    }


    const harga =
        Number(
            matches[0].hargaBeli
        );


    if (
        !Number.isFinite(harga)
    ) {

        return null;

    }


    return harga;

}


/* =====================================================
   RENDER SALES
===================================================== */

function renderSales() {

    const table =
        document.getElementById(
            "salesTable"
        );


    if (!table) {

        return;

    }


    const searchElement =
        document.getElementById(
            "search"
        );


    const filterElement =
        document.getElementById(
            "filterStatus"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        filterElement
            ? filterElement.value
            : "all";


    const filtered =
        sales.filter(
            sale => {

                const produk =
                    String(
                        sale.produk || ""
                    )
                    .toLowerCase();


                const order =
                    String(
                        sale.order || ""
                    )
                    .toLowerCase();


                const matchSearch =

                    produk.includes(
                        search
                    )

                    ||

                    order.includes(
                        search
                    );


                const matchStatus =

                    filter === "all"

                    ||

                    sale.status ===
                    filter;


                return (
                    matchSearch &&
                    matchStatus
                );

            }
        );


    table.innerHTML = "";


    /* =================================================
       EMPTY
    ================================================== */

    if (
        filtered.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty">

                    Belum ada transaksi.

                </td>

            </tr>

        `;


        updateSummary(
            filtered
        );


        return;

    }


    /* =================================================
       RENDER DATA
    ================================================== */

    filtered.forEach(
        sale => {

            const qty =
                Number(
                    sale.qty
                ) || 0;


            const modal =
                Number(
                    sale.modal
                ) || 0;


            const hargaJual =
                Number(
                    sale.hargaJual
                ) || 0;


            const modalTotal =
                modal *
                qty;


            const omzet =
                hargaJual *
                qty;


            const profit =
                omzet -
                modalTotal;


            const produk =
                String(
                    sale.produk || ""
                );


            const firstLetter =
                produk
                    .charAt(0)
                    .toUpperCase() ||
                "P";


            const statusHTML =
                getStatusHTML(
                    sale.status
                );


            /*
             * Jika profit negatif,
             * tetap tampil merah.
             */

            const profitClass =
                profit < 0
                    ? "profit negative-profit"
                    : "profit";


            table.innerHTML += `

                <tr>

                    <td>
                        ${formatTanggal(
                            sale.tanggal
                        )}
                    </td>


                    <td>

                        <div class="product">

                            <div class="product-img">
                                ${escapeHtml(
                                    firstLetter
                                )}
                            </div>


                            <div>

                                <strong>
                                    ${escapeHtml(
                                        sale.produk
                                    )}
                                </strong>

                                <span>
                                    Barang dropship
                                </span>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHtml(
                            sale.order
                        )}
                    </td>


                    <td>
                        ${qty}
                    </td>


                    <td class="money">
                        ${rupiah(
                            modalTotal
                        )}
                    </td>


                    <td class="money">
                        ${rupiah(
                            omzet
                        )}
                    </td>


                    <td class="${profitClass}">
                        ${rupiah(
                            profit
                        )}
                    </td>


                    <td>
                        ${statusHTML}
                    </td>


                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="btn-edit"
                                onclick="editSale(${sale.id})">

                                Edit

                            </button>


                            <button
                                type="button"
                                class="btn-delete"
                                onclick="deleteSale(${sale.id})">

                                Hapus

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    updateSummary(
        filtered
    );

}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(
    filtered
) {

    let totalQty = 0;

    let totalOmzet = 0;

    let totalProfit = 0;


    filtered.forEach(
        sale => {

            /*
             * Transaksi batal
             * tidak dihitung.
             */

            if (
                sale.status ===
                "batal"
            ) {

                return;

            }


            const qty =
                Number(
                    sale.qty
                ) || 0;


            const modal =
                Number(
                    sale.modal
                ) || 0;


            const hargaJual =
                Number(
                    sale.hargaJual
                ) || 0;


            totalQty +=
                qty;


            totalOmzet +=
                hargaJual *
                qty;


            totalProfit +=
                (
                    hargaJual -
                    modal
                ) *
                qty;

        }
    );


    const totalTerjual =
        document.getElementById(
            "totalTerjual"
        );


    const totalOmzetElement =
        document.getElementById(
            "totalOmzet"
        );


    const totalProfitElement =
        document.getElementById(
            "totalProfit"
        );


    const jumlahHasil =
        document.getElementById(
            "jumlahHasil"
        );


    if (
        totalTerjual
    ) {

        totalTerjual.textContent =
            totalQty;

    }


    if (
        totalOmzetElement
    ) {

        totalOmzetElement.textContent =
            rupiah(
                totalOmzet
            );

    }


    if (
        totalProfitElement
    ) {

        totalProfitElement.textContent =
            rupiah(
                totalProfit
            );

    }


    if (
        jumlahHasil
    ) {

        jumlahHasil.textContent =
            `${filtered.length} transaksi`;

    }

}


/* =====================================================
   OPEN MODAL
===================================================== */

function openModal() {

    const modal =
        document.getElementById(
            "saleModal"
        );


    const form =
        document.getElementById(
            "saleForm"
        );


    if (
        !modal ||
        !form
    ) {

        return;

    }


    form.reset();


    const title =
        document.getElementById(
            "modalTitle"
        );


    if (title) {

        title.textContent =
            "Tambah Penjualan";

    }


    const editId =
        document.getElementById(
            "editId"
        );


    if (editId) {

        editId.value = "";

    }


    const tanggal =
        document.getElementById(
            "tanggal"
        );


    if (tanggal) {

        tanggal.value =
            getTodayLocal();

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
            "selesai";

    }


    modal.classList.add(
        "show"
    );

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    const modal =
        document.getElementById(
            "saleModal"
        );


    if (
        !modal
    ) {

        return;

    }


    modal.classList.remove(
        "show"
    );

}


/* =====================================================
   EDIT SALE
===================================================== */

function editSale(id) {

    const numericId =
        Number(id);


    const sale =
        sales.find(
            item =>
                Number(item.id) ===
                numericId
        );


    if (!sale) {

        alert(
            "Data penjualan tidak ditemukan."
        );

        return;

    }


    const modal =
        document.getElementById(
            "saleModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    if (title) {

        title.textContent =
            "Edit Penjualan";

    }


    document.getElementById(
        "editId"
    ).value =
        sale.id;


    document.getElementById(
        "tanggal"
    ).value =
        sale.tanggal;


    document.getElementById(
        "produk"
    ).value =
        sale.produk;


    document.getElementById(
        "order"
    ).value =
        sale.order;


    document.getElementById(
        "qty"
    ).value =
        sale.qty;


    document.getElementById(
        "modal"
    ).value =
        sale.modal;


    document.getElementById(
        "hargaJual"
    ).value =
        sale.hargaJual;


    document.getElementById(
        "status"
    ).value =
        sale.status;


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


/* =====================================================
   DELETE SALE
===================================================== */

function deleteSale(id) {

    const numericId =
        Number(id);


    const sale =
        sales.find(
            item =>
                Number(item.id) ===
                numericId
        );


    if (!sale) {

        alert(
            "Data penjualan tidak ditemukan."
        );

        return;

    }


    const yakin =
        confirm(
            `Hapus transaksi "${sale.order}"?`
        );


    if (!yakin) {

        return;

    }


    sales =
        sales.filter(
            item =>
                Number(item.id) !==
                numericId
        );


    saveSales();

    renderSales();

}


/* =====================================================
   SUBMIT FORM
===================================================== */

const saleForm =
    document.getElementById(
        "saleForm"
    );


if (
    saleForm
) {

    saleForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


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
                ).value.trim();


            const order =
                document.getElementById(
                    "order"
                ).value.trim();


            const qty =
                Number(
                    document.getElementById(
                        "qty"
                    ).value
                );


            const modal =
                Number(
                    document.getElementById(
                        "modal"
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


            /* =========================================
               VALIDASI
            ========================================== */

            if (!tanggal) {

                alert(
                    "Tanggal wajib diisi."
                );

                return;

            }


            if (!produk) {

                alert(
                    "Nama produk wajib diisi."
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
                !Number.isFinite(modal) ||
                modal < 0
            ) {

                alert(
                    "Modal tidak valid."
                );

                return;

            }


            if (
                !Number.isFinite(hargaJual) ||
                hargaJual < 0
            ) {

                alert(
                    "Harga jual tidak valid."
                );

                return;

            }


            if (
                ![
                    "selesai",
                    "proses",
                    "batal"
                ].includes(
                    status
                )
            ) {

                alert(
                    "Status tidak valid."
                );

                return;

            }


            /* =========================================
               EDIT
            ========================================== */

            if (
                editId
            ) {

                const numericId =
                    Number(
                        editId
                    );


                const sale =
                    sales.find(
                        item =>
                            Number(
                                item.id
                            ) ===
                            numericId
                    );


                if (!sale) {

                    alert(
                        "Data penjualan tidak ditemukan."
                    );

                    return;

                }


                sale.tanggal =
                    tanggal;


                sale.produk =
                    produk;


                sale.order =
                    order;


                sale.qty =
                    qty;


                sale.modal =
                    modal;


                sale.hargaJual =
                    hargaJual;


                sale.status =
                    status;

            }


            /* =========================================
               TAMBAH
            ========================================== */

            else {

                const newSale = {

                    id:
                        generateSaleId(),

                    tanggal:
                        tanggal,

                    produk:
                        produk,

                    order:
                        order,

                    qty:
                        qty,

                    modal:
                        modal,

                    hargaJual:
                        hargaJual,

                    status:
                        status

                };


                sales.push(
                    newSale
                );

            }


            /* =========================================
               SIMPAN
            ========================================== */

            saveSales();

            renderSales();

            closeModal();

        }
    );

}


/* =====================================================
   AUTO ISI MODAL DARI PEMBELIAN
=====================================================

   Ketika nama produk diketik,
   sistem mencoba mengambil harga beli
   terbaru dari queen_purchases.

   Harga tetap bisa diganti manual.

===================================================== */

const produkInput =
    document.getElementById(
        "produk"
    );


if (
    produkInput
) {

    produkInput.addEventListener(
        "blur",
        function() {

            const namaProduk =
                this.value.trim();


            if (!namaProduk) {

                return;

            }


            const hargaBeli =
                getHargaBeliProduk(
                    namaProduk
                );


            if (
                hargaBeli === null
            ) {

                return;

            }


            const modalInput =
                document.getElementById(
                    "modal"
                );


            /*
             * Jangan menimpa modal ketika
             * user sedang EDIT data lama.
             */

            const editId =
                document.getElementById(
                    "editId"
                );


            if (
                editId &&
                editId.value
            ) {

                return;

            }


            if (
                modalInput
            ) {

                modalInput.value =
                    hargaBeli;

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


if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        renderSales
    );

}


/* =====================================================
   FILTER
===================================================== */

const filterStatus =
    document.getElementById(
        "filterStatus"
    );


if (
    filterStatus
) {

    filterStatus.addEventListener(
        "change",
        renderSales
    );

}


/* =====================================================
   MOBILE MENU
===================================================== */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (
    mobileMenu
) {

    mobileMenu.addEventListener(
        "click",
        function() {

            const sidebar =
                document.getElementById(
                    "sidebar"
                );


            if (
                sidebar
            ) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


/* =====================================================
   CLOSE SIDEBAR SETELAH MENU DIKLIK
===================================================== */

const menuLinks =
    document.querySelectorAll(
        ".menu a"
    );


menuLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            function() {

                if (
                    window.innerWidth <=
                    900
                ) {

                    const sidebar =
                        document.getElementById(
                            "sidebar"
                        );


                    if (
                        sidebar
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                    }

                }

            }
        );

    }
);


/* =====================================================
   CLOSE MODAL KLIK LUAR
===================================================== */

const saleModal =
    document.getElementById(
        "saleModal"
    );


if (
    saleModal
) {

    saleModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                saleModal
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   ESC CLOSE MODAL
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

        }

    }
);


/* =====================================================
   GENERATE ID
===================================================== */

function generateSaleId() {

    const ids =
        sales
            .map(
                sale =>
                    Number(
                        sale.id
                    )
            )
            .filter(
                id =>
                    Number.isFinite(
                        id
                    )
            );


    const maxId =
        ids.length
            ? Math.max(
                ...ids
            )
            : 0;


    return Math.max(
        Date.now(),
        maxId + 1
    );

}


/* =====================================================
   UPDATE CURRENT DATE
===================================================== */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (
        !element
    ) {

        return;

    }


    element.textContent =
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
   STORAGE SYNC
=====================================================

   Jika queen_sales berubah dari tab lain,
   halaman ini otomatis membaca ulang.

===================================================== */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            SALES_STORAGE_KEY
        ) {

            sales =
                loadSales();


            normalizeSales();

            renderSales();

        }


        /*
         * Jika pembelian berubah,
         * tidak perlu mengubah sales.
         *
         * Tetapi harga otomatis pada transaksi
         * baru akan mengambil data terbaru
         * ketika user mengetik produk.
         */

        if (
            event.key ===
            PURCHASE_STORAGE_KEY
        ) {

            /*
             * Tidak melakukan overwrite
             * terhadap data penjualan.
             */

            console.log(
                "Data pembelian diperbarui."
            );

        }

    }
);


/* =====================================================
   REFRESH SAAT TAB KEMBALI AKTIF
===================================================== */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState ===
            "visible"
        ) {

            sales =
                loadSales();


            normalizeSales();

            renderSales();

            updateCurrentDate();

        }

    }
);


/* =====================================================
   NOTIFICATION
===================================================== */

const notificationButton =
    document.querySelector(
        ".notification"
    );


if (
    notificationButton
) {

    notificationButton.addEventListener(
        "click",
        function() {

            const processing =
                sales.filter(
                    sale =>
                        sale.status ===
                        "proses"
                ).length;


            if (
                processing > 0
            ) {

                alert(
                    `Ada ${processing} transaksi penjualan yang masih diproses.`
                );

            } else {

                alert(
                    "Tidak ada transaksi penjualan yang sedang diproses."
                );

            }

        }
    );

}


/* =====================================================
   INITIALIZE
===================================================== */

normalizeSales();

saveSales();

updateCurrentDate();

renderSales();


</script>
