import { useState, useEffect } from 'react';

// CẤU HÌNH API BACKEND
// Sử dụng biến môi trường khi deploy hoặc mặc định chạy local
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/rsvp';


function App() {
  // --- STATE QUẢN LÝ ---
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [confetti, setConfetti] = useState([]);
  const [sparkleEffects, setSparkleEffects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // =========================================================================
  // 1. CHỈNH SỬA: ĐƯỜNG DẪN ẢNH CỦA BẢN THÂN
  // Hãy thay thế hoặc thêm các file ảnh của bạn vào thư mục 'frontend/public/'
  // và cập nhật đường dẫn dưới đây (ví dụ: '/anh_tot_nghiep_1.jpg')
  // =========================================================================
  const personalPhotos = [
    '/thành.jpg',      // Ảnh 1 (Mặc định)
    '/thuMoiTN.png'    // Ảnh 2 (Click để đổi)
  ];
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // --- TẢI DANH SÁCH RSVP TỪ BACKEND ---
  const fetchRSVPs = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setRsvps(data);
      } else {
        console.warn("Không thể tải danh sách từ Backend API, chuyển sang dùng LocalStorage.");
        loadFromLocalStorage();
      }
    } catch (error) {
      console.warn("Lỗi kết nối Backend. Dùng dữ liệu dự phòng từ LocalStorage:", error);
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    const localData = localStorage.getItem('rsvp_backup');
    if (localData) {
      setRsvps(JSON.parse(localData));
    } else {
      // Dữ liệu mẫu ban đầu để giao diện trông sinh động hơn
      const mockData = [
        { id: 1, name: 'Nguyễn Văn A', attending: true, message: 'Chúc mừng Phúc Thành nhé! Chúc bạn bay cao bay xa!', created_at: new Date().toISOString() },
        { id: 2, name: 'Trần Thị B', attending: true, message: 'Mãi đỉnh Thành ơi, nhất định mình sẽ tới!', created_at: new Date().toISOString() }
      ];
      setRsvps(mockData);
      localStorage.setItem('rsvp_backup', JSON.stringify(mockData));
    }
  };

  useEffect(() => {
    fetchRSVPs();

    // Kiểm tra xem URL có chứa tham số ?admin=true hay không
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // --- HIỆU ỨNG THẢ CONFETTI KHI ĐĂNG KÝ THÀNH CÔNG ---
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // % width
      delay: Math.random() * 2, // s
      duration: 2 + Math.random() * 3, // s
      size: 5 + Math.random() * 8, // px
      color: ['#ffd700', '#ff4081', '#00e676', '#29b6f6', '#ab47bc'][Math.floor(Math.random() * 5)]
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 6000);
  };

  // --- HIỆU ỨNG TẠO SAO LẤP LÁNH KHI CLICK CHUỘT LÊN ẢNH ---
  const handlePhotoClick = (e) => {
    // Đổi ảnh
    setCurrentPhotoIdx((prev) => (prev + 1) % personalPhotos.length);

    // Tạo hiệu ứng lấp lánh tại vị trí click
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSparkle = {
      id: Date.now(),
      x,
      y
    };

    setSparkleEffects((prev) => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkleEffects((prev) => prev.filter(s => s.id !== newSparkle.id));
    }, 1500);
  };

  // --- XỬ LÝ GỬI FORM RSVP ---
  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      attending: attending,
      message: message.trim() || null
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedRSVP = await response.json();
        // Cập nhật state danh sách
        setRsvps((prev) => [savedRSVP, ...prev]);
        showToast('🎉 Xác nhận tham dự thành công! Cảm ơn bạn.');
        triggerConfetti();
        // Reset form
        setName('');
        setMessage('');
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.warn("Lỗi kết nối API. Thực hiện lưu cục bộ (Local Fallback):", error);
      // Fallback cục bộ
      const mockSaved = {
        id: Date.now(),
        ...payload,
        created_at: new Date().toISOString()
      };
      const updatedRsvps = [mockSaved, ...rsvps];
      setRsvps(updatedRsvps);
      localStorage.setItem('rsvp_backup', JSON.stringify(updatedRsvps));

      showToast('🎉 Đã ghi nhận lời mời (Chế độ Offline/Demo)!');
      triggerConfetti();
      setName('');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  return (
    <div className="sky-bg">
      {/* Lớp hạt chấm li ti Halftone */}
      <div className="sky-dots"></div>

      {/* Mây bay trang trí */}
      <div className="clouds-container">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Hiệu ứng pháo hoa giấy khi thành công */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.x}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
              }}
            />
          ))}
        </div>
      )}

      {/* Thông báo Toast xinh xắn */}
      <div className={`toast-alert ${toast.show ? 'show' : ''}`}>
        <span>{toast.message}</span>
      </div>

      {/* NỘI DUNG CHÍNH WEBSITE */}
      <div className="container">

        {/* ==========================================
            MỤC 1: HERO SECTION & ẢNH CÁ NHÂN (POLAROID)
           ========================================== */}
        <header style={{ textAlign: 'center', position: 'relative' }}>
          {/* Nhãn "LỄ TỐT NGHIỆP" dễ thương */}
          <div className="capsule-badge">
            LỄ TỐT NGHIỆP
          </div>

          {/* Khung ảnh Polaroid chứa hình cá nhân */}
          <div className="polaroid-frame" onClick={handlePhotoClick}>
            {/* Sao lấp lánh viền quanh khung ảnh */}
            <svg className="sparkle sparkle-1" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L14.7,8.7L22,10L16.2,14.7L18.2,22L12,18L5.8,22L7.8,14.7L2,10L9.3,8.7L12,2Z" /></svg>
            <svg className="sparkle sparkle-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L14.7,8.7L22,10L16.2,14.7L18.2,22L12,18L5.8,22L7.8,14.7L2,10L9.3,8.7L12,2Z" /></svg>
            <svg className="sparkle sparkle-3" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L14.7,8.7L22,10L16.2,14.7L18.2,22L12,18L5.8,22L7.8,14.7L2,10L9.3,8.7L12,2Z" /></svg>

            <div className="polaroid-image-container">
              <img
                src={personalPhotos[currentPhotoIdx]}
                alt="Phúc Thành Graduation"
                className="polaroid-image"
              />

              {/* Click sparkle effect render */}
              {sparkleEffects.map((s) => (
                <div
                  key={s.id}
                  className="sparkle-fly"
                  style={{ left: s.x, top: s.y }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" style={{ color: '#ffd700' }}>
                    <path fill="currentColor" d="M12,2L14.7,8.7L22,10L16.2,14.7L18.2,22L12,18L5.8,22L7.8,14.7L2,10L9.3,8.7L12,2Z" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Tên hiển thị kiểu chữ dễ thương viền trắng */}
            <div className="polaroid-caption">
              PHÚC THÀNH
            </div>
          </div>
        </header>


        <p className="photo-switch-hint">
          <span>✨</span> Nhấp vào ảnh để xem thêm khoảnh khắc nha!
        </p>

        {/* =========================================================================
              CHỈNH SỬA: LỜI MỞ ĐẦU VÀ GIỚI THIỆU BẢN THÂN
              Bạn có thể thay đổi câu chữ chào mừng dưới đây
             ========================================================================= */}
        <div className="section-card" style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', lineHeight: '1.8', textAlign: 'center' }}>
            Thân mời bạn đến chung vui trong ngày tốt nghiệp của

            <strong style={{
              display: 'block',
              color: 'var(--grass-green-dark)',
              fontSize: '1.6rem',
              fontFamily: 'var(--font-display)',
              marginTop: '0.5rem',
              marginBottom: '0.2rem'
            }}>
              PHÚC THÀNH aka BLUBERRIES
            </strong>

            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '500' }}>
              Cử nhân ngành Khoa học Máy tính – UIT
            </span>
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--light-text)', marginTop: '10px' }}>
            Được chụp cùng bạn một bức hình (và nhận quà của bạn) là niềm vui mà mình luôn hằng ao ước.
          </p>
        </div>


        {/* =========================================================================
              MỤC 2: THỜI GIAN VÀ ĐỊA ĐIỂM (CÓ THỂ TỰ THÊM NỘI DUNG CHI TIẾT TẠI ĐÂY)
             ========================================================================= */}
        <div className="section-card" id="thoi-gian">
          <h2 className="section-title">
            {/* Icon Lịch */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Thời gian & Địa điểm
          </h2>

          <div className="datetime-container">
            {/* =========================================================================
                  CHỈNH SỬA: CHI TIẾT THỜI GIAN LỄ TỐT NGHIỆP
                  Sửa ngày, giờ ở phần detail-value bên dưới
                 ========================================================================= */}
            <div className="detail-item">
              <div className="detail-icon">📅</div>
              <div className="detail-label">Thời gian</div>
              <div className="detail-value">11h00 - 12h30</div>
              <div className="detail-value">Thứ Ba, 09/06/2026</div>
              <div className="detail-subvalue">(Có thể sẽ trễ hơn dự kiến nếu trường không thả mình ra sớm nhé)</div>
            </div>

            {/* =========================================================================
                  CHỈNH SỬA: CHI TIẾT ĐỊA ĐIỂM TỔ CHỨC
                  Sửa tên giảng đường, trường học ở bên dưới
                 ========================================================================= */}
            <div className="detail-item">
              <div className="detail-icon">🎓</div>
              <div className="detail-label">Địa điểm</div>
              <div className="detail-value">Sân gạch tòa C</div>
              <div className="detail-value">Trường ĐH CNTT - UIT</div>
              <div className="detail-subvalue">Đại học Quốc gia TP.HCM</div>
            </div>
          </div>
        </div>


        {/* =========================================================================
              MỤC 3: ĐỊA ĐIỂM BẢN ĐỒ CHI TIẾT VÀ LINK GOOGLE MAPS
             ========================================================================= */}
        <div className="section-card" id="ban-do">
          <h2 className="section-title">
            {/* Icon Ghim bản đồ */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Bản đồ Đường đi
          </h2>

          {/* =========================================================================
                CHỈNH SỬA: NỘI DUNG MÔ TẢ ĐỊA ĐIỂM
               ========================================================================= */}
          <p style={{ textAlign: 'left', marginBottom: '10px' }}>
            📍 <strong>Trường Đại học Công nghệ Thông tin (UIT)</strong>: Khu phố 6, phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh.
          </p>
          <p style={{ textAlign: 'left', fontSize: '0.95rem', color: 'var(--light-text)' }}>
            Hãy đi theo Xa Lộ Hà Nội vào hướng Làng Đại học, rẽ vào đường song hành hoặc đi thẳng tới cổng UIT nhé!
          </p>

          {/* BẢN ĐỒ GOOGLE MAPS NHÚNG (Bản đồ thực tế của UIT) */}
          <div className="map-iframe-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.232428509312!2d106.80161377573752!3d10.870008857463695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e68d563%3A0xdb65d9afb890886b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiAtIMSQSFFHIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1716380000000!5m2!1svi!2s"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ UIT"
            ></iframe>
          </div>

          {/* =========================================================================
                CHỈNH SỬA: LINK LIÊN KẾT GOOGLE MAPS (Nút mở trên điện thoại)
                Thay thuộc tính href bằng link Google Maps của bạn nếu cần
               ========================================================================= */}
          <a
            href="https://maps.app.goo.gl/9k4XMUJwcHS4VPx78"
            target="_blank"
            rel="noopener noreferrer"
            className="map-button-link"
          >
            <span>🗺️</span> Chỉ đường trên Google Maps
          </a>
        </div>


        {/* =========================================================================
              MỤC 4: HƯỚNG DẪN GỬI XE (CÓ THỂ TỰ CHỈNH SỬA NỘI DUNG CHI TIẾT TẠI ĐÂY)
             ========================================================================= */}
        <div className="section-card" id="gui-xe">
          <h2 className="section-title">
            {/* Icon Xe hơi/Xe máy */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Hướng dẫn gửi xe
          </h2>

          {/* =========================================================================
                CHỈNH SỬA: CÁC BƯỚC HƯỚNG DẪN GỬI XE
                Thay đổi hoặc thêm bớt các bước bên dưới tùy tình hình thực tế
               ========================================================================= */}
          <ul className="parking-steps">
            <li className="parking-step-item">
              <div className="parking-step-num">1</div>
              <div className="parking-step-text">
                <strong>Bãi gửi xe:</strong> Nằm phía bên tay trái nếu đi vào bằng cổng Hàn Thuyên. Nếu bạn đi vào bằng cổng Xa lộ Hà Nội, hãy men theo con đường nhựa, vòng qua tòa nhà B để đến bãi giữ xe.
              </div>
            </li>
            <li className="parking-step-item">
              <div className="parking-step-num">2</div>
              <div className="parking-step-text">
                <strong>Lấy thẻ xe:</strong> Nếu bạn không phải sinh viên UIT, hãy nhắc bảo vệ lấy thẻ xe. Còn nếu là sinh viên UIT thì chỉ cần quét thẻ sinh viên.
              </div>
            </li>
            <li className="parking-step-item">
              <div className="parking-step-num">3</div>
              <div className="parking-step-text">
                <strong>Chi phí gửi xe:</strong> 4k nếu là sinh viên ngoài, 3k nếu là sinh viên UIT.
              </div>
            </li>
            <li className="parking-step-item">
              <div className="parking-step-num">4</div>
              <div className="parking-step-text">
                <strong>Lưu ý:</strong> Sau khi gửi xe xong, bạn có thể đi khám phá xung quanh trường hoặc liên hệ mình để mình ra đón nhé (nếu mình đã làm lễ xong).
              </div>
            </li>
          </ul>
        </div>


        {/* ==========================================
              MỤC 5: XÁC NHẬN THAM DỰ (RSVP FORM)
             ========================================== */}
        <div className="section-card" id="xac-nhan">
          <h2 className="section-title">
            {/* Icon Thư xác nhận */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Xác nhận tham dự
          </h2>

          <p style={{ textAlign: 'left', marginBottom: '20px', color: 'var(--light-text)' }}>
            Hãy phản hồi giúp mình trước ngày <strong>07/06/2026</strong> để mình chuẩn bị đón tiếp chu đáo nhất nhé!
          </p>

          <form onSubmit={handleSubmitRSVP} className="rsvp-form-container">
            {/* Nhập Họ và tên */}
            <div className="form-group">
              <label htmlFor="guest-name" className="form-label">Họ và tên của bạn *</label>
              <input
                type="text"
                id="guest-name"
                className="form-input"
                placeholder="Nhập họ và tên của bạn..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Câu hỏi lựa chọn Có/Không */}
            <div className="form-group">
              <label className="form-label">Bạn sẽ đến và chụp cùng mình tấm ảnh chứ?</label>
              <div className="rsvp-options-grid">

                {/* Lựa chọn CÓ tham gia */}
                <div
                  className={`rsvp-option-card ${attending ? 'selected-yes' : ''}`}
                  onClick={() => setAttending(true)}
                >
                  <div className="option-emoji">🥳</div>
                  <div className="option-title option-title-yes">Chắc chắn rồi!</div>
                  <div className="option-desc">Không chụp đẹp không về nhé!</div>
                </div>

                {/* Lựa chọn KHÔNG tham gia */}
                <div
                  className={`rsvp-option-card ${!attending ? 'selected-no' : ''}`}
                  onClick={() => setAttending(false)}
                >
                  <div className="option-emoji">😢</div>
                  <div className="option-title option-title-no">Tiếc quá, bận mất rồi</div>
                  <div className="option-desc">Thoai không sao, nhưng nhớ gửi quà cho mình sau nhé hẹ hẹ.!</div>
                </div>

              </div>
            </div>

            {/* Lời chúc gửi kèm */}
            <div className="form-group">
              <label htmlFor="guest-msg" className="form-label">Bạn có gì muốn nhắn gửi đến mình hông? (muốn nói gì nói)</label>
              <textarea
                id="guest-msg"
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Gửi lời chúc mừng hoặc lời nhắn tại đây..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Nút gửi */}
            <button
              type="submit"
              className="bubbly-button"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Đang gửi phản hồi...' : 'Gửi xác nhận của bạn'}
            </button>
          </form>

          {/* DANH SÁCH KHÁCH MỜI ĐÃ XÁC NHẬN (Chỉ hiển thị cho Admin khi truy cập qua link bí mật ?admin=true) */}
          {isAdmin && (
            <div className="guest-list-section">
              <h3 className="guest-list-title">
                👥 Những người bạn đã gửi phản hồi ({rsvps.length})
              </h3>

              <div className="guest-cards-container">
                {rsvps.length === 0 ? (
                  <p style={{ color: 'var(--light-text)', fontSize: '0.9rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                    Chưa có ai gửi xác nhận. Hãy là người đầu tiên!
                  </p>
                ) : (
                  rsvps.map((guest) => (
                    <div key={guest.id} className="guest-card">
                      <div className="guest-card-header">
                        <div className="guest-name" title={guest.name}>{guest.name}</div>
                        <span className={`guest-badge ${guest.attending ? 'badge-yes' : 'badge-no'}`}>
                          {guest.attending ? 'Sẽ tham gia' : 'Vắng mặt'}
                        </span>
                      </div>
                      {guest.message && <div className="guest-message">"{guest.message}"</div>}
                      <span className="guest-time">
                        {new Date(guest.created_at).toLocaleDateString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>


        {/* =========================================================================
              MỤC 6: THÔNG TIN LIÊN LẠC CỦA CHỦ TIỆC
             ========================================================================= */}
        <div className="section-card" id="lien-he">
          <h2 className="section-title">
            {/* Icon Điện thoại */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Thông tin liên lạc
          </h2>

          <p style={{ textAlign: 'left', marginBottom: '15px', color: 'var(--light-text)' }}>
            Nếu bạn có câu hỏi hoặc cần hỗ trợ thêm thông tin gì, đừng ngần ngại liên lạc với Phúc Thành qua:
          </p>

          <div className="contacts-grid">
            {/* =========================================================================
                  CHỈNH SỬA: SỐ ĐIỆN THOẠI
                  Thay đổi tel: số điện thoại và số hiển thị bên dưới
                 ========================================================================= */}
            <a href="tel:0982962655" className="contact-link-card">
              <div className="contact-icon-wrapper">📞</div>
              <div className="contact-info-text">
                <span className="contact-title">Điện thoại</span>
                <span className="contact-value">0982 962 655</span>
              </div>
            </a>

            {/* =========================================================================
                  CHỈNH SỬA: EMAIL
                  Thay đổi mailto: email và email hiển thị bên dưới
                 ========================================================================= */}
            <a href="mailto:phucthanhlqm@gmail.com" className="contact-link-card">
              <div className="contact-icon-wrapper">✉️</div>
              <div className="contact-info-text">
                <span className="contact-title">Email</span>
                <span className="contact-value">phucthanhlqm@gmail.com</span>
              </div>
            </a>

            {/* =========================================================================
                  CHỈNH SỬA: TRANG CÁ NHÂN FACEBOOK / MESSENGER
                  Thay đổi href thành link Facebook của bạn
                 ========================================================================= */}
            <a
              href="https://www.facebook.com/phucthanh.nguyen.564"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link-card"
              style={{ gridColumn: '1 / -1' }}
            >
              <div className="contact-icon-wrapper">💬</div>
              <div className="contact-info-text">
                <span className="contact-title">Facebook</span>
                <span className="contact-value">fb.com/phucthanh</span>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer>
        <p>🎓 Made with ❤️ for Phuc Thanh's Graduation Day 🎓</p>
        <p style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.7 }}>© 2026 Phúc Thành. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
