# Food Order Frontend - Huong Dan Su Dung

Tai lieu nay chi tap trung vao cach cai dat, chay, va su dung phan mem.

## 1. Cai dat va khoi dong

### 1.1 Yeu cau

- Node.js 18+
- npm 9+
- Backend da chay san (repo backend)

### 1.2 Cai package

Trong thu muc frontend, chay:

```bash
npm install
```

### 1.3 Cau hinh bien moi truong

Tao file .env.local (neu chay local) hoac cau hinh env tren Vercel (neu deploy).

Mau env local:

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=655329545938-e6c3952igeh167tt0tdrvjsqbmmrltdp.apps.googleusercontent.com
VITE_ENABLE_GOOGLE_LOGIN=true
VITE_GOOGLE_API_KEY=
VITE_PERSONAL_QR_IMAGE_URL=
```

### 1.4 Chay du an

```bash
npm run dev
```

Frontend mac dinh tai: http://localhost:5173

## 2. Huong dan su dung cho nguoi dung

## 2.1 Vai tro khach hang

1. Dang ky hoac dang nhap.
2. Vao Menu de xem danh sach mon.
3. Chon so luong va them vao gio hang.
4. Vao Gio hang, nhap thong tin giao hang, dat don.
5. Vao Don hang de xem lich su don.
6. Mo Chi tiet don de xem:
   - Trang thai xu ly
   - Danh sach mon
   - Tong tien
7. Khi don giao thanh cong, gui danh gia va binh luan.

## 2.2 Vai tro admin

1. Dang nhap tai khoan admin.
2. Vao Quyen Quan ly.
3. Su dung cac module:
   - Dashboard
   - Tai khoan
   - Khuyen mai
   - Thuc don
   - Don hang
   - Binh luan
   - Thanh toan
4. Quan ly trang thai don theo luong:
   - pending -> confirmed -> preparing -> ready -> shipping -> delivered
5. Vao Thanh toan de xu ly don va in hoa don.
6. Duyet binh luan cua khach trong module Binh luan.

## 3. In hoa don trong web

1. Tai trang Thanh toan hoac Chi tiet don, bam In hoa don.
2. He thong mo trang hoa don trong cung tab.
3. Bam nut In hoa don tren giao dien.
4. Trinh duyet su dung print dialog de in truc tiep.

## 4. Su dung ban da deploy (Vercel + Render)

Cap nhat 2 link thuc te vao day:

- Frontend (Vercel): https://your-frontend.vercel.app
- Backend (Render): https://your-backend.onrender.com

Quy trinh su dung:

1. Mo link frontend Vercel.
2. Dang nhap user de dat don.
3. Dang nhap admin de xu ly don, thanh toan, in hoa don.
4. Kiem tra backend online bang link Render.

## 5. Build ban production

```bash
npm run build
npm run preview
```

## 6. Tom tat tinh nang nguoi dung co the thao tac

- Dang ky, dang nhap, dang nhap Google
- Xem menu, dat don, theo doi don
- Danh gia sau khi giao thanh cong
- Admin quan tri don hang, tai khoan, mon an, khuyen mai, binh luan
- In hoa don co QR thanh toan
