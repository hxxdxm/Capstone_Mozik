// static/js/editor.js

window.addEventListener("DOMContentLoaded", () => {
  const videoPlayer = document.getElementById("videoPlayer");
  const previewPlaceholder = document.getElementById("previewPlaceholder");
  const seekBar = document.getElementById("previewSeek");
  const currentTimeLabel = document.getElementById("previewCurrent");
  const durationLabel = document.getElementById("previewDuration");

  const timelineMain = document.querySelector(".timeline-main");
  const playhead = document.querySelector(".playhead");
  const firstVideoTrackContent = document.querySelector(
    '.timeline-tracks .track-row[data-track="video1"] .track-content'
  );

  const timeRuler = document.querySelector(".time-ruler");
  const timelineInner = document.querySelector(".timeline-main-inner");

  // ===== 시간 포맷 =====
  function formatTime(sec) {
    if (!isFinite(sec)) return "00:00:00";
    sec = Math.max(0, Math.floor(sec));

    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // ===== 미리보기 전환 =====
  function showVideoInPreview(srcUrl) {
    if (!videoPlayer) return;
    videoPlayer.src = srcUrl;
    videoPlayer.play();

    if (previewPlaceholder) previewPlaceholder.classList.add("hidden");
  }

  // ===== 타임라인 눈금 생성 =====
  function buildTimelineRuler(durationSec) {
    if (!timeRuler || !timelineInner) return;

    let step = 10;
    if (durationSec <= 60) step = 5;
    if (durationSec >= 600) step = 30;

    const totalMarks = Math.floor(durationSec / step) + 1;
    timeRuler.innerHTML = "";

    for (let i = 0; i <= totalMarks; i++) {
      const sec = i * step;
      const m = Math.floor(sec / 60);
      const s = String(sec % 60).padStart(2, "0");
      const mark = document.createElement("div");
      mark.className = "time-mark";
      mark.textContent = `${m}:${s}`;
      timeRuler.appendChild(mark);
    }

    timeRuler.style.gridTemplateColumns = `repeat(${totalMarks + 1}, 1fr)`;

    const basePerMark = 80;
    const minWidth = Math.max(800, (totalMarks + 1) * basePerMark);
    timelineInner.style.minWidth = minWidth + "px";
  }

  // ===== 비디오와 UI 연동 =====
  if (videoPlayer) {
    videoPlayer.addEventListener("loadedmetadata", () => {
      const dur = videoPlayer.duration || 0;
      if (durationLabel) durationLabel.textContent = formatTime(dur);
      buildTimelineRuler(dur);
    });

    videoPlayer.addEventListener("timeupdate", () => {
      const dur = videoPlayer.duration || 0;
      if (!dur) return;

      const ratio = videoPlayer.currentTime / dur;

      if (seekBar) {
        seekBar.value = (ratio * 100).toString();
      }

      if (currentTimeLabel) {
        currentTimeLabel.textContent = formatTime(videoPlayer.currentTime);
      }

      if (playhead && timelineMain) {
        playhead.style.left = ratio * 100 + "%";
      }
    });
  }

  // 재생바 드래그 → 위치 변경
  if (seekBar && videoPlayer) {
    seekBar.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      const dur = videoPlayer.duration || 0;
      if (!dur) return;
      videoPlayer.currentTime = (dur * value) / 100;
    });
  }

  // 타임라인 클릭 → 위치 변경
  if (timelineMain && videoPlayer) {
    timelineMain.addEventListener("click", (e) => {
      const rect = timelineMain.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;

      const dur = videoPlayer.duration || 0;
      if (!dur) return;

      const clamped = Math.min(Math.max(ratio, 0), 1);
      videoPlayer.currentTime = dur * clamped;
    });
  }

  // ===== 미디어 카드 클릭 → 미리보기 & 타임라인에 추가 =====
  const mediaButtons = document.querySelectorAll(".media-add-timeline");

  mediaButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.mediaUrl;
      if (!url) return;

      // 1) 플레이어에서 재생
      showVideoInPreview(url);

      // 2) 타임라인에 간단한 클립 블록 추가 (선택)
      if (firstVideoTrackContent) {
        const clip = document.createElement("div");
        clip.className = "clip-block";
        clip.textContent = btn.closest(".media-card")?.querySelector(".media-name")?.textContent || "클립";
        firstVideoTrackContent.appendChild(clip);
      }
    });
  });

  // ===== 플레이어 컨트롤 버튼 =====
  const controlButtons = document.querySelectorAll(".preview-btn");

  if (videoPlayer && controlButtons.length > 0) {
    controlButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (!action) return;

        switch (action) {
          case "jump-start":
            videoPlayer.currentTime = 0;
            break;
          case "step-back":
            videoPlayer.currentTime = Math.max(videoPlayer.currentTime - 1, 0);
            break;
          case "play-pause":
            if (videoPlayer.paused) {
              videoPlayer.play();
              btn.textContent = "⏸";
            } else {
              videoPlayer.pause();
              btn.textContent = "▶";
            }
            break;
          case "stop":
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            {
              const playBtn = document.querySelector(
                '.preview-btn[data-action="play-pause"]'
              );
              if (playBtn) playBtn.textContent = "▶";
            }
            break;
          case "step-forward":
            videoPlayer.currentTime = Math.min(
              videoPlayer.currentTime + 1,
              videoPlayer.duration || videoPlayer.currentTime + 1
            );
            break;
        }
      });
    });
  }
});