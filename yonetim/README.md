# Frida Şaşal Su Selçuk Yönetim

Telefon ve bilgisayarda aynı bulut verisini kullanan, mobil uyumlu web uygulaması (PWA).

## Kurulum özeti
1. Supabase hesabı açın ve yeni bir proje oluşturun.
2. Supabase > SQL Editor ekranında `schema.sql` dosyasının tamamını çalıştırın.
3. Supabase > Project Settings > API ekranından Project URL ve anon/public key değerlerini alın.
4. `config.js` dosyasındaki `SUPABASE_PROJECT_URL` ve `SUPABASE_ANON_PUBLIC_KEY` metinlerini kendi değerlerinizle değiştirin.
5. Bu klasörü GitHub Pages veya HTTPS destekleyen bir web barındırma servisine yükleyin.
6. Siteyi açın, e-posta ve şifre ile hesap oluşturun. Aynı hesapla telefondan ve bilgisayardan giriş yapın.

## Telefona uygulama gibi ekleme
Android Chrome'da siteyi açın > üç nokta > Ana ekrana ekle / Uygulamayı yükle.

## Önemli
- `anon/public` anahtarı tarayıcıda kullanılmak içindir. `service_role` veya gizli anahtar kesinlikle `config.js` içine konmamalıdır.
- Bu ilk sürüm kayıtları buluta yazar ve kullanıcı hesabına göre RLS ile ayırır.
- İşletme kayıtlarını düzenleme/silme, gelişmiş fatura, çok kullanıcılı yetkilendirme ve otomatik yedekleme sonraki sürümlerde eklenebilir.
- Satış, gider ve stok işlemleri temel işletme takibi içindir; resmi muhasebe/e-Fatura yerine geçmez.
