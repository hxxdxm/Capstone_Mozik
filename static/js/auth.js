// static/js/auth.js

window.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".auth-tab-btn");
  const panels = document.querySelectorAll(".auth-form");
  const goSignup = document.querySelector(".js-go-signup");
  const goLogin = document.querySelector(".js-go-login");

  function switchAuth(tabName) {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.authTab === tabName);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.authPanel === tabName);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.authTab;
      if (!tab) return;
      switchAuth(tab);
    });
  });

  if (goSignup) {
    goSignup.addEventListener("click", () => {
      switchAuth("signup");
    });
  }

  if (goLogin) {
    goLogin.addEventListener("click", () => {
      switchAuth("login");
    });
  }
});