const http = require("http");
const { Pool } = require("pg");

const PORT = 3000;

// Masukkan connection string database kamu di sini.
// Jangan kirim credential database ke frontend/browser.
const DATABASE_URL = "postgresql://doctex:rD_aLSZ8D6LJ4hGX_ZD20A@queen-mink-20590.jxf.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: true
    }
});

const server = http.createServer(async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    try {

        // =========================
        // TEST DATABASE
        // =========================

        if (req.method === "GET" && req.url === "/api/test") {

            const result = await pool.query("SELECT NOW() AS waktu");

            return sendJSON(res, 200, {
                success: true,
                message: "Database terhubung",
                waktu: result.rows[0].waktu
            });
        }


        // =========================
        // PRODUK
        // =========================

        if (req.method === "GET" && req.url === "/api/produk") {

            const result = await pool.query(`
                SELECT *
                FROM produk
                ORDER BY id DESC
            `);

            return sendJSON(res, 200, result.rows);
        }


        // =========================
        // SUPPLIER
        // =========================

        if (req.method === "GET" && req.url === "/api/supplier") {

            const result = await pool.query(`
                SELECT *
                FROM supplier
                ORDER BY id DESC
            `);

            return sendJSON(res, 200, result.rows);
        }


        // =========================
        // PENJUALAN
        // =========================

        if (req.method === "GET" && req.url === "/api/penjualan") {

            const result = await pool.query(`
                SELECT *
                FROM penjualan
                ORDER BY id DESC
            `);

            return sendJSON(res, 200, result.rows);
        }


        // =========================
        // PEMBELIAN
        // =========================

        if (req.method === "GET" && req.url === "/api/pembelian") {

            const result = await pool.query(`
                SELECT *
                FROM pembelian
                ORDER BY id DESC
            `);

            return sendJSON(res, 200, result.rows);
        }


        // =========================
        // 404
        // =========================

        return sendJSON(res, 404, {
            success: false,
            message: "Endpoint tidak ditemukan"
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        return sendJSON(res, 500, {
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
});


// =========================================================
// JSON RESPONSE
// =========================================================

function sendJSON(res, status, data) {

    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data));
}


// =========================================================
// START
// =========================================================

server.listen(PORT, () => {

    console.log(`
========================================
 QUEEN DROPSHIP SERVER
========================================

Server : http://localhost:${PORT}

API:
GET /api/test
GET /api/produk
GET /api/supplier
GET /api/penjualan
GET /api/pembelian

========================================
`);
});


// =========================================================
// DATABASE ERROR
// =========================================================

pool.on("error", error => {

    console.error(
        "Database connection error:",
        error.message
    );

});
