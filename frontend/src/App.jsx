
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/clubs";

function App() {
  const [role, setRole] = useState("student");
  const [activePage, setActivePage] = useState("clubs");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [registered, setRegistered] = useState([]);
  const [requests, setRequests] = useState([]);

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




  function updateRequest(id, status) {
    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
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

        {role === "manager" && (
          <section className="page">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue-text">KHÔNG GIAN QUẢN LÝ</span>
                <h2>
                  {activePage === "overview" ? "Tổng quan câu lạc bộ" :
                    activePage === "requests" ? "Yêu cầu tham gia" : "Quản lý câu lạc bộ"}
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

export default App;
