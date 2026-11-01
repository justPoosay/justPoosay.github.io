// Minimal audio player for the piano page. Reads window.PIECES (pieces.js).
(function () {
  var list = document.getElementById("pieces");
  var pieces = window.PIECES || [];
  if (!list) return;

  if (!pieces.length) {
    var empty = document.createElement("li");
    empty.className = "piece";
    empty.innerHTML = '<div class="piece-row"><span></span><p class="piece-composer">No recordings yet.</p></div>';
    list.appendChild(empty);
    return;
  }

  var ICON_PLAY =
    '<svg class="icon-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>';
  var ICON_PAUSE =
    '<svg class="icon-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>';

  var audio = new Audio();
  audio.preload = "none";
  var current = -1;
  var rows = [];

  // Two-octave keyboard in the page header; keys light up softly while a
  // recording plays.
  var keyboard = buildKeyboard(document.getElementById("keys"));
  var keyTimer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildKeyboard(container) {
    if (!container) return [];
    var keys = [];
    var whites = 14;
    var blackAfter = [0, 1, 3, 4, 5]; // C#, D#, F#, G#, A# within an octave
    for (var i = 0; i < whites; i++) {
      var white = document.createElement("span");
      white.className = "key-white";
      container.appendChild(white);
      keys.push(white);
    }
    for (var w = 0; w < whites - 1; w++) {
      if (blackAfter.indexOf(w % 7) === -1) continue;
      var black = document.createElement("span");
      black.className = "key-black";
      black.style.left = ((w + 1) / whites) * 100 + "%";
      container.appendChild(black);
      keys.push(black);
    }
    return keys;
  }

  function lightKeys() {
    var count = Math.random() < 0.3 ? 2 : 1;
    for (var i = 0; i < count; i++) {
      var key = keyboard[Math.floor(Math.random() * keyboard.length)];
      key.classList.add("is-lit");
      setTimeout(key.classList.remove.bind(key.classList, "is-lit"), 220);
    }
    keyTimer = setTimeout(lightKeys, 260 + Math.random() * 380);
  }

  function startKeys() {
    if (keyTimer || reduceMotion || !keyboard.length) return;
    lightKeys();
  }

  function stopKeys() {
    clearTimeout(keyTimer);
    keyTimer = null;
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "–:––";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  pieces.forEach(function (piece, index) {
    var item = el("li", "piece");
    var row = el("div", "piece-row");

    var button = el("button", "play-button");
    button.type = "button";
    button.innerHTML = ICON_PLAY + ICON_PAUSE;
    button.setAttribute("aria-label", "Play " + piece.title);

    var info = el("div", "piece-info");
    var title = el("h2", "piece-title", piece.title);
    var eq = el("span", "eq");
    eq.setAttribute("aria-hidden", "true");
    eq.innerHTML = "<i></i><i></i><i></i>";
    title.appendChild(eq);
    info.appendChild(title);
    if (piece.composer) info.appendChild(el("p", "piece-composer", piece.composer));
    if (piece.note) info.appendChild(el("p", "piece-note", piece.note));

    var time = el("span", "piece-time");

    var progress = el("div", "piece-progress");
    var seek = el("input", "seek");
    seek.type = "range";
    seek.min = "0";
    seek.max = "1000";
    seek.step = "1";
    seek.value = "0";
    seek.setAttribute("aria-label", "Seek in " + piece.title);
    progress.appendChild(seek);

    row.appendChild(button);
    row.appendChild(info);
    row.appendChild(time);
    item.appendChild(row);
    item.appendChild(progress);
    list.appendChild(item);

    var entry = { item: item, button: button, time: time, seek: seek, duration: NaN };
    rows.push(entry);

    if (!piece.file) {
      button.disabled = true;
      button.setAttribute("aria-label", piece.title + " – recording coming soon");
      time.textContent = "Recording soon";
      return;
    }

    // Fetch only the metadata so each row can show its length up front.
    time.textContent = "–:––";
    var probe = new Audio();
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", function () {
      entry.duration = probe.duration;
      if (index !== current) time.textContent = formatTime(probe.duration);
    });
    probe.addEventListener("error", function () {
      markUnavailable(index);
    });
    probe.src = piece.file;

    button.addEventListener("click", function () {
      toggle(index);
    });

    seek.addEventListener("input", function () {
      if (index !== current || !isFinite(audio.duration)) return;
      audio.currentTime = (seek.value / 1000) * audio.duration;
      render();
    });
  });

  function markUnavailable(index) {
    var entry = rows[index];
    entry.button.disabled = true;
    entry.time.textContent = "Unavailable";
    if (index === current) {
      entry.item.classList.remove("is-active", "is-playing");
      current = -1;
    }
  }

  function toggle(index) {
    if (index === current) {
      if (audio.paused) audio.play();
      else audio.pause();
      return;
    }

    if (current !== -1) {
      var previous = rows[current];
      previous.item.classList.remove("is-active", "is-playing");
      previous.button.setAttribute("aria-label", "Play " + pieces[current].title);
      previous.seek.value = "0";
      previous.seek.style.setProperty("--progress", "0%");
      previous.time.textContent = formatTime(previous.duration);
    }

    current = index;
    rows[index].item.classList.add("is-active");
    audio.src = pieces[index].file;
    audio.play();
    updateMediaSession(pieces[index]);
  }

  function render() {
    if (current === -1) return;
    var entry = rows[current];
    var duration = isFinite(audio.duration) ? audio.duration : entry.duration;
    var ratio = duration ? audio.currentTime / duration : 0;
    entry.seek.value = String(Math.round(ratio * 1000));
    entry.seek.style.setProperty("--progress", ratio * 100 + "%");
    entry.time.textContent = formatTime(audio.currentTime) + " / " + formatTime(duration);
  }

  function updateMediaSession(piece) {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: piece.title,
      artist: piece.composer,
      album: "Piano recordings",
    });
  }

  audio.addEventListener("play", function () {
    if (current === -1) return;
    rows[current].item.classList.add("is-playing");
    rows[current].button.setAttribute("aria-label", "Pause " + pieces[current].title);
    startKeys();
  });

  audio.addEventListener("pause", function () {
    stopKeys();
    if (current === -1) return;
    rows[current].item.classList.remove("is-playing");
    rows[current].button.setAttribute("aria-label", "Play " + pieces[current].title);
  });

  audio.addEventListener("timeupdate", render);
  audio.addEventListener("loadedmetadata", render);

  audio.addEventListener("ended", function () {
    audio.currentTime = 0;
    render();
  });

  audio.addEventListener("error", function () {
    if (current !== -1) markUnavailable(current);
  });
})();
