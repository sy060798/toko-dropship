/* =========================================================
   QUEEN DROPSHIP - SUPPLIER JS
   Sinkron dengan supplier.html
========================================================= */


/* =========================================================
   STORAGE KEY
========================================================= */

const SUPPLIER_STORAGE_KEY = "queen_suppliers";


/* =========================================================
   DATA SUPPLIER
========================================================= */

let suppliers = loadSuppliers();


/* =========================================================
   LOAD DATA
========================================================= */

function loadSuppliers() {

    try {

        const saved =
            localStorage.getItem(
                SUPPLIER_STORAGE_KEY
            );

        if (saved) {

            const data = JSON.parse(saved);

            if (Array.isArray(data)) {

                return data;

            }

        }

    } catch (error) {

        console.error(
            "Gagal membaca data supplier:",
            error
        );

    }


    /*
     * DATA AWAL
     * Hanya digunakan jika belum ada
     * data supplier di localStorage.
     */

    return [

        {
            id: 1,
            nama: "Budi",
            toko: "Supplier Fashion Jakarta",
            whatsapp: "08123456789",
            alamat: "Jakarta",
            status: "active",
            catatan: "Supplier utama fashion"
        },

        {
            id: 2,
            nama: "Andi",
            toko: "Tumbler Store",
            whatsapp: "08234567890",
            alamat: "Bandung",
            status: "active",
            catatan: "Supplier tumbler"
        },

        {
            id: 3,
            nama: "Rina",
            toko: "Grosir Online",
            whatsapp: "08345678901",
            alamat: "Surabaya",
            status: "inactive",
            catatan: "Jarang digunakan"
        }

    ];

}


/* =========================================================
   SIMPAN DATA
========================================================= */

