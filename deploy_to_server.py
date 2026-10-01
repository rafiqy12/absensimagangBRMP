import os
import sys
import time
import ftplib
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

FTP_HOST = "ftp.brmpdiy.my.id"
FTP_USER = "ftpagentmagang@brmpdiy.my.id"
FTP_PASS = "ftpagent12"

BASE_DIR = Path(__file__).resolve().parent

def connect_ftp():
    for attempt in range(5):
        try:
            print(f"Connecting to FTP (attempt {attempt + 1})...")
            ftp = ftplib.FTP(FTP_HOST, timeout=30)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            return ftp
        except Exception as e:
            print(f"Connection attempt failed: {e}. Retrying in 2s...")
            time.sleep(2)
    raise RuntimeError("Failed to connect to FTP after 5 attempts")

class FTPUploader:
    def __init__(self):
        self.ftp = connect_ftp()

    def ensure_connected(self):
        try:
            self.ftp.voidcmd("NOOP")
        except Exception:
            print("FTP connection dropped. Reconnecting...")
            try:
                self.ftp.quit()
            except Exception:
                pass
            self.ftp = connect_ftp()

    def upload_file(self, local_path, remote_path):
        for attempt in range(3):
            self.ensure_connected()
            try:
                print(f"Uploading: {local_path} -> {remote_path}")
                with open(local_path, "rb") as f:
                    self.ftp.storbinary(f"STOR {remote_path}", f)
                return
            except Exception as e:
                print(f"Upload error on {remote_path} (attempt {attempt + 1}): {e}")
                time.sleep(2)
                try:
                    self.ftp.quit()
                except Exception:
                    pass
                self.ftp = connect_ftp()
        print(f"Failed to upload {remote_path} after 3 attempts")

    def ensure_remote_dir(self, dir_path):
        self.ensure_connected()
        parts = dir_path.strip("/").split("/")
        current = ""
        for part in parts:
            if not part:
                continue
            current += "/" + part
            try:
                self.ftp.mkd(current)
                print(f"Created remote dir: {current}")
            except Exception:
                pass

    def upload_directory(self, local_dir, remote_dir=""):
        for root, dirs, files in os.walk(local_dir):
            rel_path = os.path.relpath(root, local_dir).replace("\\", "/")
            if rel_path == ".":
                target_remote = remote_dir
            else:
                target_remote = f"{remote_dir}/{rel_path}".strip("/")

            if target_remote:
                self.ensure_remote_dir(target_remote)

            for file in files:
                local_file = os.path.join(root, file)
                remote_file = f"{target_remote}/{file}".strip("/") if target_remote else file
                self.upload_file(local_file, remote_file)
                time.sleep(0.05)

    def close(self):
        try:
            self.ftp.quit()
        except Exception:
            pass

def main():
    print("🚀 Starting robust FTP deployment to Rumahweb...")
    uploader = FTPUploader()

    # 1. Upload root configuration and php files
    uploader.upload_file(BASE_DIR / "favicon.ico", "favicon.ico")
    uploader.upload_file(BASE_DIR / "logo-brmp.png", "logo-brmp.png")
    uploader.upload_file(BASE_DIR / ".htaccess", ".htaccess")
    uploader.upload_file(BASE_DIR / "index.php", "index.php")
    uploader.upload_file(BASE_DIR / "admin.php", "admin.php")
    uploader.upload_file(BASE_DIR / "api.php", "api.php")
    uploader.upload_file(BASE_DIR / "config.php", "config.php")

    # 2. Upload dist folder
    print("\n📦 Uploading dist directory...")
    uploader.upload_directory(BASE_DIR / "dist", "dist")

    uploader.close()
    print("\n🎉 Deployment completed successfully!")

if __name__ == "__main__":
    main()
