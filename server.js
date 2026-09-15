"use strict";

/*
===========================================================
 QUEEN DROPSHIP API
===========================================================

DATABASE:
CockroachDB / PostgreSQL

ENVIRONMENT:
DATABASE_URL
PORT

ENDPOINTS:

GET    /api/ping
GET    /api/test

GET    /api/produk
POST   /api/produk
PUT    /api/produk/:id
DELETE /api/produk/:id

GET    /api/supplier
POST   /api/supplier
PUT    /api/supplier/:id
DELETE /api/supplier/:id

GET    /api/penjualan
POST   /api/penjualan
PUT    /api/penjualan/:id
DELETE /api/penjualan/:id

GET    /api/pembelian
POST   /api/pembelian
PUT    /api/pembelian/:id
DELETE /api/pembelian/:id

GET    /api/dashboard
GET    /api/laporan

===========================================================
*/

const http = require("http");
const { Pool } = require("pg");
const { URL } = require("url");


// =========================================================
// CONFIG
// =========================================================

const PORT = Number(process.env.PORT) || 3000;

const DATABASE_URL = process.env.DATABASE_URL;


// =========================================================
// VALIDASI DATABASE
// =========================================================

if (!DATABASE_URL) {

    console.error(
        "ERROR: DATABASE_URL belum diset."
    );

    process.exit(1);
}


// =========================================================
// DATABASE
// =========================================================

const pool = new Pool({

    connectionString: DATABASE_URL,

    ssl: {
        rejectUnauthorized: true
    },

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000

});


// =========================================================
// HELPERS
// =========================================================

function sendJSON(res, status, data) {

    res.writeHead(status, {

        "Content-Type":
            "application/json; charset=utf-8",

        "Cache-Control":
            "no-store",

        "Access-Control-Allow-Origin":
            "*",

        "Access-Control-Allow-Methods":
            "GET,POST,PUT,DELETE,OPTIONS",

        "Access-Control-Allow-Headers":
            "Content-Type"

    });

    res.end(
        JSON.stringify(data)
    );
}


function clean(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";
    }

    return String(value).trim();
}


function number(value) {

    const n = Number(value);

    if (!Number.isFinite(n)) {

        return 0;
    }

    return n;
}


function getRequestBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            req.on(
                "data",
                chunk => {

                    body += chunk;

                    if (
                        body.length >
                        1024 * 1024
                    ) {

                        reject(
                            new Error(
                                "Request terlalu besar."
                            )
                        );

                        req.destroy();
                    }
                }
            );


            req.on(
                "end",
                () => {

                    if (!body.trim()) {

                        resolve({});

                        return;
                    }

                    try {

                        const data =
                            JSON.parse(body);

                        resolve(data);

                    } catch (error) {

                        reject(
                            new Error(
                                "JSON request tidak valid."
                            )
                        );
                    }
                }
            );


            req.on(
                "error",
                error => {

                    reject(error);
                }
            );
        }
    );
}


// =========================================================
// SERVER
// =========================================================

