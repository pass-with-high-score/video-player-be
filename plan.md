Ok, mình lên **plan backend MVP** cho video player kiểu **TikTok / YouTube** (tập trung xem video, feed, upload cơ bản). Mục tiêu: **chạy được – mở rộng được – không over-engineering**.

---

## 1. Phạm vi MVP (rất quan trọng)

### 🎯 Use cases bắt buộc

1. Người dùng xem video (scroll feed / list)
2. Stream video mượt (adaptive bitrate)
3. Upload video
4. Đếm view
5. Like video
6. Comment (đơn giản)
7. Auth cơ bản (JWT)

❌ Chưa cần cho MVP:

* Recommendation AI phức tạp
* Livestream
* Monetization
* Search nâng cao
* CDN custom

---

## 2. Kiến trúc tổng thể (MVP-friendly)

```
Client (Web / Mobile)
        |
        v
API Gateway (REST)
        |
------------------------------------------------
| Auth | Video | Interaction | Feed | User |
------------------------------------------------
        |
 Object Storage (S3/MinIO)
        |
 Video Transcoding (FFmpeg / Cloud service)
        |
 CDN (Cloudflare / CloudFront)
```

👉 **Quan trọng**: Video **KHÔNG stream qua backend**, backend chỉ:

* cấp URL
* quản lý metadata
* xác thực

---

## 3. Tech Stack đề xuất (thực tế & dễ scale)

### Backend

* **Language**: NestJS
* **API**: REST
* **Auth**: JWT + Refresh token

### Database

* **PostgreSQL** – dữ liệu chính
* **Redis** – cache feed, view count
* (Optional) **ElasticSearch** – search sau

### Video

* **Storage**: S3 (thư viện aws nhưng storage của cloudflare R2)
* **Transcoding**:

  * MVP local: FFmpeg + worker
  * Cloud: AWS MediaConvert / Cloudflare Stream
* **Streaming**: HLS (`.m3u8`)

---

## 4. Database schema (MVP)

### users

```sql
id
username
email
password_hash
created_at
```

### videos

```sql
id
user_id
title
description
video_url
thumbnail_url
duration
status (processing / ready)
view_count
created_at
```

### video_files

```sql
id
video_id
quality (240p, 480p, 720p)
file_url
```

### likes

```sql
user_id
video_id
created_at
```

### comments

```sql
id
user_id
video_id
content
created_at
```

---

## 5. API Design (đủ dùng)

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### Video

```
POST   /videos/upload        (signed URL)
GET    /videos/:id
GET    /feed
POST   /videos/:id/view
POST   /videos/:id/like
```

### Comment

```
GET  /videos/:id/comments
POST /videos/:id/comments
```

---

## 6. Upload & Streaming Flow (rất quan trọng)

### Upload video

1. Client → Backend: request upload
2. Backend → trả **signed URL**
3. Client upload trực tiếp lên S3
4. Backend nhận callback → queue transcoding
5. FFmpeg → HLS (`240p, 480p, 720p`)
6. Lưu metadata → status = `ready`

### Xem video

1. Client gọi `/feed`
2. Backend trả danh sách video + HLS URL
3. Client stream trực tiếp từ CDN

---

## 7. Feed MVP (chưa AI)

Cách đơn giản:

```sql
SELECT * FROM videos
WHERE status = 'ready'
ORDER BY created_at DESC
LIMIT 20
```

Cách tốt hơn:

* Redis cache feed
* Trộn:

  * video mới
  * video nhiều view
  * video user follow (sau)

---

## 8. View count & Like (chuẩn TikTok)

* View:

  * Client xem > X giây → call API
  * Redis `INCR`
  * Batch sync về DB

* Like:

  * Redis Set `video:{id}:likes`
  * Async sync DB

---

## 9. Security & Performance MVP

* Rate limit (upload, view)
* Signed URL có expiry
* Không expose S3 public
* CDN cache HLS
* Pagination cursor-based

---

## 10. Timeline build MVP (thực tế)

### Tuần 1

* Auth
* User
* Video upload
* Video metadata

### Tuần 2

* Transcoding
* Streaming HLS
* Feed
* View count

### Tuần 3

* Like / Comment
* Redis cache
* Deploy (Docker)

---

## 11. Khi scale (để sau)

* Kafka cho events
* Recommendation service
* Multi-region CDN
* Sharding video table

---
