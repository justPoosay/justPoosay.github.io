// Theme toggle, header, scroll reveals, count-up numbers, hero wave.
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Theme -------------------------------------------------------------
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  // Follow the system setting until the visitor picks a theme themselves.
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemChange = function (event) {
    var stored = null;
    try {
      stored = localStorage.getItem("theme");
    } catch (e) {}
    if (!stored) root.setAttribute("data-theme", event.matches ? "dark" : "light");
  };
  if (media.addEventListener) media.addEventListener("change", onSystemChange);

  // ---- Header border + reading progress ----------------------------------
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
        if (progress) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---- Scroll reveals ----------------------------------------------------
  // [data-reveal] reveals the element itself; [data-stagger] reveals its
  // children one after another.
  var targets = [];
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    targets.push(el);
  });
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--delay", Math.min(i * 0.07, 0.5) + "s");
      targets.push(child);
    });
  });
  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  var countUps = document.querySelectorAll("[data-count]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    targets.forEach(function (el) {
      observer.observe(el);
    });

    // ---- Count-up numbers ------------------------------------------------
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        countUp(entry.target);
      });
    });
    countUps.forEach(function (el) {
      el.textContent = "0";
      countObserver.observe(el);
    });
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var start = parseInt(el.getAttribute("data-count-from") || "0", 10);
    var duration = 1400;
    var t0 = performance.now();
    function frame(now) {
      var t = Math.min((now - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ---- Hero wave ---------------------------------------------------------
  // A few slow, overlapping sine waves inside a soft envelope — like a
  // sustained note on an oscilloscope.
  var canvas = document.querySelector(".wave");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var running = false;
    var visible = true;
    var lines = [
      { freq: 1.6, speed: 0.35, amp: 0.85, alpha: 0.9, width: 1.5 },
      { freq: 2.3, speed: -0.25, amp: 0.6, alpha: 0.45, width: 1 },
      { freq: 3.1, speed: 0.18, amp: 0.45, alpha: 0.3, width: 1 },
      { freq: 1.1, speed: -0.12, amp: 0.7, alpha: 0.2, width: 1 },
    ];

    var resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var draw = function (time) {
      var accent = getComputedStyle(root).getPropertyValue("--accent").trim() || "#4f6f5c";
      var t = time / 1000;
      var mid = height / 2;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = accent;

      lines.forEach(function (line, index) {
        ctx.globalAlpha = line.alpha;
        ctx.lineWidth = line.width;
        ctx.beginPath();
        for (var x = 0; x <= width; x += 3) {
          var p = x / width;
          // Bell-shaped envelope so the wave fades out at both ends.
          var envelope = Math.pow(Math.sin(Math.PI * p), 2);
          var breathing = 0.85 + 0.15 * Math.sin(t * 0.6 + index);
          var y =
            Math.sin(p * Math.PI * 2 * line.freq + t * line.speed * Math.PI * 2 + index) *
            Math.cos(p * Math.PI * 3 - t * 0.2) *
            envelope *
            breathing *
            line.amp *
            (mid - 4);
          if (x === 0) ctx.moveTo(x, mid + y);
          else ctx.lineTo(x, mid + y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    var loop = function (time) {
      if (!running) return;
      draw(time);
      requestAnimationFrame(loop);
    };

    var start = function () {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    window.addEventListener("resize", function () {
      resize();
      draw(performance.now());
    });

    // Redraw in the new colour when the theme changes.
    new MutationObserver(function () {
      draw(performance.now());
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    if (!reduceMotion) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) start();
          else running = false;
        }).observe(canvas);
      }
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) running = false;
        else start();
      });
      start();
    }
  }
})();