const server =
    http.createServer(
        async (req, res) => {

            // =================================================
            // CORS
            // =================================================

            res.setHeader(
                "Access-Control-Allow-Origin",
                "*"
            );

            res.setHeader(
                "Access-Control-Allow-Methods",
                "GET,POST,PUT,DELETE,OPTIONS"
            );

            res.setHeader(
                "Access-Control-Allow-Headers",
                "Content-Type"
            );

            res.setHeader(
                "Access-Control-Max-Age",
                "86400"
            );


            // =================================================
            // PREFLIGHT
            // =================================================

            if (
                req.method === "OPTIONS"
            ) {

                res.writeHead(204);

                return res.end();
            }


            try {

                const parsedURL =
                    new URL(
                        req.url,
                        `http://${req.headers.host || "localhost"}`
                    );

                const pathname =
                    parsedURL.pathname;


                // =================================================
                // PING
                // =================================================

                if (
                    req.method === "GET" &&
                    pathname === "/api/ping"
                ) {

                    return sendJSON(
                        res,
                        200,
                        {
                            success: true,

                            message:
                                "Queen Dropship API aktif",

                            time:
                                new Date().toISOString()
                        }
                    );
                }


                // =================================================
                // DATABASE TEST
                // =================================================

                if (
                    req.method === "GET" &&
                    pathname === "/api/test"
                ) {

                    const result =
                        await pool.query(
                            "SELECT NOW() AS waktu"
                        );

                    return sendJSON(
                        res,
                        200,
                        {
                            success: true,

                            message:
                                "Database terhubung",

                            waktu:
                                result.rows[0].waktu
                        }
                    );
                }


                // =================================================
                // PRODUK
                // =================================================

                if (
                    pathname === "/api/produk"
                ) {

                    if (
                        req.method === "GET"
                    ) {

                        return await getProduk(
                            res
                        );
                    }


                    if (
                        req.method === "POST"
                    ) {

                        return await createProduk(
                            req,
                            res
                        );
                    }
                }


                const produkMatch =
                    pathname.match(
                        /^\/api\/produk\/(\d+)$/
                    );


                if (produkMatch) {

                    const id =
                        Number(
                            produkMatch[1]
                        );


                    if (
                        req.method === "PUT"
                    ) {

                        return await updateProduk(
                            req,
                            res,
                            id
                        );
                    }


                    if (
                        req.method === "DELETE"
                    ) {

                        return await deleteProduk(
                            res,
                            id
                        );
                    }
                }


                // =================================================
                // SUPPLIER
                // =================================================

                if (
                    pathname === "/api/supplier"
                ) {

                    if (
                        req.method === "GET"
                    ) {

                        return await getSupplier(
                            res
                        );
                    }


                    if (
                        req.method === "POST"
                    ) {

                        return await createSupplier(
                            req,
                            res
                        );
                    }
                }


                const supplierMatch =
                    pathname.match(
                        /^\/api\/supplier\/(\d+)$/
                    );


                if (supplierMatch) {

                    const id =
                        Number(
                            supplierMatch[1]
                        );


                    if (
                        req.method === "PUT"
                    ) {

                        return await updateSupplier(
                            req,
                            res,
                            id
                        );
                    }


                    if (
                        req.method === "DELETE"
                    ) {

                        return await deleteSupplier(
                            res,
                            id
                        );
                    }
                }


                // =================================================
                // PENJUALAN
                // =================================================

                if (
                    pathname === "/api/penjualan"
                ) {

                    if (
                        req.method === "GET"
                    ) {

                        return await getPenjualan(
                            res
                        );
                    }


                    if (
                        req.method === "POST"
                    ) {

                        return await createPenjualan(
                            req,
                            res
                        );
                    }
                }


                const penjualanMatch =
                    pathname.match(
                        /^\/api\/penjualan\/(\d+)$/
                    );


                if (penjualanMatch) {

                    const id =
                        Number(
                            penjualanMatch[1]
                        );


                    if (
                        req.method === "PUT"
                    ) {

                        return await updatePenjualan(
                            req,
                            res,
                            id
                        );
                    }


                    if (
                        req.method === "DELETE"
                    ) {

                        return await deletePenjualan(
                            res,
                            id
                        );
                    }
                }


                // =================================================
                // PEMBELIAN
                // =================================================

                if (
                    pathname === "/api/pembelian"
                ) {

                    if (
                        req.method === "GET"
                    ) {

                        return await getPembelian(
                            res
                        );
                    }


                    if (
                        req.method === "POST"
                    ) {

                        return await createPembelian(
                            req,
                            res
                        );
                    }
                }


                const pembelianMatch =
                    pathname.match(
                        /^\/api\/pembelian\/(\d+)$/
                    );


                if (pembelianMatch) {

                    const id =
                        Number(
                            pembelianMatch[1]
                        );


                    if (
                        req.method === "PUT"
                    ) {

                        return await updatePembelian(
                            req,
                            res,
                            id
                        );
                    }


                    if (
                        req.method === "DELETE"
                    ) {

                        return await deletePembelian(
                            res,
                            id
                        );
                    }
                }


                // =================================================
                // DASHBOARD
                // =================================================

                if (
                    req.method === "GET" &&
                    pathname === "/api/dashboard"
                ) {

                    return await getDashboard(
                        res
                    );
                }


                // =================================================
                // LAPORAN
                // =================================================

                if (
                    req.method === "GET" &&
                    pathname === "/api/laporan"
                ) {

                    return await getLaporan(
                        parsedURL,
                        res
                    );
                }


                // =================================================
                // 404
                // =================================================

                return sendJSON(
                    res,
                    404,
                    {
                        success: false,

                        message:
                            "Endpoint tidak ditemukan.",

                        endpoint:
                            pathname
                    }
                );

            }

            catch (error) {

                console.error(
                    "SERVER ERROR:",
                    error
                );


                return sendJSON(
                    res,
                    500,
                    {
                        success: false,

                        message:
                            error.message ||
                            "Terjadi kesalahan server.",

                        code:
                            error.code ||
                            null
                    }
                );
            }
        }
    );


