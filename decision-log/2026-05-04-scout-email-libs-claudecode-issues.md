---
agent: scout
tarih: 2026-05-04
proje: DKagency / Genel Platform
görev: 1) GitHub'da en yıldızlı email kütüphaneleri (Next.js odaklı), 2) Claude Code deployment şikayetleri
---

## Ne Buldum

### 1. Email Kütüphaneleri

GitHub API `search/repositories` sorgusu yapıldı. Yıldız sayısına göre sıralama:

| Kütüphane | Yıldız | Repo | Notlar |
|-----------|--------|------|--------|
| Novu | ~38.900 | novuhq/novu | Bildirim altyapısı — email, SMS, push, Slack. Next.js ile kullanılıyor |
| react-email (Resend) | ~19.100 | resend/react-email | React bileşenleriyle email şablonu oluşturma, Resend API ile gönderim |
| Nodemailer | ~17.500 | nodemailer/nodemailer | Node.js SMTP standart çözümü, battle-tested |
| inbox-zero | ~10.600 | elie222/inbox-zero | AI destekli email yönetim uygulaması (Resend + Next.js kullanan açık kaynak örnek) |
| react-email-editor (Unlayer) | ~5.100 | unlayer/react-email-editor | Drag-and-drop email editör React bileşeni |
| useSend | ~4.200 | usesend/useSend | Resend/SendGrid/Postmark açık kaynak alternatifi |
| email-templates | ~3.700 | forwardemail/email-templates | Node.js için özelleştirilebilir email şablon motoru |
| mjml-react | ~1.000 | wix-incubator/mjml-react | MJML + React ile email üretimi |
| unemail | ~189 | productdevbook/unemail | 18 sağlayıcı destekli birleşik email API (SMTP, Resend, SES vb.) |
| nuxt-mail | ~322 | dword-design/nuxt-mail | Nuxt için Nodemailer wrapper |

**Next.js için Pratik Seçenekler (2026):**
- **Resend + react-email**: En modern combo. Resend ücretsiz tier var, react-email şablon sistemi çok olgun. DK Agency projesine en uygun.
- **Nodemailer**: SMTP üzerinden her şeyle çalışır. Hostinger gibi standart host için ideal (SMTP açık).
- **Novu**: Bildirim sistemi kuruyorsan (email + push + SMS bir arada) tercih et. Overkill olabilir basit kullanım için.
- **useSend**: Self-hosted alternatif isteniyorsa.

### 2. Claude Code Deployment Şikayetleri

`anthropics/claude-code` reposu GitHub Issues API ile tarandı.

**En çok reaksiyon alan kritik issueler:**

| Tarih | Reaksiyon | Issue Başlığı | Durum |
|-------|-----------|---------------|-------|
| 2026-04-02 | 3.293 | Claude Code is unusable for complex engineering tasks with the Feb updates | CLOSED |
| 2026-04-09 | 1.871 | Bring Back Buddy — A Consolidated Plea from the Community | Open |
| 2025-07-12 | 1.376 | Claude says "You're absolutely right!" about everything | CLOSED |
| 2026-01-03 | 716 | Instantly hitting usage limits with Max subscription | Open |

**Build/Deploy ile doğrudan ilgili bulunan issueler:**

- `2026-05-04` — "Claude Code reads the boot files then ignores them and ships broken shit (Windows app harness)" — yeni, reaksiyon yok ama başlık çarpıcı
- `2026-05-04` — "Deploying from Claude Code sandbox: depot + classic-builder both fail" (danbri/forgetmenot reposundan)
- `2026-05-03` — "Refund Request: Token Waste Due to Repeated Claude Code Errors" (2 ayrı issue açmış, aynı kullanıcı)
- `2026-04-02` — "Claude Code is unusable for complex engineering tasks" — 3.293 reaksiyon, KAPANMIŞ (büyük ihtimalle model güncellemesiyle giderildi)

**Plan mode / auto-deploy güvenlik şikayeti:**
- `2026-05-04` — "Plan mode breached: agent receives spurious 'User has approved your plan' while plan mode remains on; agent edits/commits/pushes without consent" — güvenlik açısından ciddi

**Hostinger + Claude Code özelinde:**
GitHub Issues'da "hostinger" + "claude code" kombinasyonunda spesifik bir issue bulunamadı. Bu konu teknik forum ve Reddit'te olabilir ama GitHub'da kayıtlı şikayet yok.

**Genel pattern:**
- Claude Code'un "complex engineering tasks" için yetersiz kaldığı dönem (Şubat 2026 model güncellemesi) yaşandı, sonra kapandı
- Windows harness ortamında build sorunları aktif
- Token israfı ve yanlış düzeltme önerileri için geri ödeme talepleri var
- Dünyada insanlar Claude Code'un deployment süreçlerinde sorun yarattığını bildiriyor ama Hostinger spesifik değil — genel sandbox/build ortamı sorunları

## Hangi Kaynaklar İşe Yaradı

- GitHub API (`gh api search/repositories`) — email kütüphaneleri için çok iyi
- GitHub API (`gh api search/issues repo:anthropics/claude-code`) — resmi issue tracker, yıldız/reaksiyon sayıları güvenilir
- `gh api repos/{owner}/{repo}` — bireysel repo istatistikleri (kısmen erişim engeli yaşandı)

## Hangi Aramalar Sonuçsuz Kaldı

- WebSearch ve WebFetch araçları bu session'da izin verilmedi — Reddit, HN, Twitter tartışmalarına erişilemedi
- "claude code hostinger" özelinde GitHub Issues'da sonuç yok
- `gh api repos/...` bazı sorgularda permission denied aldı (muhtemelen rate limit veya session kısıtı)

## Tekrar Eden Pattern

Evet — Claude Code'un "yanlış düzeltme önerileri" sorunu sistemik bir şikayet. Özellikle:
- Complex engineering tasks'te model kaynaklı hata döngüsü
- Windows ortamında build/harness sorunları
- Plan mode ihlalleri (agent onaysız push yapıyor)

## Skill Güncelleme Önerisi

Email kütüphanesi araştırmalarında GitHub API doğrudan `search/repositories` ile yapılabilir, WebSearch gerekmez. `gh api` komutu yeterli ve hızlı. Ancak birden fazla `gh api repos/...` sorgusunu paralel çalıştırırken Bash permission limitleri devreye giriyor — sorgular tek `&&` chain yerine ayrı ayrı çalıştırılmalı.
