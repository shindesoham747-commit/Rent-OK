import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("rentok_token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

const initialProperties = [
  {
    id: 1,
    name: "RentOk Residency",
    location: "Pimpri, Pune",
    rooms: 42,
    occupied: 36,
    revenue: 486000,
    status: "Active",
  },
  {
    id: 2,
    name: "Green View PG",
    location: "Wakad, Pune",
    rooms: 28,
    occupied: 24,
    revenue: 324000,
    status: "Active",
  },
];

const initialResidents = [
  {
    id: 1,
    name: "Rahul Sharma",
    room: "A-101",
    property: "RentOk Residency",
    phone: "+91 98765 43210",
    rent: 12000,
    paid: true,
    joined: "12 Aug 2026",
  },
  {
    id: 2,
    name: "Aditya Patil",
    room: "A-102",
    property: "RentOk Residency",
    phone: "+91 91234 56789",
    rent: 11000,
    paid: false,
    joined: "18 Aug 2026",
  },
  {
    id: 3,
    name: "Vivek Kumar",
    room: "B-204",
    property: "Green View PG",
    phone: "+91 99887 77665",
    rent: 13500,
    paid: true,
    joined: "02 Sep 2026",
  },
  {
    id: 4,
    name: "Amit Joshi",
    room: "B-207",
    property: "Green View PG",
    phone: "+91 90909 80808",
    rent: 12500,
    paid: false,
    joined: "06 Sep 2026",
  },
];

const initialExpenses = [
  {
    id: 1,
    title: "Electricity Bill",
    category: "Utilities",
    property: "RentOk Residency",
    amount: 28400,
    date: "28 Sep 2026",
  },
  {
    id: 2,
    title: "Housekeeping",
    category: "Staff",
    property: "Green View PG",
    amount: 18000,
    date: "26 Sep 2026",
  },
  {
    id: 3,
    title: "Plumbing Repair",
    category: "Maintenance",
    property: "RentOk Residency",
    amount: 6500,
    date: "24 Sep 2026",
  },
];

const initialComplaints = [
  {
    id: 1,
    title: "AC not cooling",
    resident: "Rahul Sharma",
    room: "A-101",
    priority: "High",
    status: "Open",
    date: "30 Sep 2026",
  },
  {
    id: 2,
    title: "Bathroom tap leakage",
    resident: "Aditya Patil",
    room: "A-102",
    priority: "Medium",
    status: "In Progress",
    date: "29 Sep 2026",
  },
  {
    id: 3,
    title: "Wi-Fi issue",
    resident: "Vivek Kumar",
    room: "B-204",
    priority: "Low",
    status: "Resolved",
    date: "27 Sep 2026",
  },
];

const rooms = [
  { id: "A-101", property: "RentOk Residency", type: "Double", beds: 2, occupied: 2, rent: 12000 },
  { id: "A-102", property: "RentOk Residency", type: "Double", beds: 2, occupied: 1, rent: 11000 },
  { id: "A-103", property: "RentOk Residency", type: "Triple", beds: 3, occupied: 2, rent: 10000 },
  { id: "A-104", property: "RentOk Residency", type: "Single", beds: 1, occupied: 1, rent: 15000 },
  { id: "B-201", property: "Green View PG", type: "Double", beds: 2, occupied: 2, rent: 13500 },
  { id: "B-204", property: "Green View PG", type: "Double", beds: 2, occupied: 1, rent: 13500 },
  { id: "B-207", property: "Green View PG", type: "Triple", beds: 3, occupied: 2, rent: 12500 },
];

const notifications = [
  {
    id: 1,
    title: "Rent payment pending",
    text: "Aditya Patil has not completed this month's rent.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: 2,
    title: "Maintenance request",
    text: "A new AC complaint was reported for room A-101.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Payment received",
    text: "Rahul Sharma's monthly rent has been received.",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: 4,
    title: "Occupancy update",
    text: "Green View PG occupancy is currently 85.7%.",
    time: "Yesterday",
    unread: false,
  },
];

const menu = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "properties", label: "Properties", icon: "▣" },
  { id: "rooms", label: "Rooms & Beds", icon: "▤" },
  { id: "residents", label: "Residents", icon: "♙" },
  { id: "payments", label: "Rent & Payments", icon: "₹" },
  { id: "expenses", label: "Expenses", icon: "◉" },
  { id: "complaints", label: "Maintenance", icon: "⚒" },
  { id: "reports", label: "Reports", icon: "▥" },
];

const secondaryMenu = [
  { id: "notifications", label: "Notifications", icon: "♢" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getInitials(name = "PG Owner") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Avatar({ name, size = 40 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.max(11, size / 2.7) }}
    >
      {getInitials(name)}
    </div>
  );
}

function Badge({ type = "default", children }) {
  const className = String(type)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return <span className={`badge badge-${className}`}>{children}</span>;
}

function Field({
  label,
  name,
  value,
  defaultValue,
  placeholder,
  type = "text",
  required = false,
  onChange,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        type={type}
        required={required}
        onChange={onChange}
      />
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>Enter the details below.</p>
          </div>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        {trend && <span className="trend">{trend}</span>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

function PageHeader({ title, description, button, onClick }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {button && (
        <button className="primary-button" onClick={onClick}>
          {button}
        </button>
      )}
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⌘</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="primary-button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("rentok_token", data.token);
      localStorage.setItem("rentok_user", JSON.stringify(data.user));

      onLogin(data.user, data.token);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to RentOk backend. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Inter, Arial, sans-serif; background: #f4f7fb; color: #172033; }
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 25px;
          background:
            radial-gradient(circle at 10% 10%, rgba(37,99,235,.12), transparent 30%),
            radial-gradient(circle at 90% 90%, rgba(37,99,235,.09), transparent 30%),
            #f4f7fb;
        }
        .login-card {
          width: min(430px, 100%);
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 36px;
          box-shadow: 0 25px 70px rgba(15,23,42,.12);
        }
        .login-brand { display:flex; align-items:center; gap:12px; margin-bottom:30px; }
        .login-logo {
          width:46px; height:46px; border-radius:13px;
          display:grid; place-items:center;
          background:#2563eb; color:white; font-size:25px; font-weight:800;
        }
        .login-brand h1 { margin:0; font-size:24px; letter-spacing:-.6px; }
        .login-brand p { margin:3px 0 0; color:#64748b; font-size:11px; }
        .login-card h2 { margin:0 0 7px; font-size:24px; }
        .login-card > p { margin:0 0 25px; color:#64748b; font-size:13px; }
        .login-field { margin-bottom:16px; }
        .login-field label { display:block; font-size:12px; font-weight:700; margin-bottom:7px; color:#334155; }
        .login-field input {
          width:100%; padding:12px 13px; border:1px solid #dbe2ea;
          border-radius:9px; outline:0; font-size:13px;
        }
        .login-field input:focus { border-color:#8bb0fa; box-shadow:0 0 0 3px #edf4ff; }
        .login-error {
          padding:11px 12px; border-radius:8px; margin-bottom:15px;
          background:#fff0f0; color:#c53030; font-size:12px;
        }
        .login-button {
          width:100%; border:0; background:#2563eb; color:#fff;
          padding:13px; border-radius:9px; font-weight:700; cursor:pointer;
        }
        .login-button:disabled { opacity:.65; cursor:not-allowed; }
        .login-footer { margin-top:20px; text-align:center; font-size:11px; color:#94a3b8; }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">R</div>
            <div>
              <h1>RentOk</h1>
              <p>OWNER MANAGEMENT</p>
            </div>
          </div>

          <h2>Welcome back</h2>
          <p>Sign in to manage your PG properties.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            RentOk · PG Owner Management
          </div>
        </div>
      </div>
    </>
  );
}

function Dashboard({ residents, properties, expenses, complaints, navigate }) {
  const totalRooms = properties.reduce((sum, p) => sum + p.rooms, 0);
  const occupiedRooms = properties.reduce((sum, p) => sum + p.occupied, 0);
  const revenue = properties.reduce((sum, p) => sum + p.revenue, 0);
  const occupancy = totalRooms
    ? Math.round((occupiedRooms / totalRooms) * 100)
    : 0;

  const paidAmount = residents
    .filter((r) => r.paid)
    .reduce((sum, r) => sum + r.rent, 0);

  const pendingResidents = residents.filter((r) => !r.paid);

  return (
    <>
      <div className="welcome-row">
        <div>
          <h1>Good evening, Owner 👋</h1>
          <p>Here is what's happening across your PG properties today.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate("properties")}
        >
          + Add Property
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Properties"
          value={properties.length}
          subtitle="Active properties"
          icon="▣"
          trend="+1 this month"
        />
        <StatCard
          title="Total Residents"
          value={residents.length}
          subtitle="Currently staying"
          icon="♙"
        />
        <StatCard
          title="Monthly Revenue"
          value={money(revenue)}
          subtitle="Expected revenue"
          icon="₹"
          trend="+8.6%"
        />
        <StatCard
          title="Occupancy"
          value={`${occupancy}%`}
          subtitle={`${occupiedRooms} of ${totalRooms} rooms`}
          icon="%"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Revenue Overview</h2>
              <p>Monthly revenue performance</p>
            </div>
            <select className="select">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="chart">
            {[58, 66, 54, 72, 68, 79, 74, 83, 76, 88, 92, 97].map(
              (height, index) => (
                <div className="bar-wrap" key={index}>
                  <div className="bar" style={{ height: `${height}%` }} />
                  <span>
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][index]
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Occupancy</h2>
              <p>Across all properties</p>
            </div>
          </div>

          <div className="donut-area">
            <div className="donut">
              <div>
                <div>
                  <strong>{occupancy}%</strong>
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            <div className="legend">
              <div>
                <span className="dot occupied" />
                Occupied <b>{occupiedRooms}</b>
              </div>
              <div>
                <span className="dot available" />
                Available <b>{totalRooms - occupiedRooms}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid bottom">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent Residents</h2>
              <p>Latest resident activity</p>
            </div>
            <button
              className="text-button"
              onClick={() => navigate("residents")}
            >
              View all →
            </button>
          </div>

          {residents.slice(0, 4).map((resident) => (
            <div className="resident-row" key={resident.id}>
              <Avatar name={resident.name} size={38} />
              <div className="resident-info">
                <strong>{resident.name}</strong>
                <span>
                  {resident.room} · {resident.property}
                </span>
              </div>
              <Badge type={resident.paid ? "Paid" : "Pending"}>
                {resident.paid ? "Paid" : "Pending"}
              </Badge>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Pending Payments</h2>
              <p>{pendingResidents.length} residents pending</p>
            </div>
            <button
              className="text-button"
              onClick={() => navigate("payments")}
            >
              Manage →
            </button>
          </div>

          {pendingResidents.length === 0 ? (
            <EmptyState
              title="All payments cleared"
              description="There are no pending rent payments."
            />
          ) : (
            pendingResidents.slice(0, 4).map((resident) => (
              <div className="resident-row" key={resident.id}>
                <Avatar name={resident.name} size={38} />
                <div className="resident-info">
                  <strong>{resident.name}</strong>
                  <span>{resident.room}</span>
                </div>
                <strong>{money(resident.rent)}</strong>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="panel quick-panel">
        <div className="panel-head">
          <div>
            <h2>Quick Actions</h2>
            <p>Common owner tasks</p>
          </div>
        </div>

        <div className="quick-actions">
          {[
            ["＋", "Add Property", "Create PG property", "properties"],
            ["♙", "Add Resident", "Register resident", "residents"],
            ["₹", "Record Payment", "Record rent", "payments"],
            ["◉", "Add Expense", "Track expense", "expenses"],
            ["⚒", "Maintenance", "Manage issues", "complaints"],
            ["▥", "View Reports", "Business analytics", "reports"],
          ].map(([icon, title, subtitle, page]) => (
            <button
              className="quick-action"
              key={title}
              onClick={() => navigate(page)}
            >
              <span>{icon}</span>
              <b>{title}</b>
              <small>{subtitle}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Properties({ properties, setProperties, toast }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = properties.filter((property) =>
    `${property.name} ${property.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function addProperty(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const location = form.get("location");
    const roomsCount = Number(form.get("rooms") || 0);

    try {
      const data = await apiRequest("/properties", {
        method: "POST",
        body: JSON.stringify({
          name,
          location,
          rooms: roomsCount,
        }),
      });

      const property = data.property || data.data;

      if (property) {
        setProperties((prev) => [
          ...prev,
          {
            id: property.id || Date.now(),
            name: property.name || name,
            location: property.location || location,
            rooms: Number(property.rooms || property.total_rooms || roomsCount),
            occupied: Number(property.occupied || 0),
            revenue: Number(property.revenue || 0),
            status: property.status || "Active",
          },
        ]);
      } else {
        const refreshed = await apiRequest("/properties");
        const list = refreshed.properties || refreshed.data || [];
        setProperties(list.map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location || item.address || "",
          rooms: Number(item.rooms || item.total_rooms || 0),
          occupied: Number(item.occupied || 0),
          revenue: Number(item.revenue || 0),
          status: item.status || "Active",
        })));
      }

      setModal(false);
      toast("Property added successfully");
    } catch (error) {
      toast(error.message || "Unable to add property");
    }
  }

  return (
    <>
      <PageHeader
        title="Properties"
        description="Manage all your PG properties from one place."
        button="+ Add Property"
        onClick={() => setModal(true)}
      />

      <div className="toolbar">
        <div className="search-box wide">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
          />
        </div>

        <select className="select">
          <option>All properties</option>
          <option>Active</option>
        </select>
      </div>

      <div className="property-grid">
        {filtered.map((property) => {
          const occupancy = property.rooms
            ? Math.round((property.occupied / property.rooms) * 100)
            : 0;

          return (
            <div className="property-card" key={property.id}>
              <div className="property-cover">
                <div className="property-logo">R</div>
                <button className="more-button">•••</button>
              </div>

              <div className="property-body">
                <div className="property-title-row">
                  <div>
                    <h3>{property.name}</h3>
                    <p>⌖ {property.location}</p>
                  </div>
                  <Badge type="Active">Active</Badge>
                </div>

                <div className="property-stats">
                  <div>
                    <span>Rooms</span>
                    <strong>{property.rooms}</strong>
                  </div>
                  <div>
                    <span>Occupied</span>
                    <strong>{property.occupied}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>{money(property.revenue)}</strong>
                  </div>
                </div>

                <div className="progress-label">
                  <span>Occupancy</span>
                  <b>{occupancy}%</b>
                </div>

                <div className="progress">
                  <i style={{ width: `${occupancy}%` }} />
                </div>

                <button className="outline-button">Manage Property →</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title="Add New Property" onClose={() => setModal(false)}>
          <form onSubmit={addProperty}>
            <Field
              label="Property Name"
              name="name"
              placeholder="e.g. RentOk Residency"
              required
            />
            <Field
              label="Location"
              name="location"
              placeholder="e.g. Wakad, Pune"
              required
            />
            <Field
              label="Total Rooms"
              name="rooms"
              type="number"
              placeholder="40"
              required
            />

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Create Property</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Rooms() {
  const [search, setSearch] = useState("");
  const [roomList, setRoomList] = useState(rooms);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await apiRequest("/rooms");
        const list = data.rooms || data.data || [];
        if (list.length > 0) {
          setRoomList(list.map((room) => ({
            id: room.room_number || room.room || room.id,
            property: room.property_name || room.property || "—",
            type: room.type || room.room_type || "Room",
            beds: Number(room.capacity || room.beds || 0),
            occupied: Number(room.occupied || room.occupied_beds || 0),
            rent: Number(room.rent || room.monthly_rent || 0),
          })));
        }
      } catch (error) {
        console.error("Unable to load rooms:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  const filtered = roomList.filter((room) =>
    `${room.id} ${room.property} ${room.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Rooms & Beds"
        description="Track room occupancy, availability and bed allocation."
        button="+ Add Room"
      />

      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
          />
        </div>

        <select className="select">
          <option>All properties</option>
        </select>

        <select className="select">
          <option>All status</option>
          <option>Available</option>
          <option>Full</option>
        </select>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Property</th>
              <th>Type</th>
              <th>Beds</th>
              <th>Occupancy</th>
              <th>Monthly Rent</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((room) => {
              const full = room.occupied >= room.beds;

              return (
                <tr key={room.id}>
                  <td>
                    <strong>{room.id}</strong>
                  </td>
                  <td>{room.property}</td>
                  <td>{room.type}</td>
                  <td>{room.beds}</td>
                  <td>
                    <div className="mini-progress">
                      <i
                        style={{
                          width: `${(room.occupied / room.beds) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {room.occupied}/{room.beds}
                    </small>
                  </td>
                  <td>
                    <strong>{money(room.rent)}</strong>
                  </td>
                  <td>
                    <Badge type={full ? "Full" : "Available"}>
                      {full ? "Full" : "Available"}
                    </Badge>
                  </td>
                  <td>
                    <button className="more-button">•••</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Residents({ residents, setResidents, toast }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  const filtered = residents.filter((resident) =>
    `${resident.name} ${resident.room} ${resident.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function addResident(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const phone = form.get("phone");
    const room = form.get("room");
    const rent = Number(form.get("rent") || 0);

    try {
      const data = await apiRequest("/tenants", {
        method: "POST",
        body: JSON.stringify({
          name,
          phone,
          room,
          rent,
          monthly_rent: rent,
          property: "RentOk Residency",
        }),
      });

      const tenant = data.tenant || data.data;

      setResidents((prev) => [
        ...prev,
        {
          id: tenant?.id || Date.now(),
          name: tenant?.name || name,
          room: tenant?.room || tenant?.room_number || room,
          property: tenant?.property_name || tenant?.property || "RentOk Residency",
          phone: tenant?.phone || phone,
          rent: Number(tenant?.rent || tenant?.monthly_rent || rent),
          paid: tenant?.paid === true || tenant?.payment_status === "Paid",
          joined: tenant?.joined || tenant?.join_date || "30 Sep 2026",
        },
      ]);

      setModal(false);
      toast("Resident added successfully");
    } catch (error) {
      toast(error.message || "Unable to add resident");
    }
  }

  return (
    <>
      <PageHeader
        title="Residents"
        description="Manage residents, rooms, rent and resident records."
        button="+ Add Resident"
        onClick={() => setModal(true)}
      />

      <div className="toolbar">
        <div className="search-box wide">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search residents by name, room or phone..."
          />
        </div>

        <select className="select">
          <option>All properties</option>
        </select>

        <select className="select">
          <option>All residents</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Room</th>
              <th>Property</th>
              <th>Contact</th>
              <th>Monthly Rent</th>
              <th>Payment</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((resident) => (
              <tr key={resident.id}>
                <td>
                  <div className="table-person">
                    <Avatar name={resident.name} size={38} />
                    <strong>{resident.name}</strong>
                  </div>
                </td>
                <td>{resident.room}</td>
                <td>{resident.property}</td>
                <td>{resident.phone}</td>
                <td>
                  <strong>{money(resident.rent)}</strong>
                </td>
                <td>
                  <Badge type={resident.paid ? "Paid" : "Pending"}>
                    {resident.paid ? "Paid" : "Pending"}
                  </Badge>
                </td>
                <td>{resident.joined}</td>
                <td>
                  <button className="more-button">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Resident" onClose={() => setModal(false)}>
          <form onSubmit={addResident}>
            <Field
              label="Full Name"
              name="name"
              placeholder="Resident name"
              required
            />
            <Field
              label="Phone Number"
              name="phone"
              placeholder="+91 98765 43210"
              required
            />

            <div className="two-fields">
              <Field
                label="Room"
                name="room"
                placeholder="A-105"
                required
              />
              <Field
                label="Monthly Rent"
                name="rent"
                type="number"
                placeholder="12000"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Add Resident</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Payments({ residents, setResidents, toast }) {
  const pending = residents.filter((resident) => !resident.paid);

  const paidAmount = residents
    .filter((resident) => resident.paid)
    .reduce((sum, resident) => sum + resident.rent, 0);

  const pendingAmount = pending.reduce(
    (sum, resident) => sum + resident.rent,
    0
  );

  const total = paidAmount + pendingAmount;

  async function markPaid(id) {
    const resident = residents.find((item) => item.id === id);
    if (!resident) return;

    try {
      await apiRequest("/payments", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: resident.id,
          amount: Number(resident.rent || 0),
          payment_date: new Date().toISOString().slice(0, 10),
          status: "Paid",
        }),
      });

      setResidents((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, paid: true } : item
        )
      );

      toast("Payment marked as received");
    } catch (error) {
      toast(error.message || "Unable to record payment");
    }
  }

  return (
    <>
      <PageHeader
        title="Rent & Payments"
        description="Track monthly rent collections and pending payments."
        button="+ Record Payment"
      />

      <div className="stats-grid compact">
        <StatCard
          title="Collected"
          value={money(paidAmount)}
          subtitle="This month"
          icon="✓"
        />
        <StatCard
          title="Pending"
          value={money(pendingAmount)}
          subtitle={`${pending.length} residents`}
          icon="◷"
        />
        <StatCard
          title="Collection Rate"
          value={`${total ? Math.round((paidAmount / total) * 100) : 0}%`}
          subtitle="Current month"
          icon="%"
        />
        <StatCard
          title="Next Due"
          value="05 Oct"
          subtitle="Upcoming rent cycle"
          icon="⌂"
        />
      </div>

      <div className="table-panel">
        <div className="table-heading">
          <div>
            <h2>Rent Collection</h2>
            <p>September 2026</p>
          </div>
          <div className="search-box">
            <span>⌕</span>
            <input placeholder="Search resident..." />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Room</th>
              <th>Rent</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {residents.map((resident) => (
              <tr key={resident.id}>
                <td>
                  <div className="table-person">
                    <Avatar name={resident.name} size={36} />
                    <strong>{resident.name}</strong>
                  </div>
                </td>
                <td>{resident.room}</td>
                <td>
                  <strong>{money(resident.rent)}</strong>
                </td>
                <td>05 Sep 2026</td>
                <td>
                  <Badge type={resident.paid ? "Paid" : "Pending"}>
                    {resident.paid ? "Paid" : "Pending"}
                  </Badge>
                </td>
                <td>
                  {resident.paid ? (
                    <button className="outline-small">Receipt</button>
                  ) : (
                    <button
                      className="primary-small"
                      onClick={() => markPaid(resident.id)}
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Expenses({ expenses, setExpenses, toast }) {
  const [modal, setModal] = useState(false);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  async function addExpense(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const title = form.get("title");
    const category = form.get("category");
    const amount = Number(form.get("amount") || 0);

    try {
      const data = await apiRequest("/expenses", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          amount,
          property: "RentOk Residency",
          expense_date: new Date().toISOString().slice(0, 10),
        }),
      });

      const expense = data.expense || data.data;

      setExpenses((prev) => [
        {
          id: expense?.id || Date.now(),
          title: expense?.title || title,
          category: expense?.category || category,
          property: expense?.property_name || expense?.property || "RentOk Residency",
          amount: Number(expense?.amount || amount),
          date: expense?.date || expense?.expense_date || "30 Sep 2026",
        },
        ...prev,
      ]);

      setModal(false);
      toast("Expense recorded");
    } catch (error) {
      toast(error.message || "Unable to record expense");
    }
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Monitor property expenses and operating costs."
        button="+ Add Expense"
        onClick={() => setModal(true)}
      />

      <div className="stats-grid compact">
        <StatCard
          title="Total Expenses"
          value={money(total)}
          subtitle="This month"
          icon="◉"
        />
        <StatCard
          title="Utilities"
          value={money(28400)}
          subtitle="Electricity & water"
          icon="⌂"
        />
        <StatCard
          title="Maintenance"
          value={money(6500)}
          subtitle="Repairs"
          icon="⚒"
        />
        <StatCard
          title="Staff"
          value={money(18000)}
          subtitle="Payroll & housekeeping"
          icon="♙"
        />
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Expense</th>
              <th>Category</th>
              <th>Property</th>
              <th>Date</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>
                  <strong>{expense.title}</strong>
                </td>
                <td>
                  <Badge type="default">{expense.category}</Badge>
                </td>
                <td>{expense.property}</td>
                <td>{expense.date}</td>
                <td>
                  <strong>{money(expense.amount)}</strong>
                </td>
                <td>
                  <button className="more-button">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Expense" onClose={() => setModal(false)}>
          <form onSubmit={addExpense}>
            <Field
              label="Expense Title"
              name="title"
              placeholder="e.g. Electricity Bill"
              required
            />

            <div className="two-fields">
              <Field
                label="Category"
                name="category"
                placeholder="Utilities"
                required
              />
              <Field
                label="Amount"
                name="amount"
                type="number"
                placeholder="5000"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button">Save Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Complaints({ complaints, setComplaints, toast }) {
  function resolve(id) {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id
          ? { ...complaint, status: "Resolved" }
          : complaint
      )
    );

    toast("Complaint marked as resolved");
  }

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Track resident complaints, repairs and maintenance tasks."
        button="+ Create Complaint"
      />

      <div className="filter-cards">
        <div>
          <span>All Issues</span>
          <strong>{complaints.length}</strong>
        </div>
        <div>
          <span>Open</span>
          <strong>
            {complaints.filter((c) => c.status === "Open").length}
          </strong>
        </div>
        <div>
          <span>In Progress</span>
          <strong>
            {complaints.filter((c) => c.status === "In Progress").length}
          </strong>
        </div>
        <div>
          <span>Resolved</span>
          <strong>
            {complaints.filter((c) => c.status === "Resolved").length}
          </strong>
        </div>
      </div>

      <div className="issue-grid">
        {complaints.map((complaint) => (
          <div className="issue-card" key={complaint.id}>
            <div className="issue-card-top">
              <Badge type={complaint.priority}>{complaint.priority}</Badge>
              <Badge type={complaint.status}>{complaint.status}</Badge>
            </div>

            <h3>{complaint.title}</h3>
            <p>
              {complaint.resident} · Room {complaint.room}
            </p>

            <div className="issue-footer">
              <span>{complaint.date}</span>

              {complaint.status !== "Resolved" && (
                <button
                  className="primary-small"
                  onClick={() => resolve(complaint.id)}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Reports() {
  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        description="Understand occupancy, revenue and operating performance."
        button="Export Report"
      />

      <div className="report-grid">
        <div className="report-card">
          <span>Monthly Revenue</span>
          <strong>₹8.10L</strong>
          <small>+8.6% from last month</small>
        </div>

        <div className="report-card">
          <span>Monthly Expenses</span>
          <strong>₹52.9K</strong>
          <small>6.5% of revenue</small>
        </div>

        <div className="report-card">
          <span>Net Income</span>
          <strong>₹7.57L</strong>
          <small>Before taxes</small>
        </div>

        <div className="report-card">
          <span>Occupancy</span>
          <strong>85.7%</strong>
          <small>Across all properties</small>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Performance Summary</h2>
            <p>September 2026</p>
          </div>
        </div>

        <div className="report-bars">
          {[
            ["Rent Collection", 92],
            ["Occupancy", 86],
            ["Payment Timeliness", 78],
            ["Maintenance Resolution", 94],
            ["Resident Retention", 89],
          ].map(([label, value]) => (
            <div className="report-bar" key={label}>
              <div>
                <span>{label}</span>
                <b>{value}%</b>
              </div>

              <div className="progress">
                <i style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Notifications() {
  const [items, setItems] = useState(notifications);

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with important PG activity."
        button="Mark all read"
        onClick={markAllRead}
      />

      <div className="notification-list">
        {items.map((item) => (
          <div className="notification" key={item.id}>
            <div className="notification-icon">♢</div>

            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
              <small>{item.time}</small>
            </div>

            {item.unread && <span className="unread" />}
          </div>
        ))}
      </div>
    </>
  );
}

function Settings({ user, onLogout }) {
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your RentOk owner account and application preferences."
      />

      <div className="settings-layout">
        <aside className="settings-nav">
          <button className="active">Business Profile</button>
          <button>Account & Security</button>
          <button>Notifications</button>
          <button>Payment Settings</button>
        </aside>

        <section className="panel settings-panel">
          <h2>Business Profile</h2>
          <p className="section-description">
            Information used across your RentOk account.
          </p>

          <div className="profile-header">
            <Avatar name={user?.name || "PG Owner"} size={72} />

            <div>
              <h3>{user?.name || "PG Owner"}</h3>
              <p>PG Owner · RentOk</p>
              <button className="outline-small">Change photo</button>
            </div>
          </div>

          <div className="two-fields">
            <Field
              label="Owner Name"
              value={user?.name || ""}
              onChange={() => {}}
            />
            <Field label="Business Name" value="RentOk" onChange={() => {}} />
          </div>

          <div className="two-fields">
            <Field
              label="Email"
              value={user?.email || ""}
              onChange={() => {}}
            />
            <Field
              label="Phone"
              value="+91 98765 43210"
              onChange={() => {}}
            />
          </div>

          <div className="form-actions">
            <button
              className="primary-button"
              onClick={() => setSaved(true)}
            >
              Save Changes
            </button>

            {saved && <span className="saved-text">✓ Changes saved</span>}

            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("rentok_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("rentok_token")
  );

  const [authChecking, setAuthChecking] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [properties, setProperties] = useState(initialProperties);
  const [residents, setResidents] = useState(initialResidents);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("rentok_user", JSON.stringify(data.user));
        } else {
          throw new Error("Invalid session");
        }
      } catch {
        localStorage.removeItem("rentok_token");
        localStorage.removeItem("rentok_user");
        setToken(null);
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    }

    verifyToken();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    async function loadBackendData() {
      try {
        const [propertyData, tenantData, expenseData] = await Promise.all([
          apiRequest("/properties"),
          apiRequest("/tenants"),
          apiRequest("/expenses"),
        ]);

        const propertyList = propertyData.properties || propertyData.data || [];
        const tenantList = tenantData.tenants || tenantData.data || [];
        const expenseList = expenseData.expenses || expenseData.data || [];

        if (propertyList.length > 0) {
          setProperties(propertyList.map((item) => ({
            id: item.id,
            name: item.name,
            location: item.location || item.address || "",
            rooms: Number(item.rooms || item.total_rooms || 0),
            occupied: Number(item.occupied || item.occupied_beds || 0),
            revenue: Number(item.revenue || item.monthly_revenue || 0),
            status: item.status || "Active",
          })));
        }

        if (tenantList.length > 0) {
          setResidents(tenantList.map((item) => ({
            id: item.id,
            name: item.name,
            room: item.room || item.room_number || "—",
            property: item.property_name || item.property || "—",
            phone: item.phone || item.mobile || "—",
            rent: Number(item.rent || item.monthly_rent || 0),
            paid: item.paid === true || item.payment_status === "Paid",
            joined: item.joined || item.join_date || "—",
          })));
        }

        if (expenseList.length > 0) {
          setExpenses(expenseList.map((item) => ({
            id: item.id,
            title: item.title || item.description || "Expense",
            category: item.category || "General",
            property: item.property_name || item.property || "—",
            amount: Number(item.amount || 0),
            date: item.date || item.expense_date || "—",
          })));
        }
      } catch (error) {
        console.error("Unable to load backend data:", error);
      }
    }

    loadBackendData();
  }, [token]);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  function toast(message) {
    setToastMessage(message);
  }

  function handleLogin(loggedInUser, loggedInToken) {
    setUser(loggedInUser);
    setToken(loggedInToken);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("rentok_token");
    localStorage.removeItem("rentok_user");

    setToken(null);
    setUser(null);
    setPage("dashboard");
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setSidebarOpen(false);
  }

  const currentTitle = useMemo(() => {
    const allItems = [...menu, ...secondaryMenu];
    return allItems.find((item) => item.id === page)?.label || "Dashboard";
  }, [page]);

  function renderPage() {
    switch (page) {
      case "properties":
        return (
          <Properties
            properties={properties}
            setProperties={setProperties}
            toast={toast}
          />
        );

      case "rooms":
        return <Rooms />;

      case "residents":
        return (
          <Residents
            residents={residents}
            setResidents={setResidents}
            toast={toast}
          />
        );

      case "payments":
        return (
          <Payments
            residents={residents}
            setResidents={setResidents}
            toast={toast}
          />
        );

      case "expenses":
        return (
          <Expenses
            expenses={expenses}
            setExpenses={setExpenses}
            toast={toast}
          />
        );

      case "complaints":
        return (
          <Complaints
            complaints={complaints}
            setComplaints={setComplaints}
            toast={toast}
          />
        );

      case "reports":
        return <Reports />;

      case "notifications":
        return <Notifications />;

      case "settings":
        return <Settings user={user} onLogout={handleLogout} />;

      case "dashboard":
      default:
        return (
          <Dashboard
            residents={residents}
            properties={properties}
            expenses={expenses}
            complaints={complaints}
            navigate={navigate}
          />
        );
    }
  }

  if (authChecking) {
    return (
      <>
        <style>{`
          .auth-loading {
            min-height:100vh;
            display:grid;
            place-items:center;
            background:#f4f7fb;
            font-family:Inter,Arial,sans-serif;
            color:#475569;
          }
          .auth-loading-box {
            background:#fff;
            padding:30px 40px;
            border:1px solid #e2e8f0;
            border-radius:14px;
            box-shadow:0 15px 40px rgba(15,23,42,.08);
            text-align:center;
          }
          .auth-loading-logo {
            width:44px;
            height:44px;
            border-radius:12px;
            display:grid;
            place-items:center;
            background:#2563eb;
            color:white;
            font-size:23px;
            font-weight:800;
            margin:0 auto 15px;
          }
        `}</style>

        <div className="auth-loading">
          <div className="auth-loading-box">
            <div className="auth-loading-logo">R</div>
            <strong>Loading RentOk...</strong>
          </div>
        </div>
      </>
    );
  }

  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <style>{`
        :root {
          --primary:#2563eb;
          --primary-dark:#1d4ed8;
          --text:#172033;
          --muted:#64748b;
          --border:#e4e8ef;
          --surface:#fff;
          --green:#16845b;
          --shadow:0 3px 14px rgba(15,23,42,.045);
        }

        * { box-sizing:border-box; }

        body {
          margin:0;
          font-family:Inter,Arial,sans-serif;
          background:#f6f8fb;
          color:var(--text);
        }

        button,input,select {
          font-family:inherit;
        }

        button {
          cursor:pointer;
        }

        .app {
          min-height:100vh;
          display:flex;
        }

        .sidebar {
          width:258px;
          background:#101a2b;
          color:#dce4ef;
          position:fixed;
          left:0;
          top:0;
          bottom:0;
          z-index:50;
          padding:22px 14px;
          display:flex;
          flex-direction:column;
          overflow-y:auto;
        }

        .brand {
          display:flex;
          align-items:center;
          gap:12px;
          padding:5px 12px 28px;
        }

        .brand-mark {
          width:38px;
          height:38px;
          border-radius:11px;
          background:#2563eb;
          color:white;
          display:grid;
          place-items:center;
          font-weight:800;
          font-size:21px;
        }

        .brand h2 {
          margin:0;
          color:#fff;
          font-size:21px;
          letter-spacing:-.4px;
        }

        .brand span {
          font-size:10px;
          color:#8ea0b8;
          display:block;
          margin-top:2px;
        }

        .nav-label {
          font-size:10px;
          color:#718096;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:1px;
          padding:13px 13px 8px;
        }

        .nav-button {
          border:0;
          background:transparent;
          color:#9eabc0;
          width:100%;
          display:flex;
          align-items:center;
          gap:13px;
          padding:11px 13px;
          border-radius:9px;
          margin:2px 0;
          text-align:left;
          font-weight:500;
        }

        .nav-button:hover {
          background:#1a2639;
          color:#fff;
        }

        .nav-button.active {
          background:#2563eb;
          color:#fff;
          box-shadow:0 5px 14px rgba(37,99,235,.25);
        }

        .nav-icon {
          width:21px;
          text-align:center;
          font-size:17px;
        }

        .sidebar-bottom {
          margin-top:auto;
          border-top:1px solid #253247;
          padding-top:12px;
        }

        .owner-card {
          display:flex;
          align-items:center;
          gap:10px;
          padding:12px;
          margin-top:10px;
          background:#172235;
          border-radius:10px;
        }

        .owner-card strong {
          display:block;
          color:#fff;
          font-size:13px;
        }

        .owner-card small {
          color:#7f91aa;
          font-size:11px;
        }

        .avatar {
          flex:none;
          border-radius:50%;
          background:linear-gradient(135deg,#dbeafe,#bfdbfe);
          color:#1d4ed8;
          display:grid;
          place-items:center;
          font-weight:800;
        }

        .main {
          margin-left:258px;
          flex:1;
          min-width:0;
        }

        .topbar {
          height:72px;
          background:#fff;
          border-bottom:1px solid var(--border);
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 34px;
          position:sticky;
          top:0;
          z-index:30;
        }

        .mobile-menu {
          display:none;
          place-items:center;
          border:0;
          background:#f5f7fa;
          border-radius:8px;
          width:38px;
          height:38px;
          font-size:18px;
        }

        .breadcrumbs {
          font-size:13px;
          color:var(--muted);
        }

        .breadcrumbs strong {
          color:var(--text);
        }

        .top-actions {
          display:flex;
          align-items:center;
          gap:10px;
        }

        .top-icon {
          border:0;
          background:#f5f7fa;
          width:39px;
          height:39px;
          border-radius:9px;
          position:relative;
          font-size:16px;
          color:#475569;
        }

        .notification-dot {
          position:absolute;
          right:8px;
          top:7px;
          width:6px;
          height:6px;
          border-radius:50%;
          background:#ef4444;
        }

        .top-owner {
          display:flex;
          align-items:center;
          gap:9px;
          margin-left:8px;
          padding-left:14px;
          border-left:1px solid var(--border);
        }

        .top-owner strong {
          font-size:13px;
        }

        .top-owner small {
          display:block;
          color:var(--muted);
          font-size:11px;
        }

        .content {
          padding:30px 34px 50px;
          max-width:1600px;
          margin:auto;
        }

        .welcome-row,
        .page-header {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:20px;
          margin-bottom:25px;
        }

        h1 {
          font-size:27px;
          letter-spacing:-.7px;
          margin:0 0 6px;
        }

        h2 {
          font-size:17px;
          margin:0 0 4px;
          letter-spacing:-.2px;
        }

        h3 {
          margin:0;
        }

        p {
          margin:0;
          color:var(--muted);
          font-size:13px;
        }

        .primary-button {
          background:var(--primary);
          color:#fff;
          border:0;
          padding:11px 16px;
          border-radius:8px;
          font-weight:650;
          box-shadow:0 4px 10px rgba(37,99,235,.18);
        }

        .primary-button:hover {
          background:var(--primary-dark);
        }

        .outline-button {
          background:#fff;
          color:#334155;
          border:1px solid var(--border);
          padding:10px 14px;
          border-radius:8px;
          font-weight:600;
        }

        .outline-button:hover {
          background:#f8fafc;
        }

        .text-button {
          border:0;
          background:none;
          color:var(--primary);
          font-weight:650;
        }

        .primary-small,
        .outline-small {
          border-radius:7px;
          padding:7px 10px;
          font-size:12px;
          font-weight:650;
        }

        .primary-small {
          background:var(--primary);
          border:0;
          color:#fff;
        }

        .outline-small {
          background:#fff;
          border:1px solid var(--border);
          color:#334155;
        }

        .logout-button {
          border:1px solid #fecaca;
          background:#fff;
          color:#dc2626;
          border-radius:8px;
          padding:10px 14px;
          font-weight:650;
        }

        .stats-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:18px;
        }

        .stats-grid.compact {
          margin-bottom:20px;
        }

        .stat-card,
        .panel,
        .property-card,
        .issue-card,
        .report-card {
          background:var(--surface);
          border:1px solid var(--border);
          border-radius:12px;
          box-shadow:var(--shadow);
        }

        .stat-card {
          padding:19px;
        }

        .stat-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:15px;
        }

        .stat-icon {
          width:38px;
          height:38px;
          border-radius:9px;
          background:#eef4ff;
          color:var(--primary);
          display:grid;
          place-items:center;
          font-weight:700;
        }

        .trend {
          font-size:11px;
          color:var(--green);
          background:#eaf9f2;
          padding:5px 7px;
          border-radius:5px;
        }

        .stat-value {
          font-size:25px;
          font-weight:750;
          letter-spacing:-.7px;
        }

        .stat-title {
          font-size:13px;
          font-weight:600;
          margin-top:3px;
        }

        .stat-subtitle {
          font-size:11px;
          color:var(--muted);
          margin-top:5px;
        }

        .dashboard-grid {
          display:grid;
          grid-template-columns:1.7fr 1fr;
          gap:18px;
          margin-bottom:18px;
        }

        .dashboard-grid.bottom {
          grid-template-columns:1.25fr 1fr;
        }

        .panel {
          padding:21px;
        }

        .panel-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          margin-bottom:20px;
        }

        .select {
          border:1px solid var(--border);
          background:#fff;
          border-radius:7px;
          padding:9px 11px;
          color:#475569;
          font-size:12px;
        }

        .chart {
          height:225px;
          display:flex;
          align-items:flex-end;
          gap:13px;
          border-bottom:1px solid var(--border);
          padding:10px 4px 0;
        }

        .bar-wrap {
          height:100%;
          flex:1;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          align-items:center;
          gap:8px;
        }

        .bar {
          width:100%;
          max-width:27px;
          background:#3b82f6;
          border-radius:5px 5px 0 0;
          min-height:8px;
        }

        .bar-wrap span {
          font-size:10px;
          color:#94a3b8;
        }

        .donut-area {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:28px;
          padding:16px 0 22px;
        }

        .donut {
          width:155px;
          height:155px;
          border-radius:50%;
          background:conic-gradient(#2563eb 0 86%,#e9edf3 86%);
          display:grid;
          place-items:center;
        }

        .donut > div {
          width:108px;
          height:108px;
          background:#fff;
          border-radius:50%;
          display:grid;
          place-items:center;
          text-align:center;
        }

        .donut strong {
          font-size:25px;
          display:block;
        }

        .donut span {
          font-size:10px;
          color:var(--muted);
        }

        .legend {
          font-size:12px;
          line-height:2.5;
        }

        .legend div {
          display:flex;
          align-items:center;
          gap:8px;
          min-width:130px;
        }

        .legend b {
          margin-left:auto;
        }

        .dot {
          width:8px;
          height:8px;
          border-radius:50%;
          display:inline-block;
        }

        .dot.occupied {
          background:#2563eb;
        }

        .dot.available {
          background:#dce2ea;
        }

        .resident-row {
          display:flex;
          align-items:center;
          gap:12px;
          padding:11px 0;
          border-bottom:1px solid #edf0f4;
        }

        .resident-row:last-child {
          border-bottom:0;
        }

        .resident-info {
          flex:1;
          min-width:0;
        }

        .resident-info strong {
          display:block;
          font-size:13px;
        }

        .resident-info span {
          display:block;
          color:var(--muted);
          font-size:11px;
          margin-top:3px;
        }

        .badge {
          font-size:10px;
          font-weight:700;
          padding:5px 8px;
          border-radius:5px;
          white-space:nowrap;
          background:#f0f2f5;
          color:#64748b;
        }

        .badge-paid,
        .badge-active,
        .badge-resolved,
        .badge-available {
          background:#eaf9f2;
          color:#14845a;
        }

        .badge-pending,
        .badge-open,
        .badge-high {
          background:#fff0f0;
          color:#d43b40;
        }

        .badge-in-progress,
        .badge-medium {
          background:#fff6e8;
          color:#c47712;
        }

        .badge-low {
          background:#edf4ff;
          color:#2563eb;
        }

        .quick-panel {
          margin-top:18px;
        }

        .quick-actions {
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:10px;
        }

        .quick-action {
          background:#f8fafc;
          border:1px solid var(--border);
          border-radius:9px;
          text-align:left;
          padding:14px;
          transition:.15s;
        }

        .quick-action:hover {
          border-color:#b9cef9;
          background:#f4f7ff;
          transform:translateY(-1px);
        }

        .quick-action span {
          font-size:20px;
          color:var(--primary);
          display:block;
          margin-bottom:12px;
        }

        .quick-action b {
          font-size:12px;
          display:block;
        }

        .quick-action small {
          color:var(--muted);
          font-size:10px;
        }

        .toolbar {
          display:flex;
          gap:10px;
          margin-bottom:18px;
        }

        .search-box {
          display:flex;
          align-items:center;
          gap:8px;
          background:#fff;
          border:1px solid var(--border);
          border-radius:8px;
          padding:0 11px;
          min-width:230px;
        }

        .search-box.wide {
          flex:1;
        }

        .search-box span {
          color:#94a3b8;
          font-size:18px;
        }

        .search-box input {
          border:0;
          outline:0;
          padding:10px 2px;
          width:100%;
          font-size:12px;
        }

        .property-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:18px;
        }

        .property-card {
          overflow:hidden;
        }

        .property-cover {
          height:112px;
          background:linear-gradient(125deg,#172b4d,#2f6ee5);
          padding:16px;
          display:flex;
          justify-content:space-between;
        }

        .property-logo {
          width:46px;
          height:46px;
          border-radius:12px;
          background:rgba(255,255,255,.15);
          display:grid;
          place-items:center;
          color:white;
          font-size:22px;
          font-weight:800;
          border:1px solid rgba(255,255,255,.2);
        }

        .more-button {
          border:0;
          background:transparent;
          color:#64748b;
          padding:5px;
        }

        .property-cover .more-button {
          color:#fff;
        }

        .property-body {
          padding:17px;
        }

        .property-title-row {
          display:flex;
          justify-content:space-between;
          gap:10px;
        }

        .property-title-row h3 {
          font-size:15px;
        }

        .property-title-row p {
          font-size:11px;
          margin-top:4px;
        }

        .property-stats {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          border-top:1px solid var(--border);
          border-bottom:1px solid var(--border);
          margin:17px 0;
          padding:12px 0;
        }

        .property-stats span {
          display:block;
          color:var(--muted);
          font-size:10px;
        }

        .property-stats strong {
          font-size:12px;
          margin-top:4px;
          display:block;
        }

        .progress-label {
          display:flex;
          justify-content:space-between;
          font-size:11px;
          margin-bottom:7px;
        }

        .progress {
          height:6px;
          background:#edf0f4;
          border-radius:10px;
          overflow:hidden;
        }

        .progress i {
          height:100%;
          display:block;
          background:#2563eb;
          border-radius:10px;
        }

        .property-body > .outline-button {
          width:100%;
          margin-top:15px;
        }

        .table-panel {
          background:#fff;
          border:1px solid var(--border);
          border-radius:12px;
          box-shadow:var(--shadow);
          overflow:auto;
        }

        .table-heading {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:20px;
          border-bottom:1px solid var(--border);
        }

        .table-heading h2 {
          margin:0;
        }

        .table-heading p {
          margin-top:3px;
        }

        table {
          width:100%;
          border-collapse:collapse;
          min-width:750px;
        }

        th {
          text-align:left;
          background:#fafbfc;
          color:#8490a3;
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:.5px;
          padding:12px 17px;
          font-weight:700;
        }

        td {
          padding:13px 17px;
          border-top:1px solid #edf0f4;
          font-size:12px;
          color:#475569;
        }

        td strong {
          color:#1e293b;
        }

        .table-person {
          display:flex;
          align-items:center;
          gap:10px;
        }

        .mini-progress {
          width:65px;
          height:5px;
          background:#edf0f4;
          border-radius:5px;
          display:inline-block;
          overflow:hidden;
          margin-right:6px;
        }

        .mini-progress i {
          display:block;
          height:100%;
          background:#2563eb;
        }

        td small {
          color:#94a3b8;
        }

        .field {
          display:block;
          margin-bottom:15px;
        }

        .field > span {
          display:block;
          font-size:11px;
          font-weight:650;
          margin-bottom:7px;
          color:#475569;
        }

        .field input {
          width:100%;
          border:1px solid var(--border);
          border-radius:8px;
          padding:11px 12px;
          outline:0;
          font-size:13px;
          background:#fff;
        }

        .field input:focus {
          border-color:#8bb0fa;
          box-shadow:0 0 0 3px #edf4ff;
        }

        .two-fields {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }

        .form-actions {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:9px;
          margin-top:20px;
          padding-top:18px;
          border-top:1px solid var(--border);
        }

        .modal-backdrop {
          position:fixed;
          inset:0;
          background:rgba(15,23,42,.48);
          z-index:100;
          display:grid;
          place-items:center;
          padding:20px;
        }

        .modal {
          width:min(500px,100%);
          background:#fff;
          border-radius:14px;
          padding:23px;
          box-shadow:0 25px 80px rgba(15,23,42,.25);
        }

        .modal-head {
          display:flex;
          justify-content:space-between;
          margin-bottom:22px;
        }

        .modal-head h2 {
          font-size:19px;
        }

        .modal-head p {
          margin-top:4px;
        }

        .icon-button {
          border:0;
          background:#f3f5f8;
          border-radius:7px;
          width:32px;
          height:32px;
          font-size:20px;
          color:#64748b;
        }

        .filter-cards {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
          margin-bottom:18px;
        }

        .filter-cards div {
          background:#fff;
          border:1px solid var(--border);
          border-radius:10px;
          padding:15px;
        }

        .filter-cards span {
          display:block;
          color:var(--muted);
          font-size:11px;
        }

        .filter-cards strong {
          display:block;
          font-size:22px;
          margin-top:6px;
        }

        .issue-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:16px;
        }

        .issue-card {
          padding:18px;
        }

        .issue-card-top {
          display:flex;
          justify-content:space-between;
          margin-bottom:18px;
        }

        .issue-card h3 {
          font-size:15px;
        }

        .issue-card p {
          margin-top:5px;
        }

        .issue-footer {
          display:flex;
          align-items:center;
          justify-content:space-between;
          margin-top:22px;
          padding-top:13px;
          border-top:1px solid var(--border);
          font-size:10px;
          color:var(--muted);
        }

        .report-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:18px;
        }

        .report-card {
          padding:20px;
        }

        .report-card span {
          display:block;
          font-size:11px;
          color:var(--muted);
        }

        .report-card strong {
          display:block;
          font-size:25px;
          margin:8px 0 4px;
        }

        .report-card small {
          color:#16a36a;
          font-size:10px;
        }

        .report-bars {
          display:grid;
          gap:20px;
        }

        .report-bar > div:first-child {
          display:flex;
          justify-content:space-between;
          font-size:12px;
          margin-bottom:7px;
        }

        .report-bar b {
          color:var(--primary);
        }

        .settings-layout {
          display:grid;
          grid-template-columns:220px 1fr;
          gap:18px;
        }

        .settings-nav {
          background:#fff;
          border:1px solid var(--border);
          border-radius:12px;
          padding:8px;
          height:max-content;
        }

        .settings-nav button {
          display:block;
          width:100%;
          text-align:left;
          border:0;
          background:transparent;
          padding:11px;
          border-radius:7px;
          font-size:12px;
          color:#64748b;
        }

        .settings-nav button.active {
          background:#edf4ff;
          color:#2563eb;
          font-weight:700;
        }

        .settings-panel {
          max-width:850px;
        }

        .section-description {
          margin:5px 0 25px;
        }

        .profile-header {
          display:flex;
          align-items:center;
          gap:15px;
          padding-bottom:20px;
          border-bottom:1px solid var(--border);
          margin-bottom:20px;
        }

        .profile-header h3 {
          font-size:16px;
        }

        .profile-header p {
          margin:3px 0 8px;
        }

        .saved-text {
          font-size:12px;
          color:#16a36a;
          margin-right:auto;
        }

        .notification-list {
          background:#fff;
          border:1px solid var(--border);
          border-radius:12px;
          overflow:hidden;
        }

        .notification {
          padding:17px;
          display:flex;
          gap:13px;
          align-items:flex-start;
          border-bottom:1px solid var(--border);
          position:relative;
        }

        .notification:last-child {
          border:0;
        }

        .notification-icon {
          width:38px;
          height:38px;
          border-radius:9px;
          background:#edf4ff;
          color:#2563eb;
          display:grid;
          place-items:center;
        }

        .notification strong {
          font-size:13px;
        }

        .notification p {
          margin:3px 0;
        }

        .notification small {
          font-size:10px;
          color:#94a3b8;
        }

        .unread {
          width:7px;
          height:7px;
          background:#2563eb;
          border-radius:50%;
          margin-left:auto;
          margin-top:5px;
        }

        .empty-state {
          background:#fff;
          border:1px dashed #d6dce5;
          border-radius:12px;
          text-align:center;
          padding:45px 20px;
        }

        .empty-icon {
          width:55px;
          height:55px;
          border-radius:50%;
          background:#edf4ff;
          color:#2563eb;
          display:grid;
          place-items:center;
          margin:auto;
          font-size:25px;
        }

        .empty-state h3 {
          margin:15px 0 6px;
        }

        .empty-state p {
          max-width:400px;
          margin:auto;
        }

        .empty-state .primary-button {
          margin-top:18px;
        }

        .toast {
          position:fixed;
          right:25px;
          bottom:25px;
          background:#172033;
          color:#fff;
          padding:12px 16px;
          border-radius:9px;
          box-shadow:0 12px 30px rgba(0,0,0,.2);
          font-size:12px;
          z-index:200;
        }

        @media(max-width:1100px) {
          .stats-grid {
            grid-template-columns:repeat(2,1fr);
          }

          .property-grid {
            grid-template-columns:repeat(2,1fr);
          }

          .quick-actions {
            grid-template-columns:repeat(3,1fr);
          }

          .issue-grid {
            grid-template-columns:repeat(2,1fr);
          }

          .report-grid {
            grid-template-columns:repeat(2,1fr);
          }
        }

        @media(max-width:850px) {
          .sidebar {
            transform:translateX(-100%);
            transition:.2s;
          }

          .sidebar.open {
            transform:translateX(0);
          }

          .main {
            margin-left:0;
          }

          .mobile-menu {
            display:grid;
          }

          .topbar {
            padding:0 18px;
          }

          .content {
            padding:22px 18px;
          }

          .top-owner {
            display:none;
          }

          .dashboard-grid,
          .dashboard-grid.bottom {
            grid-template-columns:1fr;
          }

          .settings-layout {
            grid-template-columns:1fr;
          }

          .settings-nav {
            display:flex;
            overflow:auto;
          }

          .settings-nav button {
            white-space:nowrap;
          }
        }

        @media(max-width:600px) {
          .stats-grid,
          .filter-cards,
          .property-grid,
          .issue-grid,
          .report-grid {
            grid-template-columns:1fr;
          }

          .welcome-row,
          .page-header {
            align-items:flex-start;
          }

          .chart {
            gap:5px;
          }

          .donut-area {
            flex-direction:column;
          }

          .toolbar {
            flex-wrap:wrap;
          }

          .search-box {
            flex:1;
            min-width:170px;
          }

          .two-fields {
            grid-template-columns:1fr;
          }

          .quick-actions {
            grid-template-columns:repeat(2,1fr);
          }

          .content {
            padding:18px 12px;
          }

          .topbar {
            padding:0 12px;
          }

          .page-header h1 {
            font-size:23px;
          }

          .form-actions {
            flex-wrap:wrap;
          }
        }
      `}</style>

      <div className="app">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="brand-mark">R</div>

            <div>
              <h2>RentOk</h2>
              <span>OWNER MANAGEMENT</span>
            </div>
          </div>

          <div className="nav-label">Workspace</div>

          {menu.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-label">Account</div>

          {secondaryMenu.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${
                page === item.id ? "active" : ""
              }`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}

              {item.id === "notifications" && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "2px 6px",
                    fontSize: "9px",
                  }}
                >
                  4
                </span>
              )}
            </button>
          ))}

          <div className="sidebar-bottom">
            <div className="owner-card">
              <Avatar name={user?.name || "PG Owner"} size={35} />

              <div style={{ minWidth: 0 }}>
                <strong>{user?.name || "PG Owner"}</strong>
                <small>PG Owner</small>
              </div>
            </div>

            <button
              className="nav-button"
              onClick={handleLogout}
              style={{ marginTop: "6px", color: "#fca5a5" }}
            >
              <span className="nav-icon">↪</span>
              Logout
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                className="mobile-menu"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>

              <div className="breadcrumbs">
                RentOk
                <span style={{ margin: "0 6px" }}>/</span>
                <strong>{currentTitle}</strong>
              </div>
            </div>

            <div className="top-actions">
              <button
                className="top-icon"
                onClick={() => navigate("notifications")}
              >
                ♢
                <span className="notification-dot" />
              </button>

              <button className="top-icon">?</button>

              <div className="top-owner">
                <Avatar name={user?.name || "PG Owner"} size={34} />

                <div>
                  <strong>{user?.name || "PG Owner"}</strong>
                  <small>Owner</small>
                </div>
              </div>
            </div>
          </header>

          <div className="content">
            {page === "dashboard" ? (
              <Dashboard
                residents={residents}
                properties={properties}
                expenses={expenses}
                complaints={complaints}
                navigate={navigate}
              />
            ) : (
              renderPage()
            )}
          </div>
        </main>

        {toastMessage && <div className="toast">✓ {toastMessage}</div>}
      </div>
    </>
  );
}