const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "rentok.db");

let db = null;

async function initializeDatabase() {
    try {
        const SQL = await initSqlJs();

        // Make sure data folder exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Open existing database or create a new one
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }

        // USERS
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // PROPERTIES
        db.run(`
            CREATE TABLE IF NOT EXISTS properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                address TEXT,
                total_rooms INTEGER DEFAULT 0,
                total_beds INTEGER DEFAULT 0,
                monthly_rent REAL DEFAULT 0,
                security_deposit REAL DEFAULT 0,
                amenities TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        `);

        // ROOMS
        db.run(`
            CREATE TABLE IF NOT EXISTS rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                property_id INTEGER NOT NULL,
                room_number TEXT NOT NULL,
                room_type TEXT,
                rent REAL DEFAULT 0,
                status TEXT DEFAULT 'available',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id)
            )
        `);

        // BEDS
        db.run(`
            CREATE TABLE IF NOT EXISTS beds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                bed_number TEXT NOT NULL,
                status TEXT DEFAULT 'available',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            )
        `);

        // TENANTS
        db.run(`
            CREATE TABLE IF NOT EXISTS tenants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                property_id INTEGER,
                room_id INTEGER,
                bed_id INTEGER,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                rent REAL DEFAULT 0,
                joining_date TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id),
                FOREIGN KEY (property_id) REFERENCES properties(id),
                FOREIGN KEY (room_id) REFERENCES rooms(id),
                FOREIGN KEY (bed_id) REFERENCES beds(id)
            )
        `);

        // PAYMENTS
        db.run(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                tenant_id INTEGER,
                amount REAL NOT NULL,
                payment_date TEXT,
                payment_method TEXT,
                status TEXT DEFAULT 'paid',
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id),
                FOREIGN KEY (tenant_id) REFERENCES tenants(id)
            )
        `);

        // EXPENSES
        db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                property_id INTEGER,
                title TEXT NOT NULL,
                amount REAL NOT NULL,
                expense_date TEXT,
                category TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id),
                FOREIGN KEY (property_id) REFERENCES properties(id)
            )
        `);

        // NOTIFICATIONS
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        `);

        saveDatabase();

        console.log("SQLite database initialized successfully.");
        console.log("Database:", dbPath);

        return db;

    } catch (error) {
        console.error("Database initialization failed:", error);
        throw error;
    }
}

function saveDatabase() {
    if (!db) return;

    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
}

function getDatabase() {
    if (!db) {
        throw new Error("Database has not been initialized.");
    }

    return db;
}

module.exports = {
    initializeDatabase,
    getDatabase,
    saveDatabase
};