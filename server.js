/* =========================================================
   QUEEN DROPSHIP
   SERVER.JS
   DATABASE: COCKROACHDB / QUEEN
========================================================= */

"use strict";


/* =========================================================
   IMPORT
========================================================= */

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");


/* =========================================================
   APP
========================================================= */

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: "*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================================
   DATABASE
========================================================= */

process.env.DATABASE_URL =
    "postgresql://doctex:znUki-RNbHJE2wEyrSE_CQ@queen-mink-20590.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

if (!process.env.DATABASE_URL) {

    console.error(
        "ERROR: DATABASE_URL belum diatur."
    );

    console.error(
        "Contoh:"
    );

    console.error(
        "DATABASE_URL=postgresql://USER:PASSWORD@HOST:26257/defaultdb?sslmode=verify-full"
    );

    process.exit(1);
}


const pool =
    new Pool({

        connectionString:
            process.env.DATABASE_URL,

        max: 10,

        idleTimeoutMillis:
            30000,

        connectionTimeoutMillis:
            10000
    });


/* =========================================================
   TEST DATABASE
========================================================= */

async function testDatabase() {

    try {

        const result =
            await pool.query(
                "SELECT NOW() AS waktu"
            );

        console.log(
            "Database berhasil terhubung."
        );

        console.log(
            "Waktu database:",
            result.rows[0].waktu
        );

    } catch (error) {

        console.error(
            "Gagal terhubung ke database:"
        );

        console.error(
            error.message
        );

        throw error;
    }
}


/* =========================================================
   CREATE TABLE PRODUK
========================================================= */

async function createProdukTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS produk (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            nama STRING NOT NULL,

            sku STRING NOT NULL UNIQUE,

            harga_supplier DECIMAL(15,2) NOT NULL DEFAULT 0,

            harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,

            margin DECIMAL(10,2) NOT NULL DEFAULT 0,

            biaya_shopee DECIMAL(15,2) NOT NULL DEFAULT 0,

            status STRING NOT NULL DEFAULT 'active',

            deskripsi STRING DEFAULT '',

            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

        )
    `;

    await pool.query(sql);

    console.log(
        "Tabel produk siap digunakan."
    );
}


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/",
    function (req, res) {

        res.json({

            success: true,

            message:
                "Queen Dropship API aktif.",

            database:
                "CockroachDB / Queen"

        });

    }
);


/* =========================================================
   DATABASE STATUS
========================================================= */

app.get(
    "/api/status",
    async function (req, res) {

        try {

            const result =
                await pool.query(
                    "SELECT NOW() AS waktu"
                );

            res.json({

                success: true,

                database:
                    "connected",

                waktu:
                    result.rows[0].waktu

            });

        } catch (error) {

            console.error(
                "Status database error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Database tidak terhubung.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   GET SEMUA PRODUK
========================================================= */

app.get(
    "/api/produk",
    async function (req, res) {

        try {

            const result =
                await pool.query(`
                    SELECT
                        id,
                        nama,
                        sku,
                        harga_supplier,
                        harga_jual,
                        margin,
                        biaya_shopee,
                        status,
                        deskripsi,
                        created_at,
                        updated_at
                    FROM produk
                    ORDER BY created_at DESC
                `);


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "GET /api/produk error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil data produk.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   GET SATU PRODUK
========================================================= */

app.get(
    "/api/produk/:id",
    async function (req, res) {

        try {

            const { id } =
                req.params;


            const result =
                await pool.query(
                    `
                    SELECT
                        id,
                        nama,
                        sku,
                        harga_supplier,
                        harga_jual,
                        margin,
                        biaya_shopee,
                        status,
                        deskripsi,
                        created_at,
                        updated_at
                    FROM produk
                    WHERE id = $1
                    `,
                    [id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Produk tidak ditemukan."

                });

            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "GET produk/:id error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Gagal mengambil produk.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   POST TAMBAH PRODUK
========================================================= */

app.post(
    "/api/produk",
    async function (req, res) {

        try {

            const {

                nama,
                sku,
                harga_supplier,
                harga_jual,
                margin,
                biaya_shopee,
                status,
                deskripsi

            } = req.body;


            /* VALIDASI */

            if (!nama || !String(nama).trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nama produk wajib diisi."

                });

            }


            if (!sku || !String(sku).trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "SKU wajib diisi."

                });

            }


            const hargaSupplier =
                Number(harga_supplier) || 0;


            const hargaJual =
                Number(harga_jual) || 0;


            const marginValue =
                Number(margin) || 0;


            const biayaShopee =
                Number(biaya_shopee) || 0;


            if (
                hargaSupplier <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Harga supplier harus lebih dari 0."

                });

            }


            if (
                hargaJual <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Harga jual harus lebih dari 0."

                });

            }


            const result =
                await pool.query(
                    `
                    INSERT INTO produk (
                        nama,
                        sku,
                        harga_supplier,
                        harga_jual,
                        margin,
                        biaya_shopee,
                        status,
                        deskripsi
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8
                    )
                    RETURNING *
                    `,
                    [
                        String(nama).trim(),
                        String(sku).trim(),
                        hargaSupplier,
                        hargaJual,
                        marginValue,
                        biayaShopee,
                        status || "active",
                        deskripsi
                            ? String(deskripsi).trim()
                            : ""
                    ]
                );


            console.log(
                "Produk berhasil ditambahkan:",
                result.rows[0].sku
            );


            res.status(201).json({

                success: true,

                message:
                    "Produk berhasil ditambahkan.",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "POST /api/produk error:",
                error
            );


            /* SKU DUPLIKAT */

            if (
                error.code === "23505"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "SKU sudah digunakan."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Gagal menambahkan produk.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   PUT UPDATE PRODUK
========================================================= */

app.put(
    "/api/produk/:id",
    async function (req, res) {

        try {

            const { id } =
                req.params;


            const {

                nama,
                sku,
                harga_supplier,
                harga_jual,
                margin,
                biaya_shopee,
                status,
                deskripsi

            } = req.body;


            /* VALIDASI */

            if (!nama || !String(nama).trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Nama produk wajib diisi."

                });

            }


            if (!sku || !String(sku).trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "SKU wajib diisi."

                });

            }


            const hargaSupplier =
                Number(harga_supplier) || 0;


            const hargaJual =
                Number(harga_jual) || 0;


            const marginValue =
                Number(margin) || 0;


            const biayaShopee =
                Number(biaya_shopee) || 0;


            if (
                hargaSupplier <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Harga supplier harus lebih dari 0."

                });

            }


            if (
                hargaJual <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Harga jual harus lebih dari 0."

                });

            }


            const result =
                await pool.query(
                    `
                    UPDATE produk
                    SET
                        nama = $1,
                        sku = $2,
                        harga_supplier = $3,
                        harga_jual = $4,
                        margin = $5,
                        biaya_shopee = $6,
                        status = $7,
                        deskripsi = $8,
                        updated_at = now()
                    WHERE id = $9
                    RETURNING *
                    `,
                    [
                        String(nama).trim(),
                        String(sku).trim(),
                        hargaSupplier,
                        hargaJual,
                        marginValue,
                        biayaShopee,
                        status || "active",
                        deskripsi
                            ? String(deskripsi).trim()
                            : "",
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Produk tidak ditemukan."

                });

            }


            console.log(
                "Produk berhasil diupdate:",
                result.rows[0].sku
            );


            res.json({

                success: true,

                message:
                    "Produk berhasil diperbarui.",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "PUT /api/produk/:id error:",
                error
            );


            if (
                error.code === "23505"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "SKU sudah digunakan."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Gagal memperbarui produk.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   DELETE PRODUK
========================================================= */

app.delete(
    "/api/produk/:id",
    async function (req, res) {

        try {

            const { id } =
                req.params;


            const result =
                await pool.query(
                    `
                    DELETE FROM produk
                    WHERE id = $1
                    RETURNING *
                    `,
                    [id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Produk tidak ditemukan."

                });

            }


            console.log(
                "Produk berhasil dihapus:",
                result.rows[0].sku
            );


            res.json({

                success: true,

                message:
                    "Produk berhasil dihapus.",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "DELETE /api/produk/:id error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Gagal menghapus produk.",

                error:
                    error.message

            });

        }

    }
);


/* =========================================================
   404 API
========================================================= */

app.use(
    function (req, res) {

        res.status(404).json({

            success: false,

            message:
                "Endpoint tidak ditemukan.",

            path:
                req.originalUrl

        });

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    function (error, req, res, next) {

        console.error(
            "SERVER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Terjadi kesalahan pada server.",

            error:
                error.message

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

    try {

        console.log(
            "Menghubungkan ke database..."
        );


        await testDatabase();


        await createProdukTable();


        app.listen(
            PORT,
            function () {

                console.log("");
                console.log(
                    "======================================"
                );

                console.log(
                    " QUEEN DROPSHIP SERVER AKTIF"
                );

                console.log(
                    "======================================"
                );

                console.log(
                    `Server : http://localhost:${PORT}`
                );

                console.log(
                    `Produk : http://localhost:${PORT}/api/produk`
                );

                console.log(
                    `Status : http://localhost:${PORT}/api/status`
                );

                console.log(
                    "Database : CockroachDB / Queen"
                );

                console.log(
                    "======================================"
                );

            }
        );

    } catch (error) {

        console.error("");
        console.error(
            "======================================"
        );

        console.error(
            " SERVER GAGAL DIMULAI"
        );

        console.error(
            "======================================"
        );

        console.error(
            error.message
        );

        console.error(
            "======================================"
        );

        process.exit(1);
    }
}


/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

process.on(
    "SIGINT",
    async function () {

        console.log(
            "\nMenutup server..."
        );

        await pool.end();

        process.exit(0);
    }
);


process.on(
    "SIGTERM",
    async function () {

        console.log(
            "\nMenutup server..."
        );

        await pool.end();

        process.exit(0);
    }
);


/* =========================================================
   RUN
========================================================= */

startServer();