// =========================================================
// PRODUK
// =========================================================

async function getProduk(res) {

    const result =
        await pool.query(`
            SELECT
                id,
                nama,
                sku,
                status,
                harga_supplier,
                harga_jual,
                biaya_shopee,
                deskripsi
            FROM produk
            ORDER BY id DESC
        `);

    return sendJSON(
        res,
        200,
        result.rows
    );
}


async function createProduk(req, res) {

    const body =
        await getRequestBody(req);


    const nama =
        clean(body.nama);

    const sku =
        clean(body.sku);

    const status =
        body.status === "inactive"
            ? "inactive"
            : "active";

    const hargaSupplier =
        number(
            body.hargaSupplier ??
            body.harga_supplier
        );

    const hargaJual =
        number(
            body.hargaJual ??
            body.harga_jual
        );

    const biayaShopee =
        number(
            body.biayaShopee ??
            body.biaya_shopee
        );

    const deskripsi =
        clean(body.deskripsi);


    if (!nama) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Nama produk wajib diisi."
            }
        );
    }


    if (!sku) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "SKU wajib diisi."
            }
        );
    }


    const cek =
        await pool.query(
            `
            SELECT id
            FROM produk
            WHERE sku = $1
            LIMIT 1
            `,
            [sku]
        );


    if (cek.rows.length) {

        return sendJSON(
            res,
            409,
            {
                success: false,
                message:
                    "SKU sudah digunakan."
            }
        );
    }


    const result =
        await pool.query(
            `
            INSERT INTO produk
            (
                nama,
                sku,
                status,
                harga_supplier,
                harga_jual,
                biaya_shopee,
                deskripsi
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `,
            [
                nama,
                sku,
                status,
                hargaSupplier,
                hargaJual,
                biayaShopee,
                deskripsi || null
            ]
        );


    return sendJSON(
        res,
        201,
        {
            success: true,

            message:
                "Produk berhasil ditambahkan.",

            data:
                result.rows[0]
        }
    );
}


async function updateProduk(
    req,
    res,
    id
) {

    const body =
        await getRequestBody(req);


    const nama =
        clean(body.nama);

    const sku =
        clean(body.sku);

    const status =
        body.status === "inactive"
            ? "inactive"
            : "active";

    const hargaSupplier =
        number(
            body.hargaSupplier ??
            body.harga_supplier
        );

    const hargaJual =
        number(
            body.hargaJual ??
            body.harga_jual
        );

    const biayaShopee =
        number(
            body.biayaShopee ??
            body.biaya_shopee
        );

    const deskripsi =
        clean(body.deskripsi);


    if (!nama || !sku) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Nama dan SKU wajib diisi."
            }
        );
    }


    const cek =
        await pool.query(
            `
            SELECT id
            FROM produk
            WHERE sku = $1
            AND id <> $2
            LIMIT 1
            `,
            [sku, id]
        );


    if (cek.rows.length) {

        return sendJSON(
            res,
            409,
            {
                success: false,
                message:
                    "SKU sudah digunakan produk lain."
            }
        );
    }


    const result =
        await pool.query(
            `
            UPDATE produk
            SET
                nama = $1,
                sku = $2,
                status = $3,
                harga_supplier = $4,
                harga_jual = $5,
                biaya_shopee = $6,
                deskripsi = $7
            WHERE id = $8
            RETURNING *
            `,
            [
                nama,
                sku,
                status,
                hargaSupplier,
                hargaJual,
                biayaShopee,
                deskripsi || null,
                id
            ]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Produk tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Produk berhasil diupdate.",

            data:
                result.rows[0]
        }
    );
}


async function deleteProduk(
    res,
    id
) {

    const result =
        await pool.query(
            `
            DELETE FROM produk
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Produk tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Produk berhasil dihapus.",

            data:
                result.rows[0]
        }
    );
}


// =========================================================
// SUPPLIER
// =========================================================

async function getSupplier(res) {

    const result =
        await pool.query(`
            SELECT *
            FROM supplier
            ORDER BY id DESC
        `);

    return sendJSON(
        res,
        200,
        result.rows
    );
}


async function createSupplier(req, res) {

    const body =
        await getRequestBody(req);


    const nama =
        clean(
            body.nama ||
            body.nama_supplier
        );

    const kontak =
        clean(
            body.kontak ||
            body.telepon ||
            body.no_hp
        );

    const alamat =
        clean(body.alamat);

    const email =
        clean(body.email);

    const status =
        clean(body.status) ||
        "active";


    if (!nama) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Nama supplier wajib diisi."
            }
        );
    }


    const result =
        await pool.query(
            `
            INSERT INTO supplier
            (
                nama,
                kontak,
                alamat,
                email,
                status
            )
            VALUES
            ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [
                nama,
                kontak || null,
                alamat || null,
                email || null,
                status
            ]
        );


    return sendJSON(
        res,
        201,
        {
            success: true,

            message:
                "Supplier berhasil ditambahkan.",

            data:
                result.rows[0]
        }
    );
}


