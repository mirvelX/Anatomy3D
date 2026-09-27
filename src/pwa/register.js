export async function registerPwa(save) {
  const $ = (id) => document.getElementById(id);
  let install = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    install = event;
    $("installBtn").classList.remove("hidden");
  });
  $("installBtn").onclick = async () => {
    if (!install) return;
    await install.prompt();
    await install.userChoice;
    install = null;
    $("installBtn").classList.add("hidden");
  };
  window.addEventListener("appinstalled", () => {
    install = null;
    $("installBtn").classList.add("hidden");
  });
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  const showStatus = (message) => {
    $("offlineStatus").textContent = message;
    $("offlineStatus").classList.toggle("hidden", !message);
  };
  let controller = navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    $("updateNotice").classList.add("hidden");
    const previous = controller;
    controller = navigator.serviceWorker.controller;
    if (previous && !reloading) {
      if (!save()) {
        showStatus(
          "ახალი ვერსია მზადაა. შეინახე სარეზერვო ასლი და შემდეგ გადატვირთე გვერდი.",
        );
        return;
      }
      reloading = true;
      location.reload();
    }
  });
  try {
    const registration = await navigator.serviceWorker.register("./sw.js", {
      updateViaCache: "none",
    });
    function waiting() {
      if (registration.waiting && navigator.serviceWorker.controller) {
        $("updateNotice").classList.remove("hidden");
      }
    }
    waiting();
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed") waiting();
        if (worker.state === "redundant")
          showStatus(
            "განახლება ვერ ჩამოიტვირთა. მოქმედი ვერსია შენარჩუნებულია; მოგვიანებით სცადე.",
          );
      });
    });
    $("applyUpdate").onclick = () => {
      if (save())
        registration.waiting?.postMessage({ type: "ACTIVATE_UPDATE" });
    };
    const check = () =>
      registration
        .update()
        .catch(() =>
          showStatus(
            "განახლების შემოწმება ვერ მოხერხდა. ინტერნეტთან დაკავშირებისას ხელახლა ვცდით.",
          ),
        );
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  } catch {
    showStatus(
      "ოფლაინ რეჟიმი ვერ ჩაირთო. ინტერნეტთან კავშირით აპის გამოყენება შეგიძლია.",
    );
  }
}
