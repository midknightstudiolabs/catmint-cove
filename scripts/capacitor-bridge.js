/* Catmint Cove — native bridge (Capacitor).
 * Loaded only in the app build. Every call is optional: on plain web, or if a
 * plugin is missing, the game keeps its normal browser behaviour. */
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;   // web build → do nothing
  var P = Cap.Plugins || {};

  /* ---- status bar: let the WebView draw under it; the HUD already uses safe-area insets ---- */
  try {
    if (P.StatusBar) {
      P.StatusBar.setOverlaysWebView({ overlay: true });
      P.StatusBar.setStyle({ style: "DARK" });
    }
  } catch (e) {}

  /* ---- splash: hide once the first frame is up ---- */
  function hideSplash() { try { P.SplashScreen && P.SplashScreen.hide(); } catch (e) {} }
  if (document.readyState === "complete") setTimeout(hideSplash, 300);
  else window.addEventListener("load", function () { setTimeout(hideSplash, 300); });

  /* ---- Android hardware back: close the top-most overlay, else send to background ---- */
  try {
    P.App && P.App.addListener("backButton", function () {
      var closed = closeTopOverlay();
      if (!closed) { try { P.App.minimizeApp(); } catch (e) {} }
    });
  } catch (e) {}

  function closeTopOverlay() {
    // in rough z-order, newest first
    var tut = document.getElementById("tut");
    if (tut && tut.classList.contains("on")) { var s = document.getElementById("tutSkip"); s && s.click(); return true; }
    var scrim = document.getElementById("scrim");
    if (scrim && scrim.classList.contains("on")) { scrim.classList.remove("on"); return true; }
    var photo = document.getElementById("photo");
    if (photo && photo.classList.contains("on")) { var pc = document.getElementById("photoClose"); pc && pc.click(); return true; }
    var rest = document.getElementById("rest");
    if (rest && rest.classList.contains("on")) {
      var panel = document.getElementById("restPanel");
      if (panel && !panel.hidden) { var rc = document.getElementById("restCancel"); rc && rc.click(); return true; }
      var wake = document.getElementById("restWake"); wake && wake.click(); return true;
    }
    var sheet = document.querySelector(".sheet:not([hidden])");
    if (sheet) { var x = sheet.querySelector("[data-close]"); if (x) { x.click(); return true; } sheet.hidden = true; return true; }
    return false;
  }

  /* ---- keep the screen awake during Rest mode (watches the #app.resting class) ---- */
  try {
    if (P.KeepAwake) {
      var app = document.getElementById("app");
      var awake = false;
      var sync = function () {
        var want = app && app.classList.contains("resting");
        if (want === awake) return;
        awake = want;
        try { want ? P.KeepAwake.keepAwake() : P.KeepAwake.allowSleep(); } catch (e) {}
      };
      if (app) { new MutationObserver(sync).observe(app, { attributes: true, attributeFilter: ["class"] }); sync(); }
    }
  } catch (e) {}

  /* ---- photo: save to the gallery / open the share sheet instead of an <a download> ---- */
  window.CoveNative = {
    savePhoto: function (dataUrl) {
      var base64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, "");
      var name = "catmint-cove-" + Date.now() + ".png";
      try {
        if (P.Filesystem && P.Share) {
          P.Filesystem.writeFile({ path: name, data: base64, directory: "CACHE" }).then(function (res) {
            return P.Share.share({ title: "Catmint Cove", text: "My cove 🐾", url: res.uri });
          }).catch(function () {});
          return true;
        }
        if (P.Share) { P.Share.share({ title: "Catmint Cove", text: "My cove 🐾", url: dataUrl }).catch(function () {}); return true; }
      } catch (e) {}
      return false;
    },
  };
})();
