window.addEventListener("DOMContentLoaded", () => {
  // ===== 기본 요소들 =====
  const videoInput = document.getElementById("videoInput");      // 미리보기 아래 input
  const videoPlayer = document.getElementById("videoPlayer");
  const previewPlaceholder = document.getElementById("previewPlaceholder");
  const seekBar = document.getElementById("previewSeek");
  const currentTimeLabel = document.getElementById("previewCurrent");
  const durationLabel = document.getElementById("previewDuration");

  const editorLayout = document.querySelector(".editor-layout");
  const leftPanel = document.querySelector(".editor-tools");
  const rightPanel = document.querySelector(".editor-preview");
  const vResizer = document.querySelector(".editor-resizer-vertical");

  const editorMain = document.querySelector(".editor-main");
  const hResizer = document.querySelector(".editor-resizer-horizontal");
  const editorTop = document.querySelector(".editor-layout");
  const timeline = document.querySelector(".editor-timeline");

  const timelineMain = document.querySelector(".timeline-main");
  const playhead = document.querySelector(".playhead");
  const firstVideoTrackContent = document.querySelector(
    ".timeline-tracks .track .track-content"
  );

  // 미디어 패널용
  const mediaInput = document.getElementById("mediaInput");      // 미디어 가져오기 input
  const mediaGrid = document.getElementById("mediaGrid");        // 미디어 카드 그리드

  // ===== 1. 시간 포맷 함수 =====
  function formatTime(sec) {
    if (!isFinite(sec)) return "00:00:00";
    sec = Math.max(0, Math.floor(sec));

    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // ===== 2. 미리보기 전환 함수 =====
  function showVideoInPreview(objectUrl) {
    if (!videoPlayer) return;

    videoPlayer.src = objectUrl;
    videoPlayer.play();

    if (previewPlaceholder) previewPlaceholder.classList.add("hidden");
  }

  // ===== 3. 비디오 로드 / 재생 상태와 플레이어 UI 연동 =====
  if (videoPlayer) {
    videoPlayer.addEventListener("loadedmetadata", () => {
      if (durationLabel) durationLabel.textContent = formatTime(videoPlayer.duration);
    });

    videoPlayer.addEventListener("timeupdate", () => {
      const dur = videoPlayer.duration || 0;
      if (!dur) return;

      const ratio = videoPlayer.currentTime / dur;

      // 플레이어 재생바
      if (seekBar) {
        seekBar.value = (ratio * 100).toString();
      }

      // 현재 시간 표시
      if (currentTimeLabel) {
        currentTimeLabel.textContent = formatTime(videoPlayer.currentTime);
      }

      // 타임라인 플레이헤드 이동
      if (playhead && timelineMain) {
        playhead.style.left = ratio * 100 + "%";
      }
    });
  }

  // 플레이어 재생바 → 비디오 위치 변경
  if (seekBar && videoPlayer) {
    seekBar.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      const dur = videoPlayer.duration || 0;
      if (!dur) return;

      const ratio = value / 100;
      videoPlayer.currentTime = dur * ratio;
    });
  }

  // 타임라인 클릭 → 비디오 위치 변경
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

  // ===== 4. 비디오 재생 (미리보기 아래 input) =====
  if (videoInput && videoPlayer) {
    videoInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      showVideoInPreview(objectUrl);
    });
  }

  // ===== 5. 미디어 패널 - 카드 생성 & 타임라인 + 미리보기 연결 =====
  if (mediaInput && mediaGrid) {
    mediaInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file) => {
        const card = document.createElement("div");
        card.className = "media-card";

        card.innerHTML = `
          <div class="media-thumb">🎬</div>
          <div class="media-meta">
            <span class="media-name" title="${file.name}">${file.name}</span>
          </div>
          <div class="media-duration">00:00</div>
          <button type="button" class="media-add-timeline">+</button>
        `;

        mediaGrid.appendChild(card);

        const addBtn = card.querySelector(".media-add-timeline");
        const objectUrl = URL.createObjectURL(file);

        if (addBtn) {
          addBtn.addEventListener("click", () => {
            // 1) 미리보기에서 재생
            showVideoInPreview(objectUrl);

            // 2) 타임라인에 간단한 클립 추가 (첫 번째 비디오 트랙에)
            if (firstVideoTrackContent) {
              const clip = document.createElement("div");
              clip.className = "clip-block";
              clip.textContent = file.name;
              firstVideoTrackContent.appendChild(clip);
            }
          });
        }
      });

      mediaInput.value = "";
    });
  }

  // ===== 6. 세로 크기 조절 (왼쪽/오른쪽 패널) =====
  if (editorLayout && leftPanel && rightPanel && vResizer) {
    let isResizing = false;

    vResizer.addEventListener("mousedown", () => {
      isResizing = true;
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isResizing) return;

      const rect = editorLayout.getBoundingClientRect();
      let newLeftWidth = e.clientX - rect.left;

      const minLeft = 160;
      const maxLeft = rect.width - 300;

      if (newLeftWidth < minLeft) newLeftWidth = minLeft;
      if (newLeftWidth > maxLeft) newLeftWidth = maxLeft;

      leftPanel.style.flexBasis = newLeftWidth + "px";
    });

    window.addEventListener("mouseup", () => {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.userSelect = "";
    });
  }

  // ===== 7. 가로 크기 조절 (위 편집 영역 / 아래 타임라인) =====
  if (editorMain && hResizer && editorTop && timeline) {
    let isResizingH = false;

    const MIN_TOP_PERCENT = 30;
    const MIN_BOTTOM_PERCENT = 20;

    const setInitialSplit = () => {
      editorTop.style.flexGrow = "0";
      editorTop.style.flexShrink = "0";
      timeline.style.flexGrow = "0";
      timeline.style.flexShrink = "0";

      editorTop.style.flexBasis = "70%";
      timeline.style.flexBasis = "30%";
    };

    setInitialSplit();

    hResizer.addEventListener("mousedown", () => {
      isResizingH = true;
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isResizingH) return;

      const rect = editorMain.getBoundingClientRect();
      const totalHeight = rect.height;

      let topPercent = ((e.clientY - rect.top) / totalHeight) * 100;

      const maxTopPercent = 100 - MIN_BOTTOM_PERCENT;
      if (topPercent < MIN_TOP_PERCENT) topPercent = MIN_TOP_PERCENT;
      if (topPercent > maxTopPercent) topPercent = maxTopPercent;

      const bottomPercent = 100 - topPercent;

      editorTop.style.flexBasis = topPercent + "%";
      timeline.style.flexBasis = bottomPercent + "%";
    });

    window.addEventListener("mouseup", () => {
      if (!isResizingH) return;
      isResizingH = false;
      document.body.style.userSelect = "";
    });
  }

  // ===== 8. 편집 도구 패널 전환 =====
  const toolListButtons = document.querySelectorAll(".tool-list-btn");
  const toolPanels = document.querySelectorAll(".tool-panel-content");

  toolListButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (!tool) return;

      toolListButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      toolPanels.forEach((panel) => {
        if (panel.dataset.toolPanel === tool) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

    // ===== 9. 플레이어 하단 컨트롤 버튼들 =====
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
              btn.textContent = "⏸";   // 재생 중이면 일시정지 아이콘으로
            } else {
              videoPlayer.pause();
              btn.textContent = "▶";   // 멈추면 ▶로 복귀
            }
            break;
          case "stop":
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            // 플레이 버튼 모양도 초기화
            const playBtn = document.querySelector(
              '.preview-btn[data-action="play-pause"]'
            );
            if (playBtn) playBtn.textContent = "▶";
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