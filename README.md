# beckend-related-project
MyFinance — Shaxsiy moliya
MyFinance — daromad va xarajatlarni yuritish, moliyaviy maqsad qo'yish va eng ko'p pul sarflanayotgan kategoriyani ko'rish uchun oddiy veb-ilova. Frontend sof HTML, CSS va JavaScript'da yozilgan, backend esa tashqi kutubxonasiz Node.js'da.


Imkoniyatlar
Tranzaksiya qo'shish, tahrirlash va o'chirish (daromad / xarajat)
Umumiy balans, jami daromad va jami xarajatni avtomatik hisoblash
Tranzaksiyalarni Barchasi / Daromad / Xarajat bo'yicha filtrlash
Izoh, kategoriya, sana, tur va summa bo'yicha qidirish
Moliyaviy maqsad qo'yish va uning bajarilish foizini ko'rish
Eng ko'p sarflangan kategoriyani ko'rsatish
Telefon va planshet ekranlariga moslashgan dizayn
Texnologiyalar
Qism	    
Frontend	HTML, CSS, JavaScript (kutubxonasiz)
Backend	    Node.js (node:http),tashqi paketlarsiz
Saqlash	    Tranzaksiyalar server xotirasida, maqsad brauzerning localStorage'ida
Loyiha tuzilishi


API
Barcha javoblar JSON formatida.
Metod	Manzil	Vazifasi
GET	/transactions	Barcha tranzaksiyalar ro'yxati
POST	/transactions	Yangi tranzaksiya qo'shish
PUT	/transactions/:id	Tranzaksiyani yangilash
DELETE	/transactions/:id	Tranzaksiyani o'chirish
Tranzaksiya tuzilishi:
json
{
  "category": "Oziq-ovqat",
  "izoh": "Bozor",
  "date": "2026-11-08",
  "type": "outcome",
  "amount": 200000
}
type faqat income (daromad) yoki outcome (xarajat) bo'lishi mumkin.
date YYYY-MM-DD formatida, amount noldan katta son bo'lishi kerak.
Muvaffaqiyatli POST va PUT javobida "status": "success" maydoni qaytadi.
Noto'g'ri ma'lumot 400, topilmagan tranzaksiya 404, juda katta so'rov 413 xatosini qaytaradi.
Deploy qilish 

Sozlamalar:
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free

Cheklovlar
Ma'lumot doimiy saqlanmaydi. Tranzaksiyalar server xotirasida turadi va server qayta ishga tushganda yoki uxlaganda o'chib ketadi. Maqsad esa brauzerda qoladi.
Hozircha faqat so'm (UZS) bilan ishlaydi.
Limitlar: bitta so'rov 10 KB gacha, ro'yxatda 1000 tagacha tranzaksiya.
![Myfinance bosh sahifasi](./docs/bosh%20sahifa.png)
![Sayt ishga tushurilgan holat](./docs/ishga%20tushurilgan%20holat.png)
![qidiruv holati ishlashi](./docs/qidiruv%20ishga%20tushurilgan%20holat.png)