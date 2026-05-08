# Admin Scripts

Manual admin tools. Production DB-yə birbaşa təsir edirlər — diqqətli istifadə.

## promote-user.ts

İstifadəçini admin roluna keçir.

```bash
npx tsx scripts/admin/promote-user.ts <email> [role]
```

## reset-user-password.ts

İstifadəçinin şifrəsini sıfırla (bcrypt hash).

```bash
npx tsx scripts/admin/reset-user-password.ts <email> <new-password>
```

**Diqqət:** `DATABASE_URL` env-i cari shell-də production-a baxırsa, real DB-yə yazır.