async function updateSupplier(
    req,
    res,
    id
) {

    const body =
        await getRequestBody(req);


    const nama =
        clean(
            body.nama ||
            body.nama_supplier
        );

    const kontak =
        clean(
            body.kontak ||
            body.telepon ||
            body.no_hp
        );

    const alamat =
        clean(body.alamat);

    const email =
        clean(body.email);

    const status =
        clean(body.status) ||
        "active";


    const result =
        await pool.query(
            `
            UPDATE supplier
            SET
                nama = $1,
                kontak = $2,
                alamat = $3,
                email = $4,
                status = $5
            WHERE id = $6
            RETURNING *
            `,
            [
                nama,
                kontak || null,
                alamat || null,
                email || null,
                status,
                id
            ]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Supplier tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Supplier berhasil diupdate.",

            data:
                result.rows[0]
        }
    );
}


async function deleteSupplier(
    res,
    id
) {

    const result =
        await pool.query(
            `
            DELETE FROM supplier
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Supplier tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Supplier berhasil dihapus.",

            data:
                result.rows[0]
        }
    );
}


// =========================================================
// PENJUALAN
// =========================================================

async function getPenjualan(res) {

    const result =
        await pool.query(`
            SELECT *
            FROM penjualan
            ORDER BY id DESC
        `);

    return sendJSON(
        res,
        200,
        result.rows
    );
}


async function createPenjualan(
    req,
    res
) {

    const body =
        await getRequestBody(req);


    const produkId =
        number(
            body.produk_id ??
            body.produkId
        );

    const jumlah =
        number(body.jumlah);

    const hargaJual =
        number(
            body.harga_jual ??
            body.hargaJual
        );

    const total =
        body.total !== undefined
            ? number(body.total)
            : jumlah * hargaJual;

    const tanggal =
        body.tanggal ||
        body.tanggal_penjualan ||
        new Date().toISOString();


    if (!produkId) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Produk wajib dipilih."
            }
        );
    }


    if (jumlah <= 0) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Jumlah penjualan tidak valid."
            }
        );
    }


    const result =
        await pool.query(
            `
            INSERT INTO penjualan
            (
                produk_id,
                jumlah,
                harga_jual,
                total,
                tanggal
            )
            VALUES
            ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [
                produkId,
                jumlah,
                hargaJual,
                total,
                tanggal
            ]
        );


    return sendJSON(
        res,
        201,
        {
            success: true,

            message:
                "Penjualan berhasil disimpan.",

            data:
                result.rows[0]
        }
    );
}


async function updatePenjualan(
    req,
    res,
    id
) {

    const body =
        await getRequestBody(req);


    const produkId =
        number(
            body.produk_id ??
            body.produkId
        );

    const jumlah =
        number(body.jumlah);

    const hargaJual =
        number(
            body.harga_jual ??
            body.hargaJual
        );

    const total =
        body.total !== undefined
            ? number(body.total)
            : jumlah * hargaJual;

    const tanggal =
        body.tanggal ||
        body.tanggal_penjualan ||
        new Date().toISOString();


    const result =
        await pool.query(
            `
            UPDATE penjualan
            SET
                produk_id = $1,
                jumlah = $2,
                harga_jual = $3,
                total = $4,
                tanggal = $5
            WHERE id = $6
            RETURNING *
            `,
            [
                produkId,
                jumlah,
                hargaJual,
                total,
                tanggal,
                id
            ]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Penjualan tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Penjualan berhasil diupdate.",

            data:
                result.rows[0]
        }
    );
}


