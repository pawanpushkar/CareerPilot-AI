import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Search,
  Plus,
  MapPin,
  Clock,
  ArrowUpRight,
  Sparkles,
  LayoutDashboard,
  Settings,
  Bell,
  X,
} from "lucide-react";
import ResumeAnalyzer from "./ResumeAnalyzer";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUSES = [
  "Wishlist",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load applications from PostgreSQL through the backend.
  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/applications`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load applications.");
      }

      const formattedJobs = data.applications.map((application) => ({
        id: application.id,
        company: application.company,
        role: application.role,
        location: application.location || "",
        date: application.applied_date
          ? new Date(
              `${String(application.applied_date).slice(0, 10)}T12:00:00`
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        status: application.status || "Applied",
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Loading applications failed:", err);
      setError(
        "Could not load applications. Make sure the backend and database are running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Add a new application to PostgreSQL.
  async function addJob(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const newApplication = {
      company: String(form.get("company") || "").trim(),
      role: String(form.get("role") || "").trim(),
      location: String(form.get("location") || "").trim(),
      status: String(form.get("status") || "Applied"),
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApplication),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save application.");
      }

      const application = data.application;

      const savedJob = {
        id: application.id,
        company: application.company,
        role: application.role,
        location: application.location || "",
        date: application.applied_date
          ? new Date(
              `${String(application.applied_date).slice(0, 10)}T12:00:00`
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        status: application.status || "Applied",
      };

setJobs((previous) => [savedJob, ...previous]);
setShowModal(false);
setSuccess("Application saved successfully!");
    } catch (err) {
      console.error("Saving application failed:", err);
      setError(err.message || "Could not save application.");
    } finally {
      setSaving(false);
    }
  }

  // Update the status in PostgreSQL.
  async function updateStatus(id, newStatus) {
    const previousJobs = jobs;
    const selectedJob = jobs.find((job) => job.id === id);

    if (!selectedJob || selectedJob.status === newStatus) {
      return;
    }

    // Update the screen immediately.
    setJobs((previous) =>
      previous.map((job) =>
        job.id === id ? { ...job, status: newStatus } : job
      )
    );

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update status.");
      }

      setSuccess("Application status updated!");
    } catch (err) {
      console.error("Updating status failed:", err);

      // Restore the previous screen state if the update fails.
      setJobs(previousJobs);
      setError(
        err.message || "Could not update status. Please try again."
      );
    }
  }

  // Delete an application from PostgreSQL.
  async function deleteJob(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete application.");
      }

      setJobs((previous) => previous.filter((job) => job.id !== id));
      setSuccess("Application deleted successfully!");
    } catch (err) {
      console.error("Deleting application failed:", err);
      setError(err.message || "Could not delete application.");
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const searchText =
      `${job.company} ${job.role} ${job.location}`.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const displayedJobs = filteredJobs.filter((job) => {
    if (activePage === "Interviews") {
      return job.status === "Interview";
    }

    return true;
  });

  const interviews = jobs.filter(
    (job) => job.status === "Interview"
  ).length;

  const offers = jobs.filter(
    (job) => job.status === "Offer"
  ).length;

  const rejected = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;
  const statusCounts = STATUSES.map((status) => ({
  name: status,
  value: jobs.filter((job) => job.status === status).length,
})).filter((item) => item.value > 0);

const interviewRate =
  jobs.length > 0
    ? Math.round((interviews / jobs.length) * 100)
    : 0;

const offerRate =
  jobs.length > 0
    ? Math.round((offers / jobs.length) * 100)
    : 0;

const chartColors = [
  "#8b5cf6",
  "#3b82f6",
  "#f59e0b",
  "#06b6d4",
  "#22c55e",
  "#ef4444",
  "#94a3b8",
];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Sparkles size={25} />
          <span>CareerPilot AI</span>
        </div>

        <p className="workspace-label">WORKSPACE</p>

        <button
          className={`nav-item ${
            activePage === "Overview" ? "active" : ""
          }`}
          onClick={() => setActivePage("Overview")}
        >
          <LayoutDashboard size={19} />
          Overview
        </button>

        <button
          className={`nav-item ${
            activePage === "Applications" ? "active" : ""
          }`}
          onClick={() => setActivePage("Applications")}
        >
          <BriefcaseBusiness size={19} />
          Applications
        </button>

        <button
          className={`nav-item ${
            activePage === "Interviews" ? "active" : ""
          }`}
          onClick={() => setActivePage("Interviews")}
        >
          <CalendarDays size={19} />
          Interviews
        </button>

        <button
          className={`nav-item ${
            activePage === "Analytics" ? "active" : ""
          }`}
          onClick={() => setActivePage("Analytics")}
        >
          <ChartNoAxesCombined size={19} />
          Analytics
        </button>

        <button
  className={`nav-item ${
    activePage === "Resume Analyzer" ? "active" : ""
  }`}
  onClick={() => setActivePage("Resume Analyzer")}
>
  <Sparkles size={19} />
  Resume Analyzer
</button>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              activePage === "Settings" ? "active" : ""
            }`}
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="profile">
            <div className="avatar">PP</div>
            <div>
              <strong>Pawan Pushkar</strong>
              <p>Job Seeker</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span>Workspace / </span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <Bell size={20} />
            <div className="avatar">PP</div>
          </div>
        </header>

          <div className="page-container">
          {activePage === "Resume Analyzer" ? (
  <ResumeAnalyzer />
) : activePage === "Analytics" ? (
  <div className="analytics-page">
    <section className="welcome-section">
      <div>
        <p className="eyebrow">
          <ChartNoAxesCombined size={15} /> CAREER INSIGHTS
        </p>
        <h1>Application Analytics</h1>
        <p className="welcome-subtitle">
          Understand your job search progress.
        </p>
      </div>
    </section>

    <section className="stats-grid">
      <StatCard
        title="Total Applications"
        value={jobs.length}
        icon={BriefcaseBusiness}
      />
      <StatCard
        title="Interviews"
        value={interviews}
        icon={CalendarDays}
      />
      <StatCard
        title="Offers Received"
        value={offers}
        icon={ChartNoAxesCombined}
      />
      <StatCard
        title="Rejections"
        value={rejected}
        icon={ArrowUpRight}
      />
    </section>

    <section className="analytics-grid">
      <article className="panel analytics-card">
        <h2>Application Status</h2>
        <p>Distribution of your job applications.</p>

        {jobs.length === 0 ? (
          <p>Add applications to see your analytics.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {statusCounts.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      chartColors[
                        STATUSES.indexOf(entry.name) % chartColors.length
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </article>

      <article className="panel analytics-card">
        <h2>Applications by Status</h2>
        <p>Compare your application progress.</p>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusCounts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Applications"
              fill="#7c5ce7"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>

    <section className="stats-grid analytics-rates">
      <StatCard
        title="Interview Rate"
        value={`${interviewRate}%`}
        icon={CalendarDays}
      />
      <StatCard
        title="Offer Rate"
        value={`${offerRate}%`}
        icon={ChartNoAxesCombined}
      />
    </section>
  </div>
) : (
  <> 
          <section className="welcome-section">
            <div>
              <p className="eyebrow">
                <Sparkles size={15} /> YOUR CAREER JOURNEY
              </p>

              <h1>Welcome back, Pawan ✦</h1>

              <p className="welcome-subtitle">
                Keep moving forward. Your next opportunity is out there.
              </p>
            </div>

            <button
              className="primary-btn"
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} />
              Add application
            </button>
          </section>

          {error && (
            <div
              role="alert"
              style={{
                color: "#b42318",
                background: "#fef3f2",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                color: "#067647",
                background: "#ecfdf3",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              {success}
            </div>
          )}

          <section className="stats-grid">
            <StatCard
              title="Total Applications"
              value={jobs.length}
              icon={BriefcaseBusiness}
            />

            <StatCard
              title="Interviews"
              value={interviews}
              icon={CalendarDays}
            />

            <StatCard
              title="Offers Received"
              value={offers}
              icon={ChartNoAxesCombined}
            />

            <StatCard
              title="Rejections"
              value={rejected}
              icon={ArrowUpRight}
            />
          </section>

          <section className="panel jobs-panel">
            <div className="panel-header">
              <div>
                <h2>
                  {activePage === "Overview"
                    ? "Recent applications"
                    : activePage}
                </h2>

                <p>Track your job search in one place.</p>
              </div>
            </div>

            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />

                <input
                  placeholder="Search companies or roles..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <button
                className="secondary-btn"
                onClick={() => setShowModal(true)}
              >
                <Plus size={17} />
                Add
              </button>
            </div>

            <div className="table-scroll">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>COMPANY & ROLE</th>
                    <th>LOCATION</th>
                    <th>APPLIED DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5">Loading applications...</td>
                    </tr>
                  ) : displayedJobs.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        {activePage === "Interviews"
                          ? "No interviews scheduled yet."
                          : "No applications found. Add your first application!"}
                      </td>
                    </tr>
                  ) : (
                    displayedJobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div className="company-cell">
                            <div className="company-logo">
                              {job.company.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <strong>{job.company}</strong>
                              <span>{job.role}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="location-cell">
                            <MapPin size={15} />
                            {job.location || "Not specified"}
                          </div>
                        </td>

                        <td>
                          <div className="date-cell">
                            <Clock size={15} />
                            {job.date || "—"}
                          </div>
                        </td>

                        <td>
                          <select
                            className="status-select"
                            value={job.status}
                            onChange={(event) =>
                              updateStatus(job.id, event.target.value)
                            }
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => deleteJob(job.id)}
                            aria-label={`Delete ${job.company} application`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </section>
          </>
        )}
      </div>
      </main>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Add job application</h2>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addJob}>
              <label>
                Company name
                <input
                  name="company"
                  required
                  maxLength={150}
                  placeholder="e.g. Atlassian"
                />
              </label>

              <label>
                Job title
                <input
                  name="role"
                  required
                  maxLength={150}
                  placeholder="e.g. Junior Software Engineer"
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  maxLength={150}
                  placeholder="e.g. Sydney, Australia"
                />
              </label>

              <label>
                Status
                <select name="status" defaultValue="Applied">
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                <Plus size={17} />
                {saving ? "Saving..." : "Save application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={21} />
        </span>
      </div>

      <p className="stat-title">{title}</p>
      <div className="stat-value">{value}</div>
    </article>
  );
}

export default App;