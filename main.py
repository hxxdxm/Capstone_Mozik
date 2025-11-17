from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import List
import os
from pathlib import Path
from uuid import uuid4

app = FastAPI()

# 정적 파일, 템플릿 설정
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# ★ 실제론 DB를 쓰겠지만, 예제라 간단히 메모리에 저장
media_store = []  # [{id, filename, url, duration}, ...]

@app.get("/editor")
async def video_editor(request: Request):
    return templates.TemplateResponse(
        "video_editor.html",
        {
            "request": request,
            "media_list": media_store,  # 미디어 카드에 쓰일 데이터
        },
    )

@app.post("/media/upload")
async def upload_media(
    request: Request,
    media_files: List[UploadFile] = File(...),
):
    for f in media_files:
        # 파일명 정리 + 유니크 이름 부여
        suffix = Path(f.filename).suffix
        new_name = f"{uuid4().hex}{suffix}"
        save_path = UPLOAD_DIR / new_name

        with save_path.open("wb") as buffer:
            buffer.write(await f.read())

        # FastAPI에서 접근 가능한 URL (StaticFiles 기준)
        file_url = f"/uploads/{new_name}"  # 밑에서 mount 필요

        media_store.append(
            {
                "id": len(media_store) + 1,
                "filename": f.filename,
                "url": file_url,
                "duration": None,  # 나중에 FFmpeg로 계산해서 채워도 됨
            }
        )

    # 업로드 후 다시 에디터로
    return RedirectResponse(url="/editor", status_code=303)

# 업로드 폴더도 Static으로 서빙 (비디오 src에서 쓰려고)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")