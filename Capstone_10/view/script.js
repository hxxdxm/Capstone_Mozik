window.addEventListener("DOMContentLoaded", () => {
  const videoInput = document.getElementById("videoInput");
  const videoPlayer = document.getElementById("videoPlayer");

  const editorLayout = document.querySelector(".editor-layout");
  const leftPanel = document.querySelector(".editor-tools");
  const rightPanel = document.querySelector(".editor-preview");
  const vResizer = document.querySelector(".editor-resizer-vertical");

  const editorMain = document.querySelector(".editor-main");
  const hResizer = document.querySelector(".editor-resizer-horizontal");
  const editorTop = document.querySelector(".editor-layout");
  const timeline = document.querySelector(".editor-timeline");

  // 비디오 재생
  if (videoInput && videoPlayer) {
    videoInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);

      const addBtn = card.querySelector(".media-add-timeline");
      addBtn.addEventListener("click", () => {
        // TODO: 실제로는 타임라인에 넣는 로직도 같이 들어갈 자리
        showVideoInPreview(objectUrl);
      });
    });
  }

  // === 세로 크기 조절 (왼쪽/오른쪽 패널) ===
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

  // 가로 크기 조절 (위 편집 영역 / 아래 타임라인)
  if (editorMain && hResizer && editorTop && timeline) {
    let isResizingH = false;

    const MIN_TOP_PERCENT = 30;    // 위쪽 최소 30%
    const MIN_BOTTOM_PERCENT = 20; // 아래쪽 최소 20%

    // 페이지 처음 열렸을 때 기본 비율
    const setInitialSplit = () => {
      // flex-grow/shrink 끄고 basis로만 높이 결정
      editorTop.style.flexGrow = "0";
      editorTop.style.flexShrink = "0";
      timeline.style.flexGrow = "0";
      timeline.style.flexShrink = "0";

      editorTop.style.flexBasis = "70%"; // 위 70%
      timeline.style.flexBasis = "30%";  // 아래 30%
    };

    // ✅ 여기서 실제로 한 번 실행해줘야 함
    setInitialSplit();

    hResizer.addEventListener("mousedown", () => {
      isResizingH = true;
      document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isResizingH) return;

      const rect = editorMain.getBoundingClientRect();
      const totalHeight = rect.height;

      // 마우스 위치가 editor-main 높이에서 차지하는 비율(0~100)
      let topPercent = ((e.clientY - rect.top) / totalHeight) * 100;

      // 최소/최대 비율 제한
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

  // ===== 편집 도구 패널 전환 =====
  const toolListButtons = document.querySelectorAll(".tool-list-btn");
  const toolPanels = document.querySelectorAll(".tool-panel-content");

  toolListButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tool = btn.dataset.tool;
      if (!tool) return;

      // 왼쪽 리스트 active 변경
      toolListButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 오른쪽 패널 표시 변경
      toolPanels.forEach((panel) => {
        if (panel.dataset.toolPanel === tool) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });
});