function saveSuppliers() {

    try {

        localStorage.setItem(
            SUPPLIER_STORAGE_KEY,
            JSON.stringify(suppliers)
        );

        return true;

    } catch (error) {

        console.error(
            "Gagal menyimpan supplier:",
            error
        );

        alert(
            "Data supplier gagal disimpan."
        );

        return false;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   NORMALISASI TEXT
========================================================= */

function normalizeText(value) {

    return String(value ?? "")
        .toLowerCase()
        .trim();

}


/* =========================================================
   RENDER SUPPLIER
========================================================= */

function renderSuppliers() {

    const table =
        document.getElementById(
            "supplierTable"
        );

    const searchInput =
        document.getElementById(
            "search"
        );


    if (!table || !searchInput) {

        console.error(
            "Element supplierTable atau search tidak ditemukan."
        );

        return;

    }


    const search =
        normalizeText(
            searchInput.value
        );


    /*
     * FILTER PENCARIAN
     *
     * Mencari berdasarkan:
     * - nama
     * - toko
     * - whatsapp
     * - alamat
     */

    const filtered =
        suppliers.filter(
            supplier => {

                const nama =
                    normalizeText(
                        supplier.nama
                    );

                const toko =
                    normalizeText(
                        supplier.toko
                    );

                const whatsapp =
                    normalizeText(
                        supplier.whatsapp
                    );

                const alamat =
                    normalizeText(
                        supplier.alamat
                    );


                return (

                    nama.includes(search)

                    ||

                    toko.includes(search)

                    ||

                    whatsapp.includes(search)

                    ||

                    alamat.includes(search)

                );

            }
        );


    table.innerHTML = "";


    /*
     * JIKA TIDAK ADA DATA
     */

    if (filtered.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty">

                    ${
                        suppliers.length === 0
                            ? "Belum ada supplier."
                            : "Supplier tidak ditemukan."
                    }

                </td>

            </tr>

        `;

    }


    /*
     * RENDER SETIAP SUPPLIER
     */

    filtered.forEach(
        supplier => {

            const nama =
                supplier.nama || "Tanpa Nama";


            const firstLetter =
                nama
                    .charAt(0)
                    .toUpperCase();


            const toko =
                supplier.toko || "-";


            const whatsapp =
                supplier.whatsapp || "-";


            const alamat =
                supplier.alamat || "-";


            const status =
                supplier.status === "active"
                    ? "active"
                    : "inactive";


            const statusHtml =
                status === "active"

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


            table.innerHTML += `

                <tr>

                    <!-- SUPPLIER -->

                    <td>

                        <div class="supplier">

                            <div class="supplier-icon">

                                ${escapeHtml(firstLetter)}

                            </div>

                            <div>

                                <strong>
                                    ${escapeHtml(nama)}
                                </strong>

                                <span>
                                    Supplier
                                </span>

                            </div>

                        </div>

                    </td>


                    <!-- TOKO -->

                    <td>

                        ${escapeHtml(toko)}

                    </td>


                    <!-- WHATSAPP -->

                    <td>

                        <span class="phone">

                            ${escapeHtml(whatsapp)}

                        </span>

                    </td>


                    <!-- ALAMAT -->

                    <td>

                        ${escapeHtml(alamat)}

                    </td>


                    <!-- STATUS -->

                    <td>

                        ${statusHtml}

                    </td>


                    <!-- AKSI -->

                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="btn-edit"
                                onclick="editSupplier(${Number(supplier.id)})">

                                Edit

                            </button>


                            <button
                                type="button"
                                class="btn-delete"
                                onclick="deleteSupplier(${Number(supplier.id)})">

                                Hapus

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    updateSummary(
        filtered.length
    );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(
    filteredCount = suppliers.length
) {

    const totalSupplier =
        document.getElementById(
            "totalSupplier"
        );


    const supplierAktif =
        document.getElementById(
            "supplierAktif"
        );


    const supplierNonaktif =
        document.getElementById(
            "supplierNonaktif"
        );


    const jumlahHasil =
        document.getElementById(
            "jumlahHasil"
        );


    const total =
        suppliers.length;


    const aktif =
        suppliers.filter(
            supplier =>
                supplier.status === "active"
        ).length;


    const nonaktif =
        suppliers.filter(
            supplier =>
                supplier.status === "inactive"
        ).length;


    /*
     * TOTAL SUPPLIER
     */

    if (totalSupplier) {

        totalSupplier.textContent =
            total;

    }


    /*
     * SUPPLIER AKTIF
     */

    if (supplierAktif) {

        supplierAktif.textContent =
            aktif;

    }


    /*
     * SUPPLIER NONAKTIF
     */

    if (supplierNonaktif) {

        supplierNonaktif.textContent =
            nonaktif;

    }


    /*
     * JUMLAH HASIL PENCARIAN
     *
     * Menggunakan jumlah filtered,
     * bukan total data.
     */

    if (jumlahHasil) {

        jumlahHasil.textContent =
            `${filteredCount} supplier`;

    }

}


/* =========================================================
   OPEN MODAL - TAMBAH
========================================================= */

function openModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    const form =
        document.getElementById(
            "supplierForm"
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


    /*
     * RESET FORM
     */

    form.reset();


    /*
     * KOSONGKAN ID EDIT
     */

    if (editId) {

        editId.value = "";

    }


    /*
     * DEFAULT STATUS AKTIF
     */

    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        status.value = "active";

    }


    /*
     * JUDUL MODAL
     */

    if (title) {

        title.textContent =
            "Tambah Supplier";

    }


    /*
     * TAMPILKAN MODAL
     */

    modal.classList.add(
        "show"
    );


    /*
     * FOCUS NAMA
     */

    setTimeout(
        function() {

            const nama =
                document.getElementById(
                    "nama"
                );

            if (nama) {

                nama.focus();

            }

        },
        100
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );

}


/* =========================================================
   EDIT SUPPLIER
========================================================= */

function editSupplier(id) {

    const supplier =
        suppliers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!supplier) {

        alert(
            "Data supplier tidak ditemukan."
        );

        return;

    }


    const modal =
        document.getElementById(
            "supplierModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const editId =
        document.getElementById(
            "editId"
        );


    const nama =
        document.getElementById(
            "nama"
        );


    const toko =
        document.getElementById(
            "toko"
        );


    const whatsapp =
        document.getElementById(
            "whatsapp"
        );


    const alamat =
        document.getElementById(
            "alamat"
        );


    const status =
        document.getElementById(
            "status"
        );


    const catatan =
        document.getElementById(
            "catatan"
        );


    if (!modal) {

        return;

    }


    /*
     * ISI FORM
     */

    if (editId) {

        editId.value =
            supplier.id;

    }


    if (nama) {

        nama.value =
            supplier.nama || "";

    }


    if (toko) {

        toko.value =
            supplier.toko || "";

    }


    if (whatsapp) {

        whatsapp.value =
            supplier.whatsapp || "";

    }


    if (alamat) {

        alamat.value =
            supplier.alamat || "";

    }


    if (status) {

        status.value =
            supplier.status === "inactive"
                ? "inactive"
                : "active";

    }


    if (catatan) {

        catatan.value =
            supplier.catatan || "";

    }


    /*
     * JUDUL
     */

    if (title) {

        title.textContent =
            "Edit Supplier";

    }


    /*
     * TAMPILKAN MODAL
     */

    modal.classList.add(
        "show"
    );


    /*
     * FOCUS
     */

    setTimeout(
        function() {

            if (nama) {

                nama.focus();

            }

        },
        100
    );

}


/* =========================================================
   DELETE SUPPLIER
========================================================= */

function deleteSupplier(id) {

    const supplier =
        suppliers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!supplier) {

        alert(
            "Data supplier tidak ditemukan."
        );

        return;

    }


    const namaSupplier =
        supplier.toko ||
        supplier.nama ||
        "supplier";


    const yakin =
        confirm(
            `Hapus supplier "${namaSupplier}"?\n\nData yang dihapus tidak dapat dikembalikan.`
        );


    if (!yakin) {

        return;

    }


    /*
     * HAPUS DATA
     */

    suppliers =
        suppliers.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );


    /*
     * SIMPAN
     */

    saveSuppliers();


    /*
     * RENDER ULANG
     */

    renderSuppliers();

}


/* =========================================================
   SUBMIT FORM SUPPLIER
========================================================= */

function handleSupplierSubmit(
    event
) {

    event.preventDefault();


    /*
     * AMBIL ELEMENT
     */

    const editId =
        document.getElementById(
            "editId"
        );


    const namaInput =
        document.getElementById(
            "nama"
        );


    const tokoInput =
        document.getElementById(
            "toko"
        );


    const whatsappInput =
        document.getElementById(
            "whatsapp"
        );


    const alamatInput =
        document.getElementById(
            "alamat"
        );


    const statusInput =
        document.getElementById(
            "status"
        );


    const catatanInput =
        document.getElementById(
            "catatan"
        );


    /*
     * AMBIL VALUE
     */

    const id =
        editId
            ? editId.value.trim()
            : "";


    const nama =
        namaInput
            ? namaInput.value.trim()
            : "";


    const toko =
        tokoInput
            ? tokoInput.value.trim()
            : "";


    const whatsapp =
        whatsappInput
            ? whatsappInput.value.trim()
            : "";


    const alamat =
        alamatInput
            ? alamatInput.value.trim()
            : "";


    const status =
        statusInput &&
        statusInput.value === "inactive"

            ? "inactive"

            : "active";


    const catatan =
        catatanInput
            ? catatanInput.value.trim()
            : "";


    /*
     * VALIDASI
     */

    if (!nama) {

        alert(
            "Nama supplier wajib diisi."
        );

        if (namaInput) {

            namaInput.focus();

        }

        return;

    }


    if (!toko) {

        alert(
            "Nama toko / perusahaan wajib diisi."
        );

        if (tokoInput) {

            tokoInput.focus();

        }

        return;

    }


    if (!whatsapp) {

        alert(
            "Nomor WhatsApp wajib diisi."
        );

        if (whatsappInput) {

            whatsappInput.focus();

        }

        return;

    }


    /*
     * VALIDASI NOMOR TELEPON
     *
     * Memperbolehkan:
     * 08123456789
     * +628123456789
     * 628123456789
     */

    const cleanWhatsapp =
        whatsapp.replace(
            /[\s\-().]/g,
            ""
        );


    const phoneValid =
        /^(?:\+62|62|0)[0-9]{8,15}$/
            .test(cleanWhatsapp);


    if (!phoneValid) {

        alert(
            "Format nomor WhatsApp tidak valid.\nContoh: 08123456789"
        );

        if (whatsappInput) {

            whatsappInput.focus();

        }

        return;

    }


    /*
     * CEK DUPLIKAT WHATSAPP
     *
     * Tidak boleh sama dengan supplier lain.
     */

    const duplicateWhatsapp =
        suppliers.find(
            supplier => {

                const samePhone =
                    String(
                        supplier.whatsapp || ""
                    )
                    .replace(
                        /[\s\-().]/g,
                        ""
                    ) ===
                    cleanWhatsapp;


                const sameId =
                    id &&
                    Number(supplier.id) ===
                    Number(id);


                return (
                    samePhone &&
                    !sameId
                );

            }
        );


    if (duplicateWhatsapp) {

        alert(
            "Nomor WhatsApp tersebut sudah digunakan supplier lain."
        );

        if (whatsappInput) {

            whatsappInput.focus();

        }

        return;

    }


    /*
     * MODE EDIT
     */

    if (id) {

        const supplier =
            suppliers.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!supplier) {

            alert(
                "Data supplier yang ingin diedit tidak ditemukan."
            );

            return;

        }


        supplier.nama =
            nama;

        supplier.toko =
            toko;

        supplier.whatsapp =
            whatsapp;

        supplier.alamat =
            alamat;

        supplier.status =
            status;

        supplier.catatan =
            catatan;

    }

    /*
     * MODE TAMBAH
     */

    else {

        const newSupplier = {

            id:
                generateSupplierId(),

            nama:
                nama,

            toko:
                toko,

            whatsapp:
                whatsapp,

            alamat:
                alamat,

            status:
                status,

            catatan:
                catatan

        };


        suppliers.push(
            newSupplier
        );

    }


    /*
     * SIMPAN
     */

    const saved =
        saveSuppliers();


    if (!saved) {

        return;

    }


    /*
     * RENDER
     */

    renderSuppliers();


    /*
     * TUTUP MODAL
     */

    closeModal();


    /*
     * NOTIFIKASI
     */

    console.log(
        id
            ? "Supplier berhasil diperbarui."
            : "Supplier berhasil ditambahkan."
    );

}


