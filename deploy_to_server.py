import os
import sys
import ftplib
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

FTP_HOST = "ftp.brmpdiy.my.id"
FTP_USER = "ftpagentmagang@brmpdiy.my.id"
FTP_PASS = "ftpagent12"

BASE_DIR = Path(__file__).resolve().parent

def upload_file(ftp, local_path, remote_path):
    print(f"Uploading: {local_path} -> {remote_path}")
    with open(local_path, "rb") as f:
        ftp.storbinary(f"STOR {remote_path}", f)

def ensure_remote_dir(ftp, dir_path):
    parts = dir_path.strip("/").split("/")
    current = ""
    for part in parts:
        if not part:
            continue
        current += "/" + part
        try:
            ftp.mkd(current)
            print(f"Created remote dir: {current}")
        except Exception:
            pass

def upload_directory(ftp, local_dir, remote_dir=""):
    for root, dirs, files in os.walk(local_dir):
        rel_path = os.path.relpath(root, local_dir).replace("\\", "/")
        if rel_path == ".":
            target_remote = remote_dir
        else:
            target_remote = f"{remote_dir}/{rel_path}".strip("/")

        if target_remote:
            ensure_remote_dir(ftp, target_remote)

        for file in files:
            local_file = os.path.join(root, file)
            remote_file = f"{target_remote}/{file}".strip("/") if target_remote else file
            upload_file(ftp, local_file, remote_file)

def main():
    print("🚀 Connecting to FTP...")
    ftp = ftplib.FTP(FTP_HOST)
    ftp.login(FTP_USER, FTP_PASS)
    print(f"✅ Connected to FTP! Root: {ftp.pwd()}")

    # 1. Upload root favicon and logo
    upload_file(ftp, BASE_DIR / "favicon.ico", "favicon.ico")
    upload_file(ftp, BASE_DIR / "logo-brmp.png", "logo-brmp.png")
    upload_file(ftp, BASE_DIR / ".htaccess", ".htaccess")
    upload_file(ftp, BASE_DIR / "index.php", "index.php")
    upload_file(ftp, BASE_DIR / "admin.php", "admin.php")
    upload_file(ftp, BASE_DIR / "api.php", "api.php")
    upload_file(ftp, BASE_DIR / "config.php", "config.php")

    # 2. Upload dist folder recursively
    print("\n📦 Uploading dist directory...")
    upload_directory(ftp, BASE_DIR / "dist", "dist")

    # 3. Remove deploy_magang.zip from server to save space
    try:
        ftp.delete("deploy_magang.zip")
        print("🗑️ Cleaned up deploy_magang.zip on server")
    except Exception:
        pass

    ftp.quit()
    print("\n🎉 Deployment completed successfully!")

if __name__ == "__main__":
    main()
