<script>

/* =====================================================
   CONFIG
===================================================== */

const PURCHASE_KEY = "queen_purchases";


/* =====================================================
   DATA PEMBELIAN
===================================================== */

let purchases = loadPurchases();


/* =====================================================
   LOAD DATA
===================================================== */

function loadPurchases() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(PURCHASE_KEY)
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Gagal membaca data pembelian:",
            error
        );

        return [];

    }

}


/* =====================================================
   SIMPAN DATA
===================================================== */

function savePurchases() {

    localStorage.setItem(
        PURCHASE_KEY,
        JSON.stringify(purchases)
    );

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
   FORMAT TANGGAL
===================================================== */

function formatTanggal(date) {

    if (!date) {
        return "-";
    }

    const parsedDate =
        new Date(date + "T00:00:00");


    if (
        isNaN(
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
   TANGGAL HARI INI
===================================================== */

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =====================================================
   RENDER PEMBELIAN
===================================================== */

function renderPurchases() {

    const table =
        document.getElementById(
            "purchaseTable"
        );


    const search =
        document.getElementById(
            "search"
        )
        .value
        .trim()
        .toLowerCase();


    const filter =
        document.getElementById(
            "filterStatus"
        )
        .value;


    const filtered =
        purchases.filter(item => {

            const produk =
                String(
                    item.produk || ""
                )
                .toLowerCase();


            const supplier =
                String(
                    item.supplier || ""
                )
                .toLowerCase();


            const order =
                String(
                    item.order || ""
                )
                .toLowerCase();


            const matchSearch =
                produk.includes(search) ||
                supplier.includes(search) ||
                order.includes(search);


            const matchStatus =
                filter === "all" ||
                item.status === filter;


            return (
                matchSearch &&
                matchStatus
            );

        });


    table.innerHTML = "";


    /* =================================================
       EMPTY
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

    }


    /* =================================================
       TABLE DATA
    ================================================= */

    filtered.forEach(item => {

        const qty =
            Number(item.qty) || 0;


        const hargaBeli =
            Number(item.hargaBeli) || 0;


        const total =
            qty * hargaBeli;


        const produk =
            String(
                item.produk || ""
            );


        const firstLetter =
            produk
                .charAt(0)
                .toUpperCase();


        let statusHTML = "";


        if (
            item.status === "selesai"
        ) {

            statusHTML = `

                <span class="status success-status">
                    Selesai
                </span>

            `;

        }

        else if (
            item.status === "proses"
        ) {

            statusHTML = `

                <span class="status process-status">
                    Diproses
                </span>

            `;

        }

        else if (
            item.status === "batal"
        ) {

            statusHTML = `

                <span class="status cancel-status">
                    Batal
                </span>

            `;

        }


        table.innerHTML += `

            <tr>

                <td>
                    ${formatTanggal(item.tanggal)}
                </td>


                <td>

                    <div class="product">

                        <div class="product-img">
                            ${escapeHtml(firstLetter)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(produk)}
                            </strong>

                            <span>
                                Barang dropship
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(item.supplier)}
                </td>


                <td>
                    ${escapeHtml(item.order)}
                </td>


                <td>
                    ${qty}
                </td>


                <td class="money">
                    ${rupiah(hargaBeli)}
                </td>


                <td class="money">
                    ${rupiah(total)}
                </td>


                <td>
                    ${statusHTML}
                </td>


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


    updateSummary(filtered);

}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(filtered) {

    let totalPembelian = 0;
    let totalQty = 0;
    let totalTransaksi = 0;


    filtered.forEach(item => {

        /*
         * Pembelian batal tidak dihitung.
         */

        if (
            item.status === "batal"
        ) {
            return;
        }


        const qty =
            Number(item.qty) || 0;


        const hargaBeli =
            Number(item.hargaBeli) || 0;


        totalQty += qty;


        totalPembelian +=
            qty * hargaBeli;


        totalTransaksi++;

    });


    document.getElementById(
        "totalPembelian"
    ).textContent =
        rupiah(totalPembelian);


    document.getElementById(
        "totalQty"
    ).textContent =
        totalQty;


    document.getElementById(
        "totalTransaksi"
    ).textContent =
        totalTransaksi;


    document.getElementById(
        "jumlahHasil"
    ).textContent =
        `${filtered.length} transaksi`;

}


/* =====================================================
   OPEN MODAL
===================================================== */

function openModal() {

    const form =
        document.getElementById(
            "purchaseForm"
        );


    form.reset();


    document.getElementById(
        "editId"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Tambah Pembelian";


    document.getElementById(
        "tanggal"
    ).value =
        getToday();


    document.getElementById(
        "qty"
    ).value = 1;


    document.getElementById(
        "status"
    ).value =
        "proses";


    document.getElementById(
        "purchaseModal"
    ).classList.add("show");

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    document.getElementById(
        "purchaseModal"
    ).classList.remove("show");

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
        return;
    }


    document.getElementById(
        "purchaseModal"
    ).classList.add("show");


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Pembelian";


    document.getElementById(
        "editId"
    ).value =
        item.id;


    document.getElementById(
        "tanggal"
    ).value =
        item.tanggal || "";


    document.getElementById(
        "produk"
    ).value =
        item.produk || "";


    document.getElementById(
        "supplier"
    ).value =
        item.supplier || "";


    document.getElementById(
        "order"
    ).value =
        item.order || "";


    document.getElementById(
        "qty"
    ).value =
        item.qty || 1;


    document.getElementById(
        "hargaBeli"
    ).value =
        item.hargaBeli || 0;


    document.getElementById(
        "status"
    ).value =
        item.status || "proses";

}


/* =====================================================
   DELETE PEMBELIAN
===================================================== */

function deletePurchase(id) {

    const item =
        purchases.find(
            purchase =>
                Number(purchase.id) ===
                Number(id)
        );


    if (!item) {
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
   SUBMIT FORM
===================================================== */

document
    .getElementById(
        "purchaseForm"
    )
    .addEventListener(
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


            /* =============================================
               VALIDASI
            ============================================= */

            if (
                !tanggal ||
                !produk ||
                !supplier ||
                !order ||
                !Number.isFinite(qty) ||
                qty <= 0 ||
                !Number.isFinite(hargaBeli) ||
                hargaBeli < 0
            ) {

                alert(
                    "Mohon isi data pembelian dengan benar."
                );

                return;

            }


            /* =============================================
               CEK NOMOR ORDER DUPLIKAT
            ============================================= */

            const duplicate =
                purchases.some(item => {

                    return (
                        String(
                            item.order
                        )
                        .trim()
                        .toLowerCase()
                        ===
                        order
                            .trim()
                            .toLowerCase()
                        &&
                        Number(item.id) !==
                        Number(editId)
                    );

                });


            if (duplicate) {

                alert(
                    "Nomor order tersebut sudah digunakan."
                );

                return;

            }


            /* =============================================
               EDIT DATA
            ============================================= */

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

            }


            /* =============================================
               TAMBAH DATA
            ============================================= */

            else {

                purchases.push({

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

                });

            }


            /* =============================================
               SAVE
            ============================================= */

            savePurchases();

            renderPurchases();

            closeModal();

        }
    );


/* =====================================================
   SEARCH
===================================================== */

document
    .getElementById(
        "search"
    )
    .addEventListener(
        "input",
        renderPurchases
    );


/* =====================================================
   FILTER STATUS
===================================================== */

document
    .getElementById(
        "filterStatus"
    )
    .addEventListener(
        "change",
        renderPurchases
    );


/* =====================================================
   MOBILE MENU
===================================================== */

document
    .getElementById(
        "mobileMenu"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "sidebar"
                )
                .classList.toggle(
                    "open"
                );

        }
    );


/* =====================================================
   CLOSE MODAL KLIK LUAR
===================================================== */

document
    .getElementById(
        "purchaseModal"
    )
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeModal();

            }

        }
    );


/* =====================================================
   ESCAPE CLOSE MODAL
===================================================== */

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


/* =====================================================
   NOTIFICATION
===================================================== */

document
    .querySelector(".notification")
    .addEventListener(
        "click",
        function() {

            alert(
                "Belum ada notifikasi baru."
            );

        }
    );


/* =====================================================
   TANGGAL HEADER
===================================================== */

function updateCurrentDate() {

    document.getElementById(
        "currentDate"
    ).textContent =

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
   SINKRONISASI LOCAL STORAGE
===================================================== */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === PURCHASE_KEY
        ) {

            purchases =
                loadPurchases();

            renderPurchases();

        }

    }
);


/* =====================================================
   START
===================================================== */

updateCurrentDate();

renderPurchases();

</script>
