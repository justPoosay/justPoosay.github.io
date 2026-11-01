// ------------------------------------------------------------------
// Piano pieces shown on piano.html
//
// To add a recording:
//   1. Put the audio file in the /audio folder (MP3, lowercase name,
//      no spaces – e.g. "audio/gymnopedie-1.mp3").
//   2. Add an entry below.
//
//   title     – name of the piece (required)
//   composer  – composer and where it's from (optional)
//   file      – path to the audio file. Leave it as "" if you haven't
//               recorded it yet; the row will show "Recording soon".
//   note      – optional short line (year learned, arrangement, etc.)
// ------------------------------------------------------------------
window.PIECES = [
  {
    title: "Minute Waltz",
    composer: "Frédéric Chopin · Waltz in D-flat major, Op. 64 No. 1",
    file: "audio/minute-waltz.mp3",
  },
  {
    title: "Shop",
    composer: "Toby Fox · Undertale",
    file: "audio/shop.mp3",
  },
  {
    title: "Snowdin Town",
    composer: "Toby Fox · Undertale",
    file: "audio/snowdin-town.mp3",
  },
  {
    title: "The Field of Hopes and Dreams",
    composer: "Toby Fox · Deltarune",
    file: "audio/field-of-hopes-and-dreams.mp3",
  },
  {
    title: "Fallen Down",
    composer: "Toby Fox · Undertale",
    file: "audio/fallen-down.mp3",
  },
];
