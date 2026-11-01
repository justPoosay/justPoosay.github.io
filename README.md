# justpoosay.github.io

Personal portfolio site — plain HTML, CSS and a little JavaScript. No build step.

Live at **https://justpoosay.github.io**

## Structure

```
index.html          About (home)
projects.html       Projects
piano.html          Piano recordings
404.html            Not-found page
assets/css/         Styles (light + dark theme)
assets/js/main.js   Theme toggle, header
assets/js/pieces.js List of piano pieces  ← edit this to add recordings
assets/js/player.js Audio player
audio/              Audio files
```

## Adding a piano recording

1. Export the recording as MP3 (128–192 kbps is plenty) and put it in `audio/`,
   e.g. `audio/gymnopedie-1.mp3`. Use lowercase names without spaces.
2. Add an entry to `assets/js/pieces.js`:

   ```js
   {
     title: "Gymnopédie No. 1",
     composer: "Erik Satie",
     file: "audio/gymnopedie-1.mp3",
     note: "Learnt in 2026",
   },
   ```

3. Commit and push. GitHub Pages updates within a minute or two.

GitHub rejects single files over 100 MB and warns above 50 MB; a few-minute
MP3 is usually 3–8 MB, so this won't be a problem.

## Adding a project

Copy one of the `<li class="project">` blocks in `projects.html` and edit it.
The three projects on the home page are in the "Selected work" list in `index.html`.

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```
