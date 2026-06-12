---
name: News Detail Content Bug — getNewsArticleBySlug Missing Content Columns
description: Public news detail shows blank content — SELECT eksik contentAz/Ru/En/Tr, fix yöntemi belgelenmiş
type: project
---

getNewsArticleBySlug() fonksiyonu buildPublicArticleSelect() helper'ını kullanmıyor.
4 content kolonu (contentAz/Ru/En/Tr) SELECT'e dahil değil → article.content = '' → detail page render etmiyor.

**Why:** PR #339 isManual flag tespitini düzeltti ama content SELECT eksikliğini düzeltmedi.

**How to apply:** Fix için getNewsArticleBySlug() SELECT listesine 4 content kolonunu ekle
VEYA buildPublicArticleSelect() + status filter kombinasyonuna geç.
updateNewsArticleAdmin() de contentAz almıyor — edit modal'a content alanı eklenmeli.
