mini-saas-subscription-backend — Subscription & Plan Management API

Amaç

SaaS plan/abonelik yaşam döngüsü + fake ödeme + webhook simülasyonu.

Stack
	•	Backend: NestJS (TypeScript)
	•	ORM: Prisma
	•	DB: PostgreSQL
	•	Queue: BullMQ + Redis (webhook retry / invoice jobs)
	•	Docs: Swagger
	•	Test: Jest + supertest

MVP Özellikler
	•	Plans: Free / Pro / Enterprise (seed)
	•	Subscription lifecycle: create → active → cancel → expired
	•	Fake payment: “başarılı/başarısız” senaryoları
	•	Webhook simulator: event üret, retry, idempotency

Veri Modeli
	•	Plan(id, name, price, interval, features jsonb)
	•	Customer(user_id)
	•	Subscription(customer_id, plan_id, status, current_period_end)
	•	Invoice(subscription_id, amount, status)
	•	WebhookEvent(type, payload, status, attempts, next_retry_at)

Endpoint Planı
	•	GET /api/v1/plans
	•	POST /api/v1/subscriptions (subscribe)
	•	POST /api/v1/subscriptions/{id}/cancel
	•	GET /api/v1/subscriptions/me
	•	POST /api/v1/payments/checkout (fake)
	•	POST /api/v1/webhooks/provider (simulated receiver)
	•	GET /api/v1/webhooks/events (admin)

Docker
	•	api + db(postgres) + redis
	•	worker (queue consumer)

Milestones
	1.	Plans seed + subscription CRUD
	2.	Fake payment + invoice
	3.	Webhook events + retry/idempotency
	4.	Docs + tests + CI

Çalıştırma Deneyimi
Altta sıraladıklarım proje içerisinde kullanılması gerekiyor ise kullanman gereken özellikleri yazıyor. Mesela mail gönderilmeyecek bir uygulamada mail ile ilgili olanı kullanmana gerek yok gibi.
	•	docker compose up --build ile ayağa kalkacak.
	•	compose.yml içinde tipik servisler:
	•	api (backend)
	•	web (Next.js varsa)
	•	db (postgres)
	•	opsiyonel: redis, worker, minio, mailhog, flower
	•	.env.example → tek kopyalama ile çalışır.

Kalite & Ürün Hissi
	•	OpenAPI/Swagger (backend API’lerde)
	•	Test: unit + integration (auth/permission kritik)
	•	CI (GitHub Actions):
	•	lint + test
	•	docker build
	•	Kaliteli profesyonel duran bir Readme.md dosyası yazılması.