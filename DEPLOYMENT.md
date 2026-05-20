# Déploiement TAOMAN (SaaS)

## Variables backend (Render)

- `DATABASE_URL` — PostgreSQL Neon
- `JWT_SECRET`
- `FRONTEND_CLIENT_URL` — URL vitrine (Vercel)
- `FRONTEND_ADMIN_URL` — URL admin (Vercel)
- `RESEND_API_KEY`, `MAIL_FROM`
- `ADMIN_ALERT_EMAIL` — alertes nouveaux contacts/devis
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Ordre de déploiement

1. `npx prisma db push` (schéma Media.publicId, Backup.url)
2. Déployer le **backend**
3. Rebuild + déployer **admin** et **vitrine** (`VITE_API_URL` au build)

## Cloudinary

Les images et sauvegardes JSON sont stockées sur Cloudinary (`taoman/media`, `taoman/backups`).
Ne pas committer les secrets ; les régénérer si exposés.

## Migration médias locaux

Après configuration Cloudinary : `POST /media/migrate-to-cloudinary` (JWT admin).