async function deletePenjualan(
    res,
    id
) {

    const result =
        await pool.query(
            `
            DELETE FROM penjualan
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Penjualan tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Penjualan berhasil dihapus.",

            data:
                result.rows[0]
        }
    );
}


// =========================================================
// PEMBELIAN
// =========================================================

async function getPembelian(res) {

    const result =
        await pool.query(`
            SELECT *
            FROM pembelian
            ORDER BY id DESC
        `);

    return sendJSON(
        res,
        200,
        result.rows
    );
}


async function createPembelian(
    req,
    res
) {

    const body =
        await getRequestBody(req);


    const produkId =
        number(
            body.produk_id ??
            body.produkId
        );

    const supplierId =
        number(
            body.supplier_id ??
            body.supplierId
        );

    const jumlah =
        number(body.jumlah);

    const hargaBeli =
        number(
            body.harga_beli ??
            body.hargaBeli
        );

    const total =
        body.total !== undefined
            ? number(body.total)
            : jumlah * hargaBeli;

    const tanggal =
        body.tanggal ||
        body.tanggal_pembelian ||
        new Date().toISOString();


    if (!produkId) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Produk wajib dipilih."
            }
        );
    }


    if (jumlah <= 0) {

        return sendJSON(
            res,
            400,
            {
                success: false,
                message:
                    "Jumlah pembelian tidak valid."
            }
        );
    }


    const result =
        await pool.query(
            `
            INSERT INTO pembelian
            (
                produk_id,
                supplier_id,
                jumlah,
                harga_beli,
                total,
                tanggal
            )
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING *
            `,
            [
                produkId,
                supplierId || null,
                jumlah,
                hargaBeli,
                total,
                tanggal
            ]
        );


    return sendJSON(
        res,
        201,
        {
            success: true,

            message:
                "Pembelian berhasil disimpan.",

            data:
                result.rows[0]
        }
    );
}


async function updatePembelian(
    req,
    res,
    id
) {

    const body =
        await getRequestBody(req);


    const produkId =
        number(
            body.produk_id ??
            body.produkId
        );

    const supplierId =
        number(
            body.supplier_id ??
            body.supplierId
        );

    const jumlah =
        number(body.jumlah);

    const hargaBeli =
        number(
            body.harga_beli ??
            body.hargaBeli
        );

    const total =
        body.total !== undefined
            ? number(body.total)
            : jumlah * hargaBeli;

    const tanggal =
        body.tanggal ||
        body.tanggal_pembelian ||
        new Date().toISOString();


    const result =
        await pool.query(
            `
            UPDATE pembelian
            SET
                produk_id = $1,
                supplier_id = $2,
                jumlah = $3,
                harga_beli = $4,
                total = $5,
                tanggal = $6
            WHERE id = $7
            RETURNING *
            `,
            [
                produkId,
                supplierId || null,
                jumlah,
                hargaBeli,
                total,
                tanggal,
                id
            ]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Pembelian tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Pembelian berhasil diupdate.",

            data:
                result.rows[0]
        }
    );
}


async function deletePembelian(
    res,
    id
) {

    const result =
        await pool.query(
            `
            DELETE FROM pembelian
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );


    if (!result.rows.length) {

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Pembelian tidak ditemukan."
            }
        );
    }


    return sendJSON(
        res,
        200,
        {
            success: true,

            message:
                "Pembelian berhasil dihapus.",

            data:
                result.rows[0]
        }
    );
}


// =========================================================
// DASHBOARD
// =========================================================

async function getDashboard(res) {

    const [
        produk,
        produkAktif,
        supplier,
        penjualan,
        pembelian
    ] =
        await Promise.all([

            pool.query(`
                SELECT
                    COUNT(*)::int AS total
                FROM produk
            `),

            pool.query(`
                SELECT
                    COUNT(*)::int AS total
                FROM produk
                WHERE status = 'active'
            `),

            pool.query(`
                SELECT
                    COUNT(*)::int AS total
                FROM supplier
            `),

            pool.query(`
                SELECT
                    COALESCE(
                        SUM(total),
                        0
                    ) AS total
                FROM penjualan
            `),

            pool.query(`
                SELECT
                    COALESCE(
                        SUM(total),
                        0
                    ) AS total
                FROM pembelian
            `)

        ]);


    const totalPenjualan =
        Number(
            penjualan.rows[0].total
        ) || 0;


    const totalPembelian =
        Number(
            pembelian.rows[0].total
        ) || 0;


    return sendJSON(
        res,
        200,
        {
            success: true,

            data: {

                totalProduk:
                    Number(
                        produk.rows[0].total
                    ),

                produkAktif:
                    Number(
                        produkAktif.rows[0].total
                    ),

                totalSupplier:
                    Number(
                        supplier.rows[0].total
                    ),

                totalPenjualan,

                totalPembelian,

                profit:
                    totalPenjualan -
                    totalPembelian
            }
        }
    );
}


// =========================================================
// LAPORAN
// =========================================================

async function getLaporan(
    parsedURL,
    res
) {

    const dari =
        parsedURL.searchParams.get(
            "dari"
        );

    const sampai =
        parsedURL.searchParams.get(
            "sampai"
        );


    let kondisiPenjualan = "";

    let kondisiPembelian = "";

    const paramsPenjualan = [];

    const paramsPembelian = [];


    if (dari) {

        kondisiPenjualan +=
            ` AND tanggal >= $${paramsPenjualan.length + 1}`;

        kondisiPembelian +=
            ` AND tanggal >= $${paramsPembelian.length + 1}`;

        paramsPenjualan.push(dari);

        paramsPembelian.push(dari);
    }


    if (sampai) {

        kondisiPenjualan +=
            ` AND tanggal <= $${paramsPenjualan.length + 1}`;

        kondisiPembelian +=
            ` AND tanggal <= $${paramsPembelian.length + 1}`;

        paramsPenjualan.push(sampai);

        paramsPembelian.push(sampai);
    }


    const [
        penjualan,
        pembelian
    ] =
        await Promise.all([

            pool.query(
                `
                SELECT
                    COUNT(*)::int AS transaksi,
                    COALESCE(
                        SUM(total),
                        0
                    ) AS total
                FROM penjualan
                WHERE 1 = 1
                ${kondisiPenjualan}
                `,
                paramsPenjualan
            ),

            pool.query(
                `
                SELECT
                    COUNT(*)::int AS transaksi,
                    COALESCE(
                        SUM(total),
                        0
                    ) AS total
                FROM pembelian
                WHERE 1 = 1
                ${kondisiPembelian}
                `,
                paramsPembelian
            )

        ]);


    const totalPenjualan =
        Number(
            penjualan.rows[0].total
        ) || 0;


    const totalPembelian =
        Number(
            pembelian.rows[0].total
        ) || 0;


    return sendJSON(
        res,
        200,
        {
            success: true,

            filter: {

                dari:
                    dari || null,

                sampai:
                    sampai || null
            },

            data: {

                penjualan: {

                    transaksi:
                        Number(
                            penjualan.rows[0]
                                .transaksi
                        ),

                    total:
                        totalPenjualan
                },

                pembelian: {

                    transaksi:
                        Number(
                            pembelian.rows[0]
                                .transaksi
                        ),

                    total:
                        totalPembelian
                },

                profit:
                    totalPenjualan -
                    totalPembelian
            }
        }
    );
}


// =========================================================
// DATABASE TEST
// =========================================================

async function testDatabase() {

    try {

        const result =
            await pool.query(
                "SELECT NOW() AS waktu"
            );


        console.log(
            "DATABASE OK:",
            result.rows[0].waktu
        );

    }

    catch (error) {

        console.error(
            "DATABASE ERROR:",
            error.message
        );
    }
}


// =========================================================
// START SERVER
// =========================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(`
==================================================
 QUEEN DROPSHIP API
==================================================

PORT:
${PORT}

HEALTH:
GET /api/ping
GET /api/test

PRODUK:
GET    /api/produk
POST   /api/produk
PUT    /api/produk/:id
DELETE /api/produk/:id

SUPPLIER:
GET    /api/supplier
POST   /api/supplier
PUT    /api/supplier/:id
DELETE /api/supplier/:id

PENJUALAN:
GET    /api/penjualan
POST   /api/penjualan
PUT    /api/penjualan/:id
DELETE /api/penjualan/:id

PEMBELIAN:
GET    /api/pembelian
POST   /api/pembelian
PUT    /api/pembelian/:id
DELETE /api/pembelian/:id

DASHBOARD:
GET /api/dashboard

LAPORAN:
GET /api/laporan

==================================================
        `);

        testDatabase();
    }
);


// =========================================================
// DATABASE POOL ERROR
// =========================================================

pool.on(
    "error",
    error => {

        console.error(
            "DATABASE POOL ERROR:",
            error.message
        );
    }
);


// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================

async function shutdown() {

    console.log(
        "Menutup server..."
    );


    server.close(
        async () => {

            try {

                await pool.end();

            }

            catch (error) {

                console.error(
                    "POOL CLOSE ERROR:",
                    error.message
                );
            }


            process.exit(0);
        }
    );
}


process.on(
    "SIGTERM",
    shutdown
);


process.on(
    "SIGINT",
    shutdown
);