/* =========================================================
   GENERATE ID
========================================================= */

function generateSupplierId() {

    /*
     * Date.now + random
     * agar kemungkinan bentrok sangat kecil.
     */

    let id =
        Date.now();


    const exists =
        suppliers.some(
            supplier =>
                Number(supplier.id) ===
                Number(id)
        );


    if (exists) {

        id +=
            Math.floor(
                Math.random() * 1000
            );

    }


    return id;

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        document.getElementById(
            "search"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function() {

            renderSuppliers();

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!mobileMenu || !sidebar) {

        return;

    }


    mobileMenu.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            sidebar.classList.toggle(
                "open"
            );

        }
    );


    /*
     * Klik menu otomatis menutup sidebar
     * di mobile.
     */

    const menuLinks =
        sidebar.querySelectorAll(
            ".menu a"
        );


    menuLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                function() {

                    if (
                        window.innerWidth <= 900
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );


    /*
     * Klik di luar sidebar
     */

    document.addEventListener(
        "click",
        function(event) {

            if (
                window.innerWidth > 900
            ) {

                return;

            }


            if (
                !sidebar.contains(
                    event.target
                )

                &&

                !mobileMenu.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (!modal) {

        return;

    }


    /*
     * Klik area gelap = tutup modal
     */

    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                const modal =
                    document.getElementById(
                        "supplierModal"
                    );


                if (
                    modal &&
                    modal.classList.contains(
                        "show"
                    )
                ) {

                    closeModal();

                }


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

}


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

    const currentDate =
        document.getElementById(
            "currentDate"
        );


    if (!currentDate) {

        return;

    }


    const now =
        new Date();


    currentDate.textContent =
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
   FORM EVENT
========================================================= */

function setupForm() {

    const form =
        document.getElementById(
            "supplierForm"
        );


    if (!form) {

        console.error(
            "supplierForm tidak ditemukan."
        );

        return;

    }


    form.addEventListener(
        "submit",
        handleSupplierSubmit
    );

}


/* =========================================================
   WHATSAPP INPUT
========================================================= */

function setupWhatsappInput() {

    const input =
        document.getElementById(
            "whatsapp"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function() {

            /*
             * Hanya memperbolehkan:
             * angka
             * +
             * spasi
             * -
             * ()
             */

            this.value =
                this.value.replace(
                    /[^0-9+\-\s()]/g,
                    ""
                );

        }
    );

}


/* =========================================================
   AUTO CLOSE MODAL SETELAH SAVE
   + RESET FORM
========================================================= */

function resetSupplierForm() {

    const form =
        document.getElementById(
            "supplierForm"
        );


    const editId =
        document.getElementById(
            "editId"
        );


    if (form) {

        form.reset();

    }


    if (editId) {

        editId.value = "";

    }


    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        status.value = "active";

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

function initSupplierPage() {

    /*
     * Pastikan data valid
     */

    if (!Array.isArray(suppliers)) {

        suppliers = [];

    }


    /*
     * Simpan data awal jika
     * belum ada localStorage.
     */

    if (
        !localStorage.getItem(
            SUPPLIER_STORAGE_KEY
        )
    ) {

        saveSuppliers();

    }


    /*
     * Setup semua fitur
     */

    setupForm();

    setupSearch();

    setupMobileMenu();

    setupModal();

    setupEscapeKey();

    setupWhatsappInput();


    /*
     * Tanggal
     */

    setCurrentDate();


    /*
     * Render pertama
     */

    renderSuppliers();

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initSupplierPage
    );

} else {

    initSupplierPage();

}
