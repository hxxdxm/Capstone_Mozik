from flask import Flask, render_template, request, redirect, url_for
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)     # 플라스크 객체를 생성한다.
os.makedirs(UPLOAD_DIR, exist_ok=True)
FASTAPI_URL = "http://127.0.0.1:8000"

@app.route('/index')           # 기본서버 127.0.0.1:5000 뒤에 붙는 주소를 적어준다.
def index():
    return render_template("index.html")

@app.route('/videoEditor')
def videoEditor():
    return render_template('videoEditor.html')

@app.route('/videoSelect')
def videoSelect():
    return render_template('videoSelect.html')

@app.route("/editor")
def video_editor():
    return render_template("video_editor.html", media_list=media_store)

@app.route("/upload_media", methods=["POST"])
def upload_media():
    files = request.files.getlist("media_files")
    for f in files:
        if not f:
            continue
        filename = secure_filename(f.filename)
        save_path = os.path.join(UPLOAD_DIR, filename)
        f.save(save_path)

        media_store.append({
            "id": len(media_store) + 1,
            "filename": filename,
            "path": save_path,
            "duration": None,  # 나중에 FFmpeg로 계산 가능
        })

    return redirect(url_for("video_editor"))

if __name__ == "__main__":
    app.run(debug=True, port=5000)