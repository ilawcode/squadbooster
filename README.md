# SquadBooster 🚀

Squad'ınızın planlama toplantılarını, review'larını ve diğer ritüellerini takip edebileceğiniz; aksiyonları yönetip takım üyelerine atayabileceğiniz modern bir web uygulaması.

## 🌟 Özellikler

- **Aksiyon Yönetimi**: Görevleri Kanban tahtasında (Yapılacak/Devam/Bitti) takip edin.
- **Ritüel Takibi**: Planning, Review, Retro gibi etkinlikleri planlayın ve katılımcıları yönetin.
- **Takım Yönetimi**: Ekip üyelerini görüntüleyin ve yönetin.
- **Modern Arayüz**: Canlı renkler, responsive tasarım ve kullanıcı dostu arayüz.
- **Basit Giriş**: Kullanıcı adı ile şifresiz hızlı giriş.

## 🛠 Teknolojiler

- **Frontend**: React, Vite, Tailwind-like Custom CSS
- **Backend**: Node.js, Express
- **Veritabanı**: MongoDB
- **Paketler**: Mongoose, Date-fns, Lucide React, React Router

## 🚀 Kurulum ve Çalıştırma

1. Repoyu klonlayın ve proje dizinine gidin.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. `.env` dosyasını oluşturun (örnek dosya mevcut):
   ```bash
   cp .env.example .env
   ```
4. MongoDB bağlantı adresinizi `.env` dosyasına ekleyin.
5. Uygulamayı başlatın (Backend + Frontend):
   ```bash
   npm run dev
   ```

## 🔌 Port Bilgileri

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001

> Not: Backend portu macOS AirPlay Receiver çakışmasını önlemek için standart dışı olarak **5001** seçilmiştir.

## 📝 Kullanım

- Uygulama açıldığında isminizle giriş yapın.
- Dashboard üzerinden kişisel görevlerinizi ve yaklaşan toplantıları görün.
- "Aksiyonlar" menüsünden yeni görevler ekleyin ve durumlarını sürükle-bırak mantığıyla güncelleyin.
- "Ritüeller" menüsünden takım etkinliklerini planlayın.

---
Squad'ınızı ateşleyin! 🔥
