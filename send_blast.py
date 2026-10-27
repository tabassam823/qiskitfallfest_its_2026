"""
Script Pengiriman Email Blast HTML - Qiskit Fall Fest ITS 2026
-------------------------------------------------------------
Persyaratan:
1. Akun Gmail pengirim (misal: qff.its@gmail.com)
2. Buat "App Password" (Sandi Aplikasi) di Google Account:
   Ke https://myaccount.google.com/apppasswords -> Buat nama "QFF Mailer" -> Salin 16 digit password.
"""

import smtplib
import csv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ================= KONFIGURASI =================
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465  # SSL
SENDER_EMAIL = "qff.its@gmail.com"
SENDER_PASSWORD = "xxxx xxxx xxxx xxxx"  # Masukkan 16-digit Google App Password di sini

HTML_TEMPLATE_PATH = "email-template.html"
CSV_PATH = "assets/Qiskit Fall Fest 2026 Sepuluh Nopember Institute of Technology (Jawaban) - Form Responses 1.csv"
EMAIL_SUBJECT = "[Qiskit Fall Fest ITS 2026] Important Session Information & Preparation"
# ===============================================

def load_template(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def send_emails(is_dry_run=True):
    template = load_template(HTML_TEMPLATE_PATH)

    if not is_dry_run:
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        print(f"✅ Berhasil terhubung ke server SMTP sebagai {SENDER_EMAIL}")
    else:
        print("⚠️ Mode DRY-RUN (Simulasi): Email tidak akan benar-benar terkirim.\n")

    with open(CSV_PATH, mode="r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        
        count = 0
        for row in reader:
            full_name = row.get("Full Name", "").strip()
            # Cek kolom email alternatif jika ada
            recipient_email = row.get("e-mail", "").strip() or row.get("Email Address", "").strip()

            if not recipient_email or "@" not in recipient_email:
                continue

            count += 1
            # Personalisasi nama peserta
            personalized_html = template.replace("[Participant Name]", full_name if full_name else "Participant")

            if is_dry_run:
                print(f"[Simulasi {count}] Kirim ke: {full_name} <{recipient_email}>")
            else:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = EMAIL_SUBJECT
                msg["From"] = f"Qiskit Fall Fest ITS 2026 <{SENDER_EMAIL}>"
                msg["To"] = recipient_email

                part_html = MIMEText(personalized_html, "html", "utf-8")
                msg.attach(part_html)

                try:
                    server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
                    print(f"[{count}] Terkirim ke: {full_name} <{recipient_email}>")
                except Exception as e:
                    print(f"❌ Gagal mengirim ke {recipient_email}: {e}")

    if not is_dry_run:
        server.quit()
        print(f"\n🎉 Selesai! Total {count} email berhasil dikirim.")
    else:
        print(f"\n💡 Total data valid ditemukan: {count} peserta. Ubah is_dry_run=False untuk mengirim sungguhan.")

if __name__ == "__main__":
    # Jalankan simulasi terlebih dahulu
    send_emails(is_dry_run=True)
