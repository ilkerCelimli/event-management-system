# Etkinlik Yönetim Sistemi (Event Management System)

Java **17** + **Spring Boot 3.3** + **PostgreSQL** ile geliştirilmiş, JWT tabanlı
kimlik doğrulamalı bir etkinlik yönetim (RSVP) REST API'si.

## Özellikler

- **Kullanıcılar**: Kayıt, giriş, roller (`ORGANIZER`, `ATTENDEE`, `ADMIN`)
- **Etkinlikler**: Oluşturma, güncelleme, silme, durum yönetimi
  (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`), kategoriler, mekan, zaman
- **Arama**: Başlık / kategori / şehir bazlı filtreli, sayfalı arama
- **Kayıt (RSVP)**: Kapasite dolduysa **WAITLISTED**, iptal edilebilir
- **Güvenlik**: BCrypt şifre hash'i + HS256 JWT, rol bazlı yetkilendirme
- **Örnek veri**: İlk açılışta demo kullanıcılar, etkinlikler ve kayıt ekler

## Proje Yapısı

```
src/main/java/com/example/eventmgmt/
├── config/          # SecurityConfig (JWT/CORS), DataInitializer (seed)
├── controller/      # Auth, Event, Registration, User
├── dto/             # Request/Response record'ları (+ bean validation)
├── exception/       # HTTP hata işleme (
NotFoundException, ConflictException, ...)
├── model/
│   ├── entity/      # User, Event, Registration
│   └── enum/        # Role, EventStatus, EventCategory, RegistrationStatus
├── repository/      # Spring Data JPA arayüzleri
├── security/        # JwtUtil, JwtAuthFilter, CustomUserDetailsService
└── service/         # İş mantığı
```

## Gereksinimler

- JDK 17+
- Maven 3.8+
- PostgreSQL 13+

## Kurulum ve Çalıştırma

1) PostgreSQL'de veritabanı oluşturun (istediğiniz gibi `eventdb`):

```sql
CREATE DATABASE eventdb;
```

2) Bağlantı bilgilerini ayarlayın (ortam değişkenleri veya varsayılanlar):

```bash
# Windows (PowerShell)
set DATASOURCE_URL=jdbc:postgresql://localhost:5432/eventdb
set DB_USERNAME=postgres
set DB_PASSWORD=postgres
set APP_JWT_SECRET=buraya-en-az-32-karakter-rastgele-bir-anahtar
```

3) Uygulamayı başlatın:

```bash
mvn spring-boot:run
```

Uygulama `http://localhost:8080` adresinde ayağa kalkar; şema `ddl-auto: update`
sayesinde otomatik oluşturulur. İlk çalıştırmada demo veriler yüklenir
(`app.seed-enabled=false` ile kapatılabilir).

## Front-end (React + Vite)

`frontend/` klasöründe React tabanlı, token tabanlı bir yönetim arayüzü bulunur:
giriş/kayıt, etkinlik arama, detay + RSVP, organizatör paneli (oluştur/düzenle/
durum değiştir/sil), "Kayıtlarım" ve yönetici kullanıcı listesi.

Vite dev sunucusu `/api` isteklerini otomatik olarak `http://localhost:8080`
adresine yönlendirdiği için CORS sorunu yaşanmaz.

```bash
cd frontend
npm install      # bağımlılıkları kur
npm run dev      # geliştirme sunucusu -> http://localhost:3000
npm run build    # üretim derlemesi -> frontend/dist
```

> Not: Windows'ta `npm` yerine gerekirse `npm.cmd` komutunu kullanın.

Front-end'i üretimde Spring Boot ile aynı origin'de sunmak isterseniz
`frontend/dist` içeriğini `src/main/resources/static/` altına kopyalayıp
uygulamayı yeniden başlatabilirsiniz (uygulama `http://localhost:8080` üzerinden
tüm arayüzü kendi sunar).

## Demo Hesap (seed sonrası)

| Rol         | Kullanıcı adı | Şifre           |
|-------------|---------------|-----------------|
| ADMIN       | `admin`       | `admin123`      |
| ORGANIZER   | `organizer`   | `organizer123`  |
| ATTENDEE    | `attendee`    | `attendee123`   |

## API Özeti

### Kimlik doğrulama (public)
| Method | Path                 | Açıklama              |
|--------|----------------------|-----------------------|
| POST   | `/api/auth/register` | Yeni kullanıcı kaydı  |
| POST   | `/api/auth/login`    | Token al (`Bearer`)   |

### Etkinlikler
| Method | Path                           | Erişim                  |
|--------|--------------------------------|-------------------------|
| GET    | `/api/events`                  | Public (PUBLISHED)      |
| GET    | `/api/events/search?title=&category=&city=&includeCancelled=` | Public |
| GET    | `/api/events/{id}`             | Public                  |
| GET    | `/api/events/organizer/{id}`   | Public                  |
| POST   | `/api/events`                  | ORGANIZER/ADMIN         |
| PUT    | `/api/events/{id}`             | Sahibi / ADMIN          |
| PATCH  | `/api/events/{id}/status`      | Sahibi / ADMIN          |
| DELETE | `/api/events/{id}`             | Sahibi / ADMIN          |

### Kayıtlar (RSVP)
| Method | Path                            | Erişim            |
|--------|---------------------------------|-------------------|
| POST   | `/api/registrations`            | Giriş yapan       |
| GET    | `/api/registrations/me`         | Giriş yapan       |
| GET    | `/api/registrations/event/{id}` | Organizatör/ADMIN |
| DELETE | `/api/registrations/{eventId}`  | Giriş yapan       |

### Kullanıcılar
| Method | Path           | Erişim      |
|--------|----------------|-------------|
| GET    | `/api/users`   | ADMIN       |
| GET    | `/api/users/me`| Giriş yapan |

Korumalı uç noktalarda istek başlığı:
```
Authorization: Bearer <token>
```

## Örnek İstekler

```bash
# Giriş yap
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"organizer","password":"organizer123"}'

# Etkinlik oluştur (TOKEN değişkenine login yanıtındaki token'ı yazın)
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
        "title": "Java Day",
        "description": "Java ve ekosistemi üzerine konferans",
        "category": "CONFERENCE",
        "venueName": "Kongre Merkezi",
        "city": "İstanbul",
        "startTime": "2026-10-01T09:00:00",
        "endTime": "2026-10-01T18:00:00",
        "capacity": 150
      }'
```

## Manuel DB Kurulumu (isteğe bağlı)

Hibernate'ın şemayı kendisi oluşturması yerine el ile kurmak isterseniz:
`src/main/resources/db/init.sql` dosyasını inceleyip `psql` ile çalıştırabilirsiniz.

## Not

- `application.yml` içindeki JWT secret varsayılan olarak yalnızca **geliştirme**
  içindir; üretimde mutlaka `APP_JWT_SECRET` ortam değişkeniyle değiştirin.
- CORS yalnızca `http://localhost:3000` ve `http://localhost:5173` için açıktır.