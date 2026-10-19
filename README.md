# 🌌 Our Little Universe — For Nguyễn Thị Minh Thư ✨
> Món quà đặc biệt dành tặng bạn gái nhân ngày Phụ nữ Việt Nam 20/10/2026.

Một website tương tác lãng mạn phong cách điện ảnh (cinematic romantic 3D experience) được xây dựng bằng **React + TypeScript + Three.js + React Three Fiber + Tailwind CSS + GSAP**.

---

## 🌟 Trải nghiệm 4 Cảnh (4 Cinematic Scenes)

1. **Scene 1 — The Cosmic Portal (Cổng Vũ Trụ)**:
   - Bầu trời sao huyền ảo với bụi vàng lấp lánh liên tục rơi.
   - Cổng năng lượng vũ trụ tím - hồng phát sáng xoay tròn.
   - Dòng chữ hé lộ: *"Giữa hàng tỷ vì sao trong vũ trụ... Có một ngôi sao đặc biệt mang tên Minh Thư."*
   - Nút bấm *"Bắt đầu khám phá ✨"* kích hoạt hiệu ứng camera lao xuyên qua cổng không gian.

2. **Scene 2 — The Five Stars (5 Ngôi Sao Điều Nhỏ Bé & Tên Minh Thư)**:
   - 5 ngôi sao lấp lánh tương tác ẩn chứa 5 lời nhắn yêu thương.
   - Khi thu thập đủ 5 ngôi sao: Hàng ngàn hạt ánh sáng stardust bay về trung tâm, tự động kết tụ thành chữ: **"NGUYỄN THỊ MINH THƯ"** với đầy đủ dấu tiếng Việt chuẩn xác (sử dụng canvas text sampling), sau đó tan biến thành bụi sao lấp lánh.

3. **Scene 3 — Galaxy of Love (Ngân Hà Tình Yêu & Trái Tim 3D)**:
   - Thiên hà xoắn ốc 3D tuyệt mỹ với 3 quỹ đạo elip chuyển động quanh trung tâm.
   - Trái tim 3D phát sáng hồng rực rỡ, đập nhẹ nhàng theo nhịp.
   - Chạm vào trái tim: Vòng quỹ đạo tăng tốc, bão ánh sáng vũ trụ bùng nổ, chìa khóa vàng stardust kết tụ mở ra bức thư tình.

4. **Scene 4 — The Love Letter (Bức Thư Tình & Lời Chúc 20/10)**:
   - Phong bì màu ngà bay lơ lửng với con dấu sáp hình trái tim mạ vàng hồng.
   - Chạm vào phong bì: Con dấu phát sáng, phong bì mở ra, bức thư trượt lên và từng nét chữ dần xuất hiện.
   - Nút *"Anh còn một điều muốn nói..."* kích hoạt cơn mưa kim tuyến vàng, bão hạt tim hồng và lời chúc chung cuộc:
     - **"Happy 20/10, Nguyễn Thị Minh Thư ❤️"**
     - **"Anh yêu em!"**
   - Nút xem lại từ đầu.

---

## 🎨 Tùy Chỉnh Nội Dung Dễ Dàng (Personalization)

Toàn bộ lời nhắn, tên và bức thư được đặt tách biệt tại:
👉 `src/content/loveStory.ts`

Bạn có thể chỉnh sửa:
- `girlfriendName`: Tên hiển thị (được dùng để kết tụ hạt stardust ở Cảnh 2).
- `introMessages`: Lời dẫn ở Cảnh 1.
- `starMessages`: 5 lời nhắn của 5 ngôi sao ở Cảnh 2.
- `galaxyMessages`: Lời tựa ở Cảnh 3.
- `letterRecipient`: Tiêu đề người nhận ở Cảnh 4.
- `loveLetter`: Toàn bộ nội dung bức thư tình (hỗ trợ xuống dòng tự nhiên).
- `finalMessage` & `finalLoveText`: Lời tỏ tình kết thúc.
- `musicPath`: Đường dẫn file nhạc nền.

---

## 🎵 Nhạc Nền & Âm Thanh (Audio)

- **Nhạc nền**: Có nút bật/tắt (icon nốt nhạc ở góc trên bên phải). Tích hợp sẵn bộ tổng hợp âm thanh không gian (ambient cosmic synth) bằng Web Audio API để phát ngay cả khi chưa thêm file MP3.
- Để dùng bài hát yêu thích riêng (như một bản piano lãng mạn):
  1. Đổi tên file nhạc của bạn thành `background-music.mp3`.
  2. Bỏ vào thư mục `public/audio/background-music.mp3`.

---

## 📱 Tối Ưu Hóa Thiết Bị Di Động (Mobile-First)

- Tối ưu mượt mà cho mọi kích cỡ màn hình: iPhone (390px, 430px), Android (360px), iPad và Desktop.
- Số lượng hạt particle được tự động điều chỉnh thông minh (`isMobile()`) để đảm bảo 60 FPS mượt mà trên điện thoại, không gây nóng máy.
- Hỗ trợ đầy đủ cảm ứng chạm (touch interaction), không bị trượt hay zoom ngoài ý muốn.

---

## 🚀 Hướng Dẫn Triển Khai Lên Vercel (Public Deployment)

Để gửi link cho Minh Thư mở trực tiếp qua **Zalo / Messenger / Instagram / iMessage**, bạn chỉ cần đưa website lên mạng công cộng thông qua **Vercel** (miễn phí, có sẵn HTTPS).

### Cách 1: Đẩy lên GitHub rồi kết nối Vercel (Khuyên dùng - Rất nhanh & Tiện)

1. **Khởi tạo và đẩy code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: Our Little Universe for Minh Thu"
   # Tạo 1 repo trên GitHub (ví dụ: our-little-universe), sau đó:
   git remote add origin https://github.com/<your-username>/our-little-universe.git
   git branch -M main
   git push -u origin main
   ```

2. **Kết nối với Vercel:**
   - Truy cập: [https://vercel.com](https://vercel.com) (đăng nhập bằng tài khoản GitHub).
   - Bấm **"Add New..."** ➜ **"Project"**.
   - Chọn repository `our-little-universe`.
   - Vercel sẽ tự nhận diện Vite:
     - Framework Preset: `Vite`
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Bấm nút **"Deploy"**.

3. **Nhận link công khai HTTPS:**
   - Sau khoảng 1 phút, Vercel sẽ cung cấp link công khai dạng:
     `https://our-little-universe-<tên-bạn>.vercel.app`
   - Bạn có thể vào tab **Settings ➜ Domains** để đổi tên miền tùy ý hoàn toàn miễn phí (ví dụ: `https://for-minh-thu.vercel.app`).

---

### Cách 2: Triển khai trực tiếp bằng Vercel CLI từ Terminal

1. Cài đặt và đăng nhập Vercel:
   ```bash
   npx vercel login
   ```
   *(Làm theo hướng dẫn trên màn hình để xác thực qua Email hoặc GitHub)*.

2. Triển khai sản phẩm chính thức (Production):
   ```bash
   npx vercel --prod
   ```
   *(Chọn các tùy chọn mặc định bằng phím Enter)*.

3. Vercel sẽ in ra ngay lập tức URL Production HTTPS để bạn copy gửi tặng bạn gái.

---

## 🛠️ Chạy Kiểm Thử Tại Local (Development)

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động server xem thử
npm run dev

# Build kiểm tra lỗi
npm run build
```

Chúc bạn và Minh Thư có một ngày 20/10 thật ngọt ngào, đáng nhớ và ngập tràn hạnh phúc! ✨❤️
