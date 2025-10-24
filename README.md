For Haby — interactive single-page prototype

What this is
- A small, modern interactive web experience meant to be opened locally (double-click `index.html`) on a phone or computer.
- Uses a 3x3 drag-swap photo puzzle and a drag-to-place heart activity so she interacts and "earns" the final reveal.

Colors and assets
- Palette: purple / mint / blue (customized in `styles.css`).
- The photo used is referenced directly as `63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif` (already in the folder). Replace it if you want a different photo — keep the filename or update `index.html` & `script.js`.

Music (copyrighted songs)
- You mentioned two songs: "Pangako" and "Maging Sino Ka Man" by Rey Valera.
- I cannot provide copyrighted audio files. To include them, place MP3 files named exactly:
  - `pangako.mp3`
  - `maging_sino.mp3`
  in the same folder as `index.html`. The page will then allow playback.

How to use
1. Option A — Quick: Open `index.html` in a browser (Chrome, Edge, Safari). If prompted, allow local file access.
2. Option B — On phone: Zip the folder, transfer to phone and unzip, then open `index.html` with a browser.

Presentation ideas
- Print a small card with a QR code that points to a hosted copy (or instruct her to open the file on your phone). QR generation is optional — I can add a printable card if you want.
- Hide the USB with the files and give clues to find it (scavenger style).

Next steps I can do for you
- Add a printable card/QR with custom text.
- Replace the photo with multiple photos in a small slideshow instead of a single image.
- Create a single downloadable ZIP automatically from within the page (requires more advanced JS).

If you want any of the above, tell me which one to implement next.

Printable card
----------------
- A printable reveal card has been added as `card.html` and `card-styles.css`.
- The card includes a QR image (generated via Google Charts) that encodes the instruction: "Open index.html in the 'For Haby' folder on the USB. Enjoy!".
- To print: open `card.html` in a browser and print or save as PDF. If you prefer a static PNG for printing, tell me and I can produce one.

ZIP download button
-------------------
- The page now includes a "Save as a ZIP (manual)" button which attempts to package the site and available assets into a single `For-Haby.zip` using JSZip and FileSaver. This requires an internet connection the first time to load helper libraries, and some browsers block reading local files when the page is opened with the `file://` scheme.
- If the ZIP button fails, use one of these options:
  1) Zip the folder manually (Windows: right-click the folder > Send to > Compressed (zipped) folder).
  2) Run a tiny local server in the folder and open the page over HTTP. Example (PowerShell):

```powershell
cd 'C:\Users\85293\Documents\for you padin'
python -m http.server 8000
# then open http://localhost:8000 in a browser
```

Place your `pangako.mp3` and `maging_sino.mp3` files in the same folder before zipping so the music is included.

Final polish
------------
- When the final reveal is achieved (after solving the puzzle and arranging the hearts) a small confetti animation will play (uses `canvas-confetti` library). If you are offline and the library cannot load, the page will still reveal the final content without confetti.
- Cards and site elements now have a subtle entrance animation for a smoother feel.

Step 3 — Heart Catcher and Reward
---------------------------------
- A third mini-game (Heart Catcher) has been added. Click "Start" to spawn floating hearts; catch at least 8 within 12 seconds to unlock the Reward.
- After unlocking, click "Open Reward" and then "Open the gift" to reveal a full-screen reward overlay with animation.

Reward behavior and media
-------------------------
- The reward overlay will play two songs sequentially: `pangako.mp3` then `maging_sino.mp3`. Place these MP3 files in the same folder as `index.html`.
- While music plays, the overlay shows a slideshow of media found in the folder. It automatically includes the main photo `63b54e2d-17ca-4fb3-888d-8ea93aff4220.jfif` and attempts to use optional files if present:
  - `photo1.jpg` ... `photo6.jpg` (images)
  - `vid1.mp4` ... `vid3.mp4` (videos)
- To create a romantic drama-style presentation: name or order your media files in the sequence you want them to appear (e.g., `photo1.jpg` for the opening scene, `vid1.mp4` for a moving clip). The slideshow will advance when you press "Next" or automatically when audio tracks end.

Tips
----
- For best syncing, keep videos short (10–30s) and edit them locally if desired. If you want, tell me which photos/videos you have and I can help create a tight storyboard order that matches each song's mood.

Storyboard template
-------------------
You can customize the slideshow and captions by editing `storyboard.json`. Each item supports:

- `src`: filename (required)
- `type`: `img` or `video` (optional, defaults to `img`)
- `duration`: milliseconds to display the slide if known (optional)
- `caption`: text to display as a subtitle (optional)

Example:

```json
{
  "src": "photo1.jpg",
  "type": "img",
  "duration": 9000,
  "caption": "The day we laughed the hardest"
}
```

Place `storyboard.json` in the same folder as `index.html` and the site will load it when the reward is opened. If the file is missing, the page will fall back to a default ordering using available files.