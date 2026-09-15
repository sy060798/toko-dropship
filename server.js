const http = require("http");
const { Pool } = require("pg");

const PORT = 3000;

// =========================================================
// DATABASE
// =========================================================

// SEMENTARA untuk testing.
// Sebaiknya nanti pindahkan ke process.env.DATABASE_URL.

const DATABASE_URL =
    "postgresql://doctex:rD_aLSZ8D6LJ4hGX_ZD20A@queen-mink-20590.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

const pool = new Pool({
    connectionString: DATABASE_URL,

    ssl: {
        rejectUnauthorized: true
    }
});


// =========================================================
// SERVER
// =========================================================

const server = http.createServer(async (req, res) => {

    // =====================================================
    // CORS
    // =====================================================

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


    // =====================================================
    // PREFLIGHT
    // =====================================================

    if (req.method === "OPTIONS") {

        res.writeHead(204);

        return res.end();

    }


    try {

        // =================================================
        // TEST DATABASE
        // =================================================

        if (
            req.method === "GET" &&
            req.url === "/api/test"
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
                    message: "Database terhubung",
                    waktu: result.rows[0].waktu
                }
            );

        }


        // =================================================
        // GET PRODUK
        // =================================================

        if (
            req.method === "GET" &&
            req.url === "/api/produk"
        ) {

            const result =
                await pool.query(`
                    SELECT *
                    FROM produk
                    ORDER BY id DESC
                `);

            return sendJSON(
                res,
                200,
                result.rows
            );

        }


        // =================================================
        // POST PRODUK
        // =================================================

        if (
            req.method === "POST" &&
            req.url === "/api/produk"
        ) {

            const body =
                await getRequestBody(req);


            const {
                nama,
                sku,
                status,
                hargaSupplier,
                hargaJual,
                biayaShopee,
                deskripsi
            } = body;


            // ---------------------------------------------
            // VALIDASI
            // ---------------------------------------------

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


            // ---------------------------------------------
            // INSERT
            // ---------------------------------------------

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
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7
                    )
                    RETURNING *
                    `,
                    [
                        nama,
                        sku,
                        status || "active",
                        Number(hargaSupplier) || 0,
                        Number(hargaJual) || 0,
                        Number(biayaShopee) || 0,
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
                    data: result.rows[0]
                }
            );

        }


        // =================================================
        // PUT PRODUK
        // =================================================

        const putMatch =
            req.url.match(
                /^\/api\/produk\/(\d+)$/
            );


        if (
            req.method === "PUT" &&
            putMatch
        ) {

            const id =
                Number(putMatch[1]);


            const body =
                await getRequestBody(req);


            const {
                nama,
                sku,
                status,
                hargaSupplier,
                hargaJual,
                biayaShopee,
                deskripsi
            } = body;


            // ---------------------------------------------
            // VALIDASI
            // ---------------------------------------------

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


            // ---------------------------------------------
            // UPDATE
            // ---------------------------------------------

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
                        status || "active",
                        Number(hargaSupplier) || 0,
                        Number(hargaJual) || 0,
                        Number(biayaShopee) || 0,
                        deskripsi || null,
                        id
                    ]
                );


            if (result.rows.length === 0) {

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
                    data: result.rows[0]
                }
            );

        }


        // =================================================
        // DELETE PRODUK
        // =================================================

        const deleteMatch =
            req.url.match(
                /^\/api\/produk\/(\d+)$/
            );


        if (
            req.method === "DELETE" &&
            deleteMatch
        ) {

            const id =
                Number(deleteMatch[1]);


            const result =
                await pool.query(
                    `
                    DELETE FROM produk
                    WHERE id = $1
                    RETURNING *
                    `,
                    [id]
                );


            if (result.rows.length === 0) {

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
                    data: result.rows[0]
                }
            );

        }


        // =================================================
        // SUPPLIER
        // =================================================

        if (
            req.method === "GET" &&
            req.url === "/api/supplier"
        ) {

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


        // =================================================
        // PENJUALAN
        // =================================================

        if (
            req.method === "GET" &&
            req.url === "/api/penjualan"
        ) {

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


        // =================================================
        // PEMBELIAN
        // =================================================

        if (
            req.method === "GET" &&
            req.url === "/api/pembelian"
        ) {

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


        // =================================================
        // 404
        // =================================================

        return sendJSON(
            res,
            404,
            {
                success: false,
                message:
                    "Endpoint tidak ditemukan."
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
                    "Terjadi kesalahan server."
            }
        );

    }

});


// =========================================================
// REQUEST BODY
// =========================================================

function getRequestBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";


            req.on(
                "data",
                chunk => {

                    body += chunk;

                }
            );


            req.on(
                "end",
                () => {

                    try {

                        if (!body) {

                            resolve({});

                            return;

                        }


                        const data =
                            JSON.parse(body);


                        resolve(data);

                    }

                    catch (error) {

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
// JSON RESPONSE
// =========================================================

function sendJSON(
    res,
    status,
    data
) {

    res.writeHead(
        status,
        {
            "Content-Type":
                "application/json; charset=utf-8"
        }
    );


    res.end(
        JSON.stringify(data)
    );

}


// =========================================================
// START SERVER
// =========================================================

server.listen(
    PORT,
    () => {

        console.log(`
========================================
 QUEEN DROPSHIP SERVER
========================================

Server:
http://localhost:${PORT}

API PRODUK:

GET:
http://localhost:${PORT}/api/produk

POST:
http://localhost:${PORT}/api/produk

PUT:
http://localhost:${PORT}/api/produk/:id

DELETE:
http://localhost:${PORT}/api/produk/:id

TEST DATABASE:
http://localhost:${PORT}/api/test

========================================
        `);

    }
);


// =========================================================
// DATABASE ERROR
// =========================================================

pool.on(
    "error",
    error => {

        console.error(
            "Database connection error:",
            error.message
        );

    }
);
