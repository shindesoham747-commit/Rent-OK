const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  initializeDatabase,
  getDatabase,
  saveDatabase
} = require("./database");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "rentok_secret";

app.use(cors());
app.use(express.json());

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getRows(sql, params = []) {
  const db = getDatabase();
  const result = db.exec(sql, params);

  if (!result.length) {
    return [];
  }

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map((row) => {
    const object = {};

    columns.forEach((column, index) => {
      object[column] = row[index];
    });

    return object;
  });
}

function getOne(sql, params = []) {
  const rows = getRows(sql, params);
  return rows.length ? rows[0] : null;
}

function sendError(res, error, message = "Server error") {
  console.error(message, error);

  return res.status(500).json({
    success: false,
    message,
    error: error.message
  });
}

/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required"
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format"
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

/* =========================================================
   BASIC ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to RentOk API",
    version: "1.0.0"
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "RentOk API is healthy",
    timestamp: new Date().toISOString()
  });
});

/* =========================================================
   DATABASE TEST
========================================================= */

app.get("/api/test-db", (req, res) => {
  try {
    const count = (tableName) => {
      const result = getRows(
        `SELECT COUNT(*) AS count FROM ${tableName}`
      );

      return result[0].count;
    };

    res.json({
      success: true,
      message: "SQLite database is working",
      counts: {
        users: count("users"),
        properties: count("properties"),
        rooms: count("rooms"),
        beds: count("beds"),
        tenants: count("tenants"),
        payments: count("payments"),
        expenses: count("expenses"),
        notifications: count("notifications")
      }
    });
  } catch (error) {
    return sendError(res, error, "Database error");
  }
});

/* =========================================================
   SIGNUP
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const db = getDatabase();

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = getOne(
      `SELECT id FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
      `,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword
      ]
    );

    const user = getOne(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    saveDatabase();

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user,
      token
    });
  } catch (error) {
    return sendError(res, error, "Signup failed");
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = getOne(
      `
      SELECT id, name, email, password, created_at
      FROM users
      WHERE email = ?
      `,
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    delete user.password;

    res.json({
      success: true,
      message: "Login successful",
      user,
      token
    });
  } catch (error) {
    return sendError(res, error, "Login failed");
  }
});

/* =========================================================
   PROFILE
========================================================= */

app.get(
  "/api/auth/profile",
  authenticateToken,
  (req, res) => {
    try {
      const user = getOne(
        `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      return sendError(res, error, "Could not load profile");
    }
  }
);

/* =========================================================
   PROPERTIES - GET ALL
========================================================= */

app.get(
  "/api/properties",
  authenticateToken,
  (req, res) => {
    try {
      const properties = getRows(
        `
        SELECT
          id,
          owner_id AS ownerId,
          name,
          address,
          total_rooms AS totalRooms,
          total_beds AS totalBeds,
          monthly_rent AS monthlyRent,
          security_deposit AS securityDeposit,
          amenities,
          created_at AS createdAt
        FROM properties
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      properties.forEach((property) => {
        try {
          property.amenities = property.amenities
            ? JSON.parse(property.amenities)
            : [];
        } catch {
          property.amenities = [];
        }
      });

      res.json({
        success: true,
        properties
      });
    } catch (error) {
      return sendError(res, error, "Could not load properties");
    }
  }
);

/* =========================================================
   PROPERTY - GET ONE
========================================================= */

app.get(
  "/api/properties/:id",
  authenticateToken,
  (req, res) => {
    try {
      const property = getOne(
        `
        SELECT
          id,
          owner_id AS ownerId,
          name,
          address,
          total_rooms AS totalRooms,
          total_beds AS totalBeds,
          monthly_rent AS monthlyRent,
          security_deposit AS securityDeposit,
          amenities,
          created_at AS createdAt
        FROM properties
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      try {
        property.amenities = property.amenities
          ? JSON.parse(property.amenities)
          : [];
      } catch {
        property.amenities = [];
      }

      res.json({
        success: true,
        property
      });
    } catch (error) {
      return sendError(res, error, "Could not load property");
    }
  }
);

/* =========================================================
   PROPERTY - CREATE
========================================================= */

app.post(
  "/api/properties",
  authenticateToken,
  (req, res) => {
    try {
      const {
        name,
        address,
        totalRooms = 0,
        totalBeds = 0,
        monthlyRent = 0,
        securityDeposit = 0,
        amenities = []
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Property name is required"
        });
      }

      const db = getDatabase();

      const amenitiesData = Array.isArray(amenities)
        ? JSON.stringify(amenities)
        : JSON.stringify([]);

      db.run(
        `
        INSERT INTO properties (
          owner_id,
          name,
          address,
          total_rooms,
          total_beds,
          monthly_rent,
          security_deposit,
          amenities
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          name,
          address || "",
          Number(totalRooms),
          Number(totalBeds),
          Number(monthlyRent),
          Number(securityDeposit),
          amenitiesData
        ]
      );

      const property = getOne(
        `
        SELECT
          id,
          owner_id AS ownerId,
          name,
          address,
          total_rooms AS totalRooms,
          total_beds AS totalBeds,
          monthly_rent AS monthlyRent,
          security_deposit AS securityDeposit,
          amenities,
          created_at AS createdAt
        FROM properties
        WHERE owner_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [req.user.id]
      );

      saveDatabase();

      res.status(201).json({
        success: true,
        message: "Property created successfully",
        property
      });
    } catch (error) {
      return sendError(res, error, "Could not create property");
    }
  }
);

/* =========================================================
   PROPERTY - UPDATE
========================================================= */

app.put(
  "/api/properties/:id",
  authenticateToken,
  (req, res) => {
    try {
      const existing = getOne(
        `
        SELECT id
        FROM properties
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const {
        name,
        address,
        totalRooms = 0,
        totalBeds = 0,
        monthlyRent = 0,
        securityDeposit = 0,
        amenities = []
      } = req.body;

      const db = getDatabase();

      db.run(
        `
        UPDATE properties
        SET
          name = ?,
          address = ?,
          total_rooms = ?,
          total_beds = ?,
          monthly_rent = ?,
          security_deposit = ?,
          amenities = ?
        WHERE id = ? AND owner_id = ?
        `,
        [
          name,
          address || "",
          Number(totalRooms),
          Number(totalBeds),
          Number(monthlyRent),
          Number(securityDeposit),
          JSON.stringify(
            Array.isArray(amenities) ? amenities : []
          ),
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      const property = getOne(
        `
        SELECT
          id,
          owner_id AS ownerId,
          name,
          address,
          total_rooms AS totalRooms,
          total_beds AS totalBeds,
          monthly_rent AS monthlyRent,
          security_deposit AS securityDeposit,
          amenities,
          created_at AS createdAt
        FROM properties
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      res.json({
        success: true,
        message: "Property updated successfully",
        property
      });
    } catch (error) {
      return sendError(res, error, "Could not update property");
    }
  }
);

/* =========================================================
   PROPERTY - DELETE
========================================================= */

app.delete(
  "/api/properties/:id",
  authenticateToken,
  (req, res) => {
    try {
      const db = getDatabase();

      db.run(
        `
        DELETE FROM properties
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Property deleted successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not delete property");
    }
  }
);

/* =========================================================
   ROOMS - GET
========================================================= */

app.get(
  "/api/rooms",
  authenticateToken,
  (req, res) => {
    try {
      const rooms = getRows(
        `
        SELECT
          r.id,
          r.property_id AS propertyId,
          r.room_number AS roomNumber,
          r.room_type AS roomType,
          r.rent,
          r.status,
          r.created_at AS createdAt
        FROM rooms r
        INNER JOIN properties p
          ON p.id = r.property_id
        WHERE p.owner_id = ?
        ORDER BY r.id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        rooms
      });
    } catch (error) {
      return sendError(res, error, "Could not load rooms");
    }
  }
);

/* =========================================================
   ROOM - CREATE
========================================================= */

app.post(
  "/api/rooms",
  authenticateToken,
  (req, res) => {
    try {
      const {
        propertyId,
        roomNumber,
        roomType = "",
        rent = 0,
        status = "available"
      } = req.body;

      if (!propertyId || !roomNumber) {
        return res.status(400).json({
          success: false,
          message: "Property and room number are required"
        });
      }

      const property = getOne(
        `
        SELECT id
        FROM properties
        WHERE id = ? AND owner_id = ?
        `,
        [
          propertyId,
          req.user.id
        ]
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found"
        });
      }

      const db = getDatabase();

      db.run(
        `
        INSERT INTO rooms (
          property_id,
          room_number,
          room_type,
          rent,
          status
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          propertyId,
          roomNumber,
          roomType,
          Number(rent),
          status
        ]
      );

      saveDatabase();

      res.status(201).json({
        success: true,
        message: "Room created successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not create room");
    }
  }
);

/* =========================================================
   BEDS - GET
========================================================= */

app.get(
  "/api/beds",
  authenticateToken,
  (req, res) => {
    try {
      const beds = getRows(
        `
        SELECT
          b.id,
          b.room_id AS roomId,
          b.bed_number AS bedNumber,
          b.status,
          b.created_at AS createdAt
        FROM beds b
        INNER JOIN rooms r
          ON r.id = b.room_id
        INNER JOIN properties p
          ON p.id = r.property_id
        WHERE p.owner_id = ?
        ORDER BY b.id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        beds
      });
    } catch (error) {
      return sendError(res, error, "Could not load beds");
    }
  }
);

/* =========================================================
   BED - UPDATE
========================================================= */

app.put(
  "/api/beds/:id",
  authenticateToken,
  (req, res) => {
    try {
      const {
        bedNumber,
        status
      } = req.body;

      const db = getDatabase();

      const bed = getOne(
        `
        SELECT b.id
        FROM beds b
        INNER JOIN rooms r
          ON r.id = b.room_id
        INNER JOIN properties p
          ON p.id = r.property_id
        WHERE b.id = ? AND p.owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!bed) {
        return res.status(404).json({
          success: false,
          message: "Bed not found"
        });
      }

      db.run(
        `
        UPDATE beds
        SET
          bed_number = COALESCE(?, bed_number),
          status = COALESCE(?, status)
        WHERE id = ?
        `,
        [
          bedNumber || null,
          status || null,
          req.params.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Bed updated successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not update bed");
    }
  }
);

/* =========================================================
   TENANTS - GET
========================================================= */

app.get(
  "/api/tenants",
  authenticateToken,
  (req, res) => {
    try {
      const tenants = getRows(
        `
        SELECT
          t.id,
          t.owner_id AS ownerId,
          t.property_id AS propertyId,
          t.room_id AS roomId,
          t.bed_id AS bedId,
          t.name,
          t.phone,
          t.email,
          t.rent,
          t.joining_date AS joiningDate,
          t.status,
          t.created_at AS createdAt
        FROM tenants t
        WHERE t.owner_id = ?
        ORDER BY t.id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        tenants
      });
    } catch (error) {
      return sendError(res, error, "Could not load tenants");
    }
  }
);

/* =========================================================
   TENANT - CREATE
========================================================= */

app.post(
  "/api/tenants",
  authenticateToken,
  (req, res) => {
    try {
      const {
        propertyId,
        roomId,
        bedId,
        name,
        phone = "",
        email = "",
        rent = 0,
        joiningDate = "",
        status = "active"
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tenant name is required"
        });
      }

      const db = getDatabase();

      db.run(
        `
        INSERT INTO tenants (
          owner_id,
          property_id,
          room_id,
          bed_id,
          name,
          phone,
          email,
          rent,
          joining_date,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          propertyId || null,
          roomId || null,
          bedId || null,
          name,
          phone,
          email,
          Number(rent),
          joiningDate,
          status
        ]
      );

      saveDatabase();

      res.status(201).json({
        success: true,
        message: "Tenant created successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not create tenant");
    }
  }
);

/* =========================================================
   TENANT - UPDATE
========================================================= */

app.put(
  "/api/tenants/:id",
  authenticateToken,
  (req, res) => {
    try {
      const tenant = getOne(
        `
        SELECT id
        FROM tenants
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Tenant not found"
        });
      }

      const {
        propertyId,
        roomId,
        bedId,
        name,
        phone = "",
        email = "",
        rent = 0,
        joiningDate = "",
        status = "active"
      } = req.body;

      const db = getDatabase();

      db.run(
        `
        UPDATE tenants
        SET
          property_id = ?,
          room_id = ?,
          bed_id = ?,
          name = ?,
          phone = ?,
          email = ?,
          rent = ?,
          joining_date = ?,
          status = ?
        WHERE id = ? AND owner_id = ?
        `,
        [
          propertyId || null,
          roomId || null,
          bedId || null,
          name,
          phone,
          email,
          Number(rent),
          joiningDate,
          status,
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Tenant updated successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not update tenant");
    }
  }
);

/* =========================================================
   TENANT - DELETE
========================================================= */

app.delete(
  "/api/tenants/:id",
  authenticateToken,
  (req, res) => {
    try {
      const db = getDatabase();

      db.run(
        `
        DELETE FROM tenants
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Tenant deleted successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not delete tenant");
    }
  }
);

/* =========================================================
   PAYMENTS - GET
========================================================= */

app.get(
  "/api/payments",
  authenticateToken,
  (req, res) => {
    try {
      const payments = getRows(
        `
        SELECT
          id,
          owner_id AS ownerId,
          tenant_id AS tenantId,
          amount,
          payment_date AS paymentDate,
          payment_method AS paymentMethod,
          status,
          notes,
          created_at AS createdAt
        FROM payments
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      return sendError(res, error, "Could not load payments");
    }
  }
);

/* =========================================================
   PAYMENT - CREATE
========================================================= */

app.post(
  "/api/payments",
  authenticateToken,
  (req, res) => {
    try {
      const {
        tenantId,
        amount,
        paymentDate = "",
        paymentMethod = "cash",
        status = "paid",
        notes = ""
      } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: "Payment amount is required"
        });
      }

      const db = getDatabase();

      db.run(
        `
        INSERT INTO payments (
          owner_id,
          tenant_id,
          amount,
          payment_date,
          payment_method,
          status,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          tenantId || null,
          Number(amount),
          paymentDate,
          paymentMethod,
          status,
          notes
        ]
      );

      saveDatabase();

      res.status(201).json({
        success: true,
        message: "Payment recorded successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not create payment");
    }
  }
);

/* =========================================================
   EXPENSES - GET
========================================================= */

app.get(
  "/api/expenses",
  authenticateToken,
  (req, res) => {
    try {
      const expenses = getRows(
        `
        SELECT
          id,
          owner_id AS ownerId,
          property_id AS propertyId,
          title,
          amount,
          expense_date AS expenseDate,
          category,
          notes,
          created_at AS createdAt
        FROM expenses
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        expenses
      });
    } catch (error) {
      return sendError(res, error, "Could not load expenses");
    }
  }
);

/* =========================================================
   EXPENSE - CREATE
========================================================= */

app.post(
  "/api/expenses",
  authenticateToken,
  (req, res) => {
    try {
      const {
        propertyId,
        title,
        amount,
        expenseDate = "",
        category = "",
        notes = ""
      } = req.body;

      if (!title || !amount) {
        return res.status(400).json({
          success: false,
          message: "Expense title and amount are required"
        });
      }

      const db = getDatabase();

      db.run(
        `
        INSERT INTO expenses (
          owner_id,
          property_id,
          title,
          amount,
          expense_date,
          category,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          propertyId || null,
          title,
          Number(amount),
          expenseDate,
          category,
          notes
        ]
      );

      saveDatabase();

      res.status(201).json({
        success: true,
        message: "Expense added successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not create expense");
    }
  }
);

/* =========================================================
   EXPENSE - DELETE
========================================================= */

app.delete(
  "/api/expenses/:id",
  authenticateToken,
  (req, res) => {
    try {
      const db = getDatabase();

      db.run(
        `
        DELETE FROM expenses
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Expense deleted successfully"
      });
    } catch (error) {
      return sendError(res, error, "Could not delete expense");
    }
  }
);

/* =========================================================
   DASHBOARD
========================================================= */

app.get(
  "/api/dashboard",
  authenticateToken,
  (req, res) => {
    try {
      const properties = getOne(
        `
        SELECT COUNT(*) AS count
        FROM properties
        WHERE owner_id = ?
        `,
        [req.user.id]
      ).count;

      const tenants = getOne(
        `
        SELECT COUNT(*) AS count
        FROM tenants
        WHERE owner_id = ?
        AND status = 'active'
        `,
        [req.user.id]
      ).count;

      const payments = getOne(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM payments
        WHERE owner_id = ?
        AND status = 'paid'
        `,
        [req.user.id]
      ).total;

      const expenses = getOne(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE owner_id = ?
        `,
        [req.user.id]
      ).total;

      res.json({
        success: true,
        dashboard: {
          properties,
          tenants,
          totalPayments: payments,
          totalExpenses: expenses,
          netIncome: Number(payments) - Number(expenses)
        }
      });
    } catch (error) {
      return sendError(res, error, "Could not load dashboard");
    }
  }
);

/* =========================================================
   NOTIFICATIONS - GET
========================================================= */

app.get(
  "/api/notifications",
  authenticateToken,
  (req, res) => {
    try {
      const notifications = getRows(
        `
        SELECT
          id,
          title,
          message,
          type,
          is_read AS isRead,
          created_at AS createdAt
        FROM notifications
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Could not load notifications"
      );
    }
  }
);

/* =========================================================
   NOTIFICATION - MARK AS READ
========================================================= */

app.put(
  "/api/notifications/:id/read",
  authenticateToken,
  (req, res) => {
    try {
      const db = getDatabase();

      db.run(
        `
        UPDATE notifications
        SET is_read = 1
        WHERE id = ? AND owner_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      saveDatabase();

      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Could not update notification"
      );
    }
  }
);

/* =========================================================
   REPORTS
========================================================= */

app.get(
  "/api/reports",
  authenticateToken,
  (req, res) => {
    try {
      const paymentTotal = getOne(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM payments
        WHERE owner_id = ?
        AND status = 'paid'
        `,
        [req.user.id]
      ).total;

      const expenseTotal = getOne(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE owner_id = ?
        `,
        [req.user.id]
      ).total;

      const monthlyPayments = getRows(
        `
        SELECT
          payment_date AS date,
          amount,
          payment_method AS paymentMethod,
          status
        FROM payments
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      const monthlyExpenses = getRows(
        `
        SELECT
          expense_date AS date,
          title,
          amount,
          category
        FROM expenses
        WHERE owner_id = ?
        ORDER BY id DESC
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        reports: {
          totalIncome: paymentTotal,
          totalExpenses: expenseTotal,
          netIncome:
            Number(paymentTotal) -
            Number(expenseTotal),
          payments: monthlyPayments,
          expenses: monthlyExpenses
        }
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Could not generate reports"
      );
    }
  }
);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log("=================================");
      console.log("RentOk Backend Started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("Database: SQLite");
      console.log("Database file: data/rentok.db");
      console.log("=================================");
    });
  } catch (error) {
    console.error("Failed to start RentOk backend:");
    console.error(error);
    process.exit(1);
  }
}

startServer();