/* Catmint Cove — native bridge (Capacitor).
 * Loaded only in the app build. Every call is optional: on plain web, or if a
 * plugin is missing, the game keeps its normal browser behaviour. */
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;   // web build → do nothing
  var P = Cap.Plugins || {};

  window.CoveNative = window.CoveNative || {};

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
  window.CoveNative.savePhoto = function (dataUrl) {
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
  };

  /* ---- in-app purchases via RevenueCat ---------------------------------------
   * PASTE YOUR KEYS BELOW. From the RevenueCat dashboard → Project → API keys:
   *   - the *public* key for the Google Play app  (starts with "goog_")
   *   - the *public* key for the App Store app    (starts with "appl_")
   * These are CLIENT keys — safe to commit to a public repo.
   * While a platform's key is "", the game falls back to its built-in simulated
   * purchase flow on that platform, so the app still runs.
   *
   * The three product ids below MUST match the products you create in Play
   * Console (Monetize → Products → One-time products) AND App Store Connect
   * (Features → In-App Purchases, non-consumable), and the game's own
   * IAP_PRODUCTS keys. RevenueCat "entitlements" are not required — we read
   * customerInfo.allPurchasedProductIdentifiers directly.
   * ------------------------------------------------------------------------- */
  var REVENUECAT_ANDROID_KEY = "";
  var REVENUECAT_IOS_KEY = "";
  var COVE_PRODUCTS = ["welcome_pack", "founding_covekeeper", "sparkle_pack"];

  (function initIAP() {
    var RC = P.Purchases;
    var plat = (Cap.getPlatform && Cap.getPlatform()) || "";
    var RC_KEY = plat === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
    if (!RC || !RC_KEY) return;   // no plugin / no key for this platform → game simulates purchases

    try { RC.configure({ apiKey: RC_KEY }); }
    catch (e) { return; }

    var products = null;   // { <productId>: PurchasesStoreProduct }

    function ownedFrom(info) {
      var ids = (info && info.allPurchasedProductIdentifiers) || [];
      var out = [];
      for (var i = 0; i < ids.length; i++) if (COVE_PRODUCTS.indexOf(ids[i]) !== -1) out.push(ids[i]);
      return out;
    }
    function push(info) {
      try {
        if (info && typeof window.__coveReconcile === "function") window.__coveReconcile(ownedFrom(info));
      } catch (e) {}
      try {
        if (products && typeof window.__covePrices === "function") {
          var m = {};
          for (var k in products) if (products[k] && products[k].priceString) m[k] = products[k].priceString;
          if (Object.keys(m).length) window.__covePrices(m);
        }
      } catch (e) {}
    }

    // catalogue — needed to purchase, and gives us localized price strings
    RC.getProducts({ productIdentifiers: COVE_PRODUCTS, type: "NON_SUBSCRIPTION" })
      .then(function (res) {
        products = {};
        (res && res.products || []).forEach(function (p) { products[p.identifier] = p; });
        push(null);
      })
      .catch(function () {});

    function sync() {
      return RC.getCustomerInfo().then(function (r) {
        var info = r && r.customerInfo;
        push(info);
        return ownedFrom(info);
      });
    }

    // authoritative refresh: launch, every resume, and whenever RC pushes an update
    try { RC.addCustomerInfoUpdateListener(function (info) { push(info); }); } catch (e) {}
    try { P.App && P.App.addListener("resume", function () { sync().catch(function () {}); }); } catch (e) {}
    sync().catch(function () {});

    function purchase(prod, productId) {
      return RC.purchaseStoreProduct({ product: prod }).then(
        function (r) { try { push(r && r.customerInfo); } catch (e) {} return { ok: true, productId: productId }; },
        function (e) {
          var cancelled = !!(e && (e.userCancelled === true || String(e.code) === "1"));
          var notAllowed = !!(e && String(e.code) === "PURCHASES_ERROR_CODE_PURCHASE_NOT_ALLOWED_ERROR");
          return { ok: false, reason: cancelled ? "cancelled" : notAllowed ? "notallowed" : "failed" };
        }
      );
    }

    window.CoveNative.iap = {
      available: true,
      buy: function (productId) {
        var prod = products && products[productId];
        if (prod) return purchase(prod, productId);
        // catalogue not ready / missing that id — fetch just this one, then buy
        return RC.getProducts({ productIdentifiers: [productId], type: "NON_SUBSCRIPTION" })
          .then(function (res) {
            var p = (res && res.products || [])[0];
            if (!p) return { ok: false, reason: "unavailable" };
            if (products) products[productId] = p;
            return purchase(p, productId);
          })
          .catch(function () { return { ok: false, reason: "unavailable" }; });
      },
      restore: function () {
        return RC.restorePurchases().then(function (r) {
          var info = r && r.customerInfo;
          push(info);
          return ownedFrom(info);
        });
      },
      sync: sync,
    };
  })();
})();
