
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

const API_URL = "http://localhost:5000/api/clubs";
const EVENT_API_URL = "http://localhost:5000/api/events";
const EVENT_REGISTRATION_API_URL =
  "http://localhost:5000/api/event-registrations";

function App() {
  const [role, setRole] = useState("student");
  const [activePage, setActivePage] = useState("clubs");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [registered, setRegistered] = useState([]);
  const [requests, setRequests] = useState([]);

  // Quản lý sự kiện
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState("");
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Trạng thái giao diện quản lý sự kiện
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedManageEvent, setSelectedManageEvent] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    club: "",
    location: "",
    startDate: "",
    endDate: "",
    capacity: 100,
  });

  // Dữ liệu câu lạc bộ lấy từ MongoDB
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Gọi API khi mở website
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể tải câu lạc bộ");
        }

        setClubs(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Tự động tải danh sách sự kiện từ MongoDB
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(EVENT_API_URL);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể tải sự kiện");
        }

        setEvents(result.data);
      } catch (err) {
        setEventError(err.message);
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvents();
  }, []);

    // Tự động tải yêu cầu tham gia từ MongoDB
  useEffect(() => {
    if (clubs.length === 0) return;

    const fetchMemberships = async () => {
      try {
        const results = await Promise.all(
          clubs.map(async (club) => {
            const response = await fetch(
              `${API_URL}/${club._id}/memberships`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error("Không thể tải yêu cầu tham gia");
            }

            return result.data.map((membership) => ({
              id: membership._id,
              name: membership.studentName,
              email: membership.studentEmail,
              club: club.name,
              clubId: club._id,
              status: membership.status,
            }));
          })
        );

        setRequests(results.flat());
      } catch (error) {
        console.error("Lỗi tải yêu cầu:", error);
      }
    };

    fetchMemberships();
  }, [clubs]);

  // Tự động lấy danh mục từ dữ liệu MongoDB
  const categories = [
    "Tất cả",
    ...new Set(clubs.map((club) => club.category)),
  ];

  const filteredClubs = clubs.filter((club) => {
    const matchSearch = club.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "Tất cả" || club.category === category;

    return matchSearch && matchCategory;
  });

  
