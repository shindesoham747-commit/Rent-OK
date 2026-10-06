import { useState } from "react";

function PGManagement() {
  const [showForm, setShowForm] = useState(false);

  const [properties, setProperties] = useState([
    {
      id: 1,
      name: "RentOk Residency",
      location: "Pune, Maharashtra",
      floors: 4,
      beds: 36,
      occupied: 31,
      status: "Active",
    },
    {
      id: 2,
      name: "Green View PG",
      location: "Pimpri, Maharashtra",
      floors: 3,
      beds: 28,
      occupied: 23,
      status: "Active",
    },
    {
      id: 3,
      name: "City Stay PG",
      location: "Wakad, Maharashtra",
      floors: 2,
      beds: 22,
      occupied: 18,
      status: "Active",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    location: "",
    floors: "",
    beds: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addProperty = (e) => {
    e.preventDefault();

    if (!form.name || !form.location || !form.floors || !form.beds) {
      alert("Please fill all fields.");
      return;
    }

    const newProperty = {
      id: Date.now(),
      name: form.name,
      location: form.location,
      floors: Number(form.floors),
      beds: Number(form.beds),
      occupied: 0,
      status: "Active",
    };

    setProperties([...properties, newProperty]);

    setForm({
      name: "",
      location: "",
      floors: "",
      beds: "",
    });

    setShowForm(false);
  };

  return (
    <section className="pg-management">
      <div className="page-heading">
        <div>
          <h2>PG Properties</h2>
          <p>Manage all your PG properties from one place.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          + Add New PG
        </button>
      </div>

      <div className="property-summary">
        <div>
          <span>Total Properties</span>
          <strong>{properties.length}</strong>
        </div>

        <div>
          <span>Total Beds</span>
          <strong>
            {properties.reduce((sum, property) => sum + property.beds, 0)}
          </strong>
        </div>

        <div>
          <span>Occupied Beds</span>
          <strong>
            {properties.reduce(
              (sum, property) => sum + property.occupied,
              0
            )}
          </strong>
        </div>

        <div>
          <span>Available Beds</span>
          <strong>
            {properties.reduce(
              (sum, property) =>
                sum + (property.beds - property.occupied),
              0
            )}
          </strong>
        </div>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <div className="form-header">
              <div>
                <h3>Add New PG</h3>
                <p>Enter your PG property details.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={addProperty}>
              <label>PG Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sunrise PG"
              />

              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Hinjewadi, Pune"
              />

              <div className="form-row">
                <div>
                  <label>Number of Floors</label>
                  <input
                    type="number"
                    name="floors"
                    value={form.floors}
                    onChange={handleChange}
                    placeholder="4"
                  />
                </div>

                <div>
                  <label>Total Beds</label>
                  <input
                    type="number"
                    name="beds"
                    value={form.beds}
                    onChange={handleChange}
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Add PG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="property-grid">
        {properties.map((property) => {
          const occupancy = Math.round(
            (property.occupied / property.beds) * 100
          );

          return (
            <div className="property-card" key={property.id}>
              <div className="property-top">
                <div className="property-icon">⌂</div>

                <span className="status-badge">
                  {property.status}
                </span>
              </div>

              <h3>{property.name}</h3>

              <p className="location">📍 {property.location}</p>

              <div className="property-details">
                <div>
                  <span>Floors</span>
                  <strong>{property.floors}</strong>
                </div>

                <div>
                  <span>Total Beds</span>
                  <strong>{property.beds}</strong>
                </div>

                <div>
                  <span>Occupied</span>
                  <strong>{property.occupied}</strong>
                </div>
              </div>

              <div className="occupancy-bar">
                <div
                  style={{ width: `${occupancy}%` }}
                ></div>
              </div>

              <div className="occupancy-label">
                <span>Occupancy</span>
                <strong>{occupancy}%</strong>
              </div>

              <button className="view-property">
                Manage Property →
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PGManagement;