async function registerClub(clubId) {
  if (registered.includes(clubId)) return;

  const club = clubs.find((item) => item._id === clubId);

  if (!club) return;

  try {
    const response = await fetch(`${API_URL}/${clubId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentName: "Minh Anh",
        studentEmail: "minhanh@ueh.edu.vn",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Đăng ký thất bại");
    }

    // Cập nhật giao diện sau khi MongoDB lưu thành công
    setRegistered((previous) => [...previous, clubId]);

    setRequests((previous) => [
      ...previous,
      {
        id: result.data._id,
        name: result.data.studentName,
        club: club.name,
        email: result.data.studentEmail,
        status: result.data.status,
      },
    ]);

    alert("Đăng ký tham gia câu lạc bộ thành công!");
  } catch (error) {
    alert(error.message);
  }
}

  // Đăng ký tham gia sự kiện
  async function registerForEvent(eventId) {
    try {
      const response = await fetch(
        `${EVENT_REGISTRATION_API_URL}/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName: "Nguyen Van Camera",
            studentEmail: "test.camera@ueh.edu.vn",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Đăng ký sự kiện thất bại");
      }

      setSelectedEvent(result.data);

      alert("Đăng ký sự kiện thành công!");
    } catch (error) {
      alert(error.message);
    }
  }

    async function updateRequest(id, status) {
    try {
      const action = status === "approved" ? "approve" : "reject";

      const response = await fetch(
        `${API_URL}/memberships/${id}/${action}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể cập nhật yêu cầu");
      }

      // Chỉ cập nhật giao diện sau khi MongoDB xác nhận thành công
      setRequests((previous) =>
        previous.map((request) =>
          request.id === id
            ? { ...request, status: result.data.status }
            : request
        )
      );

      alert(
        status === "approved"
          ? "Đã duyệt yêu cầu tham gia!"
          : "Đã từ chối yêu cầu tham gia!"
      );
    } catch (error) {
      alert(error.message);
    }
  }

  // Xử lý điểm danh bằng mã QR
async function handleQRScan(token) {
  try {
    const response = await fetch(
      `${EVENT_REGISTRATION_API_URL}/check-in`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Điểm danh thất bại");
    }

    alert(
      `Điểm danh thành công!\nSinh viên: ${result.data.studentName}`
    );
  } catch (error) {
    alert(error.message);
  }
}

// Tạo mới hoặc cập nhật sự kiện
async function handleEventSubmit(formEvent) {
  formEvent.preventDefault();

  try {
    const isEditing = Boolean(editingEventId);

    const response = await fetch(
      isEditing
        ? `${EVENT_API_URL}/${editingEventId}`
        : EVENT_API_URL,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventForm,
          capacity: Number(eventForm.capacity),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Không thể lưu sự kiện"
      );
    }

    // Tải lại danh sách sự kiện từ MongoDB
    const refreshResponse = await fetch(EVENT_API_URL);
    const refreshResult = await refreshResponse.json();

    if (!refreshResponse.ok || !refreshResult.success) {
      throw new Error("Không thể tải lại danh sách sự kiện");
    }

    setEvents(refreshResult.data);

    // Đóng biểu mẫu và xóa dữ liệu nhập
    setShowEventForm(false);
    setEditingEventId(null);

    setEventForm({
      title: "",
      description: "",
      club: "",
      location: "",
      startDate: "",
      endDate: "",
      capacity: 100,
    });

    alert(
      isEditing
        ? "Cập nhật sự kiện thành công!"
        : "Tạo sự kiện thành công!"
    );
  } catch (error) {
    alert(error.message);
  }
}

// Xóa sự kiện
async function deleteEvent(eventId) {
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn xóa sự kiện này không?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${EVENT_API_URL}/${eventId}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể xóa sự kiện");
    }

    setEvents((previous) =>
      previous.filter((event) => event._id !== eventId)
    );

    if (selectedManageEvent?._id === eventId) {
      setSelectedManageEvent(null);
      setEventRegistrations([]);
    }

    alert("Xóa sự kiện thành công!");
  } catch (error) {
    alert(error.message);
  }
}

// Xem danh sách sinh viên đăng ký sự kiện
async function viewEventRegistrations(event) {
  try {
    const response = await fetch(
      `${EVENT_REGISTRATION_API_URL}/${event._id}/registrations`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Không thể tải danh sách đăng ký"
      );
    }

    setSelectedManageEvent(event);
    setEventRegistrations(result.data);
  } catch (error) {
    alert(error.message);
  }
}

  const pendingCount = requests.filter((item) => item.status === "pending").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SCMS</h2>
            <span>Student Club Management</span>
          </div>
        </div>

        <div className="sidebar-label">MENU CHÍNH</div>

        {role === "student" ? (
          <nav>
            <button
              className={activePage === "clubs" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("clubs")}
            >
              <span>🏠</span> Khám phá câu lạc bộ
            </button>
            <button
              className={activePage === "myclubs" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("myclubs")}
            >
              <span>❤️</span> Câu lạc bộ của tôi
            </button>
            <button
              className={activePage === "events" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("events")}
            >
              <span>🎉</span> Sự kiện
            </button>
          </nav>
        ) : (
          <nav>
            <button
              className={activePage === "overview" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("overview")}
            >
              <span>📊</span> Tổng quan
            </button>
            <button
              className={activePage === "requests" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("requests")}
            >
              <span>📋</span> Yêu cầu tham gia
              {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
            </button>
            <button
              className={activePage === "manageclubs" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("manageclubs")}
            >
              <span>🏢</span> Quản lý câu lạc bộ
            </button>
            <button
              className={activePage === "attendance" ? "nav-item active" : "nav-item"}
              onClick={() => setActivePage("attendance")}
            >
              <span>📷</span> Điểm danh QR
            </button>
            <button
              className={
                activePage === "manageevents"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage("manageevents")}
            >
              <span>🎉</span> Quản lý sự kiện
            </button>
          </nav>
        )}

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">💡</div>
            <strong>Cần hỗ trợ?</strong>
            <p>Khám phá các hoạt động sinh viên cùng SCMS.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">M</div>
            <div>
              <strong>{role === "student" ? "Minh Anh" : "Club Manager"}</strong>
              <span>{role === "student" ? "Sinh viên UEH" : "Ban chủ nhiệm"}</span>
            </div>
            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>SCMS</span>
            <span className="breadcrumb-divider">/</span>
            {role === "student" ? "Khu vực sinh viên" : "Khu vực quản lý"}
          </div>

          <div className="topbar-actions">
            <div className="role-switch">
              <button
                className={role === "student" ? "role-button selected" : "role-button"}
                onClick={() => {
                  setRole("student");
                  setActivePage("clubs");
                }}
              >
                Sinh viên
              </button>
              <button
                className={role === "manager" ? "role-button selected" : "role-button"}
                onClick={() => {
                  setRole("manager");
                  setActivePage("overview");
                }}
              >
                Ban chủ nhiệm
              </button>
            </div>
            <button className="notification-button" aria-label="Thông báo">
              🔔
              <span></span>
            </button>
          </div>
        </header>

        {role === "student" && activePage === "clubs" && (
          <section className="page">
            <div className="welcome-banner">
              <div className="welcome-text">
                <span className="eyebrow">CHÀO MỪNG BẠN ĐẾN VỚI SCMS</span>
                <h1>Khám phá cộng đồng<br />dành cho bạn! 👋</h1>
                <p>Tìm kiếm câu lạc bộ phù hợp và bắt đầu hành trình trải nghiệm sinh viên của bạn.</p>
                <button className="banner-button" onClick={() => document.getElementById("club-list")?.scrollIntoView({ behavior: "smooth" })}>
                  Khám phá ngay <span>→</span>
                </button>
              </div>
              <div className="banner-art">🎓</div>
              <div className="banner-decoration decoration-one"></div>
              <div className="banner-decoration decoration-two"></div>
            </div>

            <div className="section-heading">
              <div>
                <span className="eyebrow blue-text">TÌM CỘNG ĐỒNG CỦA BẠN</span>
                <h2>Khám phá câu lạc bộ</h2>
                <p>Có rất nhiều cộng đồng thú vị đang chờ bạn tham gia.</p>
              </div>
              <div className="club-total">✨ {clubs.length} câu lạc bộ nổi bật</div>
            </div>

            <div className="search-filter">
              <div className="search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm câu lạc bộ..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            {loading && (
            <div className="empty-state">
              Đang tải danh sách câu lạc bộ...
            </div>
          )}

          {error && (
            <div className="empty-state">
              Không thể tải dữ liệu: {error}
            </div>
          )}
            {!loading && !error && (
            <div className="club-grid" id="club-list">
              {filteredClubs.map((club) => (
                <article className="club-card" key={club._id}>
                  <div className={`club-cover ${club.color || "blue"}`}>
                    <div className="club-emoji">{club.emoji || "🎓"}</div>
                    <span className="club-category">{club.category}</span>
                  </div>
                  <div className="club-info">
                    <h3>{club.name}</h3>
                    <div className="club-members">
                      👥 {club.memberCount} thành viên
                    </div>
                    <p>{club.description}</p>
                    <button
                      className={
                        registered.includes(club._id)
                          ? "register-button registered"
                          : "register-button"
                      }
                      onClick={() => registerClub(club._id)}
                      disabled={registered.includes(club._id)}
                    >
                      {registered.includes(club._id)
                        ? "✓ Đã gửi yêu cầu"
                        : "Đăng ký tham gia →"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

            {!loading && !error && filteredClubs.length === 0 && (
              <div className="empty-state">
                Không tìm thấy câu lạc bộ phù hợp.
              </div>
            )}
          </section>
        )}

        {role === "student" && activePage === "myclubs" && (
          <section className="page">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue-text">HÀNH TRÌNH CỦA BẠN</span>
                <h2>Câu lạc bộ của tôi</h2>
                <p>Theo dõi những câu lạc bộ bạn đã gửi yêu cầu tham gia.</p>
              </div>
            </div>
            <div className="club-grid">
              {clubs.filter((club) => registered.includes(club._id)).map((club) => (
                <article className="club-card" key={club._id}>
                  <div className={`club-cover ${club.color || "blue"}`}>
                    <div className="club-emoji">{club.emoji || "🎓"}</div>
                    <span className="club-category">{club.category}</span>
                  </div>
                  <div className="club-info">
                    <h3>{club.name}</h3>
                    <p>{club.description}</p>
                    <span className="status pending-status">Đang chờ duyệt</span>
                  </div>
                </article>
              ))}
            </div>
            {registered.length === 0 && (
              <div className="empty-state">Bạn chưa gửi yêu cầu tham gia câu lạc bộ nào.</div>
            )}
          </section>
        )}
        {/* TRANG SỰ KIỆN */}
        {role === "student" && activePage === "events" && (
          <section className="page">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue-text">KẾT NỐI VÀ TRẢI NGHIỆM</span>
                <h2>Sự kiện sinh viên 🎉</h2>
                <p>Khám phá các hoạt động thú vị từ những câu lạc bộ tại UEH.</p>
              </div>
              <div className="club-total">
                🎊 {events.length} sự kiện
              </div>
            </div>

            {eventLoading && (
              <div className="empty-state">
                Đang tải danh sách sự kiện...
              </div>
            )}

            {eventError && (
              <div className="empty-state">
                Không thể tải sự kiện: {eventError}
              </div>
            )}

            {!eventLoading && !eventError && events.length === 0 && (
              <div className="empty-state">
                Hiện chưa có sự kiện nào.
              </div>
            )}

            {!eventLoading && !eventError && events.length > 0 && (
              <div className="event-grid">
                {events.map((event) => (
                  <article className="event-card" key={event._id}>
                    <div className="event-cover">🎉</div>

                    <div className="event-info">
                      <h3>{event.title}</h3>

                      <p>{event.description}</p>

                      <div className="event-meta">
                        <span>
                          📍 {event.location}
                        </span>

                        <span>
                          📅 {new Date(event.startDate).toLocaleString("vi-VN")}
                        </span>

                        <span>
                          🏢 {event.club?.name || "Câu lạc bộ"}
                        </span>

                        <span>
                          👥 Sức chứa: {event.capacity} người
                        </span>
                      </div>

                      <div className="event-actions">
                        <button
                          className="event-primary-button"
                          onClick={() => registerForEvent(event._id)}
                        >
                          Đăng ký tham gia →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {selectedEvent && (
              <div className="panel" style={{ marginTop: "24px" }}>
                <div className="panel-heading">
                  <div>
                    <h3>Đăng ký thành công!</h3>
                    <p>
                      Bạn đã đăng ký tham gia sự kiện.
                    </p>
                  </div>
                </div>

                <p>
                  Mã đăng ký: {selectedEvent._id}
                </p>

                <img
                  className="event-qr"
                  src={`${EVENT_REGISTRATION_API_URL}/registrations/${selectedEvent._id}/qr`}
                  alt="Mã QR điểm danh sự kiện"
                />

                <p style={{ textAlign: "center" }}>
                  Vui lòng lưu mã QR để sử dụng khi điểm danh.
                </p>
              </div>
            )}
          </section>
        )}

        {role === "manager" && (
          <section className="page">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue-text">KHÔNG GIAN QUẢN LÝ</span>
                <h2>
                  {activePage === "overview"
                    ? "Tổng quan câu lạc bộ"
                    : activePage === "requests"
                      ? "Yêu cầu tham gia"
                      : activePage === "manageclubs"
                        ? "Quản lý câu lạc bộ"
                        : activePage === "attendance"
                          ? "Điểm danh QR"
                          : activePage === "manageevents"
                            ? "Quản lý sự kiện"
                            : "Tổng quan"}
                </h2>
                <p>Quản lý hoạt động và kết nối cộng đồng câu lạc bộ của bạn.</p>
              </div>
            </div>

            {activePage === "overview" && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon stat-blue">👥</div>
                    <span>Tổng thành viên</span>
                    <strong>120</strong>
                    <small>Thành viên câu lạc bộ</small>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-orange">📩</div>
                    <span>Yêu cầu chờ duyệt</span>
                    <strong>{pendingCount}</strong>
                    <small>Cần được xử lý</small>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon stat-green">🎉</div>
                    <span>Sự kiện</span>
                    <strong>08</strong>
                    <small>Hoạt động dự kiến</small>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Yêu cầu tham gia gần đây</h3>
                      <p>Các sinh viên đang chờ xét duyệt.</p>
                    </div>
                    <button className="text-button" onClick={() => setActivePage("requests")}>Xem tất cả →</button>
                  </div>
                  <RequestTable requests={requests.slice(0, 3)} onUpdate={updateRequest} />
                </div>
              </>
            )}

            {activePage === "requests" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Danh sách yêu cầu</h3>
                    <p>Xem xét và phản hồi yêu cầu tham gia câu lạc bộ.</p>
                  </div>
                  <span className="club-total">{pendingCount} đang chờ</span>
                </div>
                <RequestTable requests={requests} onUpdate={updateRequest} />
              </div>
            )}

            {activePage === "manageclubs" && (
              <div className="club-grid">
                {clubs.map((club) => (
                  <article className="club-card" key={club._id}>
                    <div className={`club-cover ${club.color || "blue"}`}>
                      <div className="club-emoji">{club.emoji || "🎓"}</div>
                      <span className="club-category">{club.category}</span>
                    </div>
                    <div className="club-info">
                      <h3>{club.name}</h3>
                      <div className="club-members">👥 {club.memberCount} thành viên</div>
                      <p>{club.description}</p>
                      <span className="status approved-status">Đang hoạt động</span>
                    </div>
                  </article>
                ))}
              </div>
            )}

                {/* TRANG QUẢN LÝ SỰ KIỆN */}
                {activePage === "manageevents" && (
                  <>
                    <div className="panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Quản lý sự kiện 🎉</h3>
                          <p>Tạo, chỉnh sửa và quản lý các sự kiện câu lạc bộ.</p>
                        </div>

                        <button
                          className="event-primary-button"
                          onClick={() => {
                            setEditingEventId(null);
                            setEventForm({
                              title: "",
                              description: "",
                              club: "",
                              location: "",
                              startDate: "",
                              endDate: "",
                              capacity: 100,
                            });
                            setShowEventForm(!showEventForm);
                          }}
                        >
                          + Tạo sự kiện
                        </button>
                      </div>

                      {showEventForm && (
                        <form
                          className="event-form"
                          onSubmit={handleEventSubmit}
                        >
                          <h3>
                            {editingEventId ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
                          </h3>

                          <input
                            placeholder="Tên sự kiện"
                            value={eventForm.title}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, title: e.target.value })
                            }
                            required
                          />

                          <textarea
                            placeholder="Mô tả sự kiện"
                            value={eventForm.description}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, description: e.target.value })
                            }
                          />

                          <select
                            value={eventForm.club}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, club: e.target.value })
                            }
                            required
                          >
                            <option value="">-- Chọn câu lạc bộ --</option>
                            {clubs.map((club) => (
                              <option key={club._id} value={club._id}>
                                {club.name}
                              </option>
                            ))}
                          </select>

                          <input
                            placeholder="Địa điểm"
                            value={eventForm.location}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, location: e.target.value })
                            }
                            required
                          />

                          <label>Thời gian bắt đầu</label>
                          <input
                            type="datetime-local"
                            value={eventForm.startDate}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, startDate: e.target.value })
                            }
                            required
                          />

                          <label>Thời gian kết thúc</label>
                          <input
                            type="datetime-local"
                            value={eventForm.endDate}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, endDate: e.target.value })
                            }
                            required
                          />

                          <label>Sức chứa</label>
                          <input
                            type="number"
                            min="1"
                            value={eventForm.capacity}
                            onChange={(e) =>
                              setEventForm({ ...eventForm, capacity: e.target.value })
                            }
                            required
                          />

                          <div className="event-actions">
                            <button type="submit" className="event-primary-button">
                              {editingEventId ? "Lưu thay đổi" : "Tạo sự kiện"}
                            </button>

                            <button
                              type="button"
                              className="event-secondary-button"
                              onClick={() => {
                                setShowEventForm(false);
                                setEditingEventId(null);
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    <div className="event-grid">
                      {events.map((event) => (
                        <article className="event-card" key={event._id}>
                          <div className="event-cover">🎉</div>

                          <div className="event-info">
                            <h3>{event.title}</h3>
                            <p>{event.description}</p>

                            <div className="event-meta">
                              <span>📍 {event.location}</span>
                              <span>
                                📅 {new Date(event.startDate).toLocaleString("vi-VN")}
                              </span>
                              <span>🏢 {event.club?.name || "Câu lạc bộ"}</span>
                              <span>👥 Sức chứa: {event.capacity}</span>
                            </div>

                            <div className="event-actions">
                              <button
                                className="event-primary-button"
                                onClick={() => viewEventRegistrations(event)}
                              >
                                Xem người đăng ký
                              </button>

                              <button
                                className="event-secondary-button"
                                onClick={() => {
                                  setEditingEventId(event._id);
                                  setEventForm({
                                    title: event.title,
                                    description: event.description || "",
                                    club: event.club?._id || "",
                                    location: event.location,
                                    startDate: new Date(event.startDate)
                                      .toISOString().slice(0, 16),
                                    endDate: new Date(event.endDate)
                                      .toISOString().slice(0, 16),
                                    capacity: event.capacity,
                                  });
                                  setShowEventForm(true);
                                }}
                              >
                                Sửa
                              </button>

                              <button
                                className="event-secondary-button"
                                onClick={() => deleteEvent(event._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {!eventLoading && events.length === 0 && (
                      <div className="empty-state">Chưa có sự kiện nào.</div>
                    )}

                    {selectedManageEvent && (
                      <div className="panel" style={{ marginTop: "24px" }}>
                        <div className="panel-heading">
                          <div>
                            <h3>Người đăng ký: {selectedManageEvent.title}</h3>
                            <p>Danh sách sinh viên tham gia sự kiện.</p>
                          </div>

                          <button
                            className="event-secondary-button"
                            onClick={() => {
                              setSelectedManageEvent(null);
                              setEventRegistrations([]);
                            }}
                          >
                            Đóng
                          </button>
                        </div>

                        <div className="table-wrap">
                          <table className="request-table">
                            <thead>
                              <tr>
                                <th>SINH VIÊN</th>
                                <th>EMAIL</th>
                                <th>TRẠNG THÁI</th>
                                <th>THỜI GIAN ĐIỂM DANH</th>
                              </tr>
                            </thead>

                            <tbody>
                              {eventRegistrations.map((item) => (
                                <tr key={item._id}>
                                  <td>{item.studentName}</td>
                                  <td>{item.studentEmail}</td>
                                  <td>
                                    <span className={`status ${
                                      item.status === "attended"
                                        ? "approved-status"
                                        : item.status === "cancelled"
                                          ? "rejected-status"
                                          : "pending-status"
                                    }`}>
                                      {item.status === "attended"
                                        ? "Đã điểm danh"
                                        : item.status === "cancelled"
                                          ? "Đã hủy"
                                          : "Đã đăng ký"}
                                    </span>
                                  </td>
                                  <td>
                                    {item.checkInTime
                                      ? new Date(item.checkInTime).toLocaleString("vi-VN")
                                      : "Chưa điểm danh"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {eventRegistrations.length === 0 && (
                            <div className="empty-state">
                              Chưa có sinh viên đăng ký sự kiện này.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                         {/* TRANG ĐIỂM DANH QR */}
            {activePage === "attendance" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Điểm danh sự kiện bằng QR 📷</h3>
                    <p>
                      Sử dụng camera để quét mã QR của sinh viên tham gia sự kiện.
                    </p>
                  </div>
                </div>

                <QRScanner onScanSuccess={handleQRScan} />

                <p style={{ textAlign: "center", color: "#64748b" }}>
                  Đưa mã QR của sinh viên vào khung camera để điểm danh.
                </p>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span>© 2026 SCMS – Student Club Management System</span>
          <span>Made for UEH students 💙</span>
        </footer>
      </main>
    </div>
  );
}

function RequestTable({ requests, onUpdate }) {
  return (
    <div className="table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>SINH VIÊN</th>
            <th>CÂU LẠC BỘ</th>
            <th>TRẠNG THÁI</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>
                <div className="student-cell">
                  <div className="avatar small-avatar">{request.name.charAt(0)}</div>
                  <div>
                    <strong>{request.name}</strong>
                    <span>{request.email}</span>
                  </div>
                </div>
              </td>
              <td>{request.club}</td>
              <td>
                <span className={`status ${request.status === "pending" ? "pending-status" : request.status === "approved" ? "approved-status" : "rejected-status"}`}>
                  {request.status === "pending" ? "Chờ duyệt" : request.status === "approved" ? "Đã chấp nhận" : "Đã từ chối"}
                </span>
              </td>
              <td>
                {request.status === "pending" ? (
                  <div className="table-actions">
                    <button className="approve-button" onClick={() => onUpdate(request.id, "approved")}>Duyệt</button>
                    <button className="reject-button" onClick={() => onUpdate(request.id, "rejected")}>Từ chối</button>
                  </div>
                ) : (
                  <span className="processed-label">Đã xử lý</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {requests.length === 0 && <div className="empty-state">Chưa có yêu cầu tham gia.</div>}
    </div>
  );
}

// Component quét mã QR bằng camera
function QRScanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess]);

  return (
    <div>
      <div id="qr-reader" style={{ width: "100%", maxWidth: "500px" }}></div>
    </div>
  );
}

export default App;
