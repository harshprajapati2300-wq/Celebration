Princess Day 👑

A small 3D game that opens in your web browser. It is a surprise for someone special.

You walk around a pretty island at night with your partner. You can:

🌹 pick a rose and give it to her
🐉 wake up a sleeping baby dragon
👑 crown her as the princess
✨ make a wish and read a love note
💕 sit together on a swing

Don't want to play? Press Auto tour and watch it like a short movie. 🎬

How to use it

Easiest way: download this project, then double-click index.html. It opens in your browser.

You need internet, because the 3D library (Three.js) loads online.

How to change the love note
Open the file config.js in any text editor (Notepad is fine).
Change the text inside the quotes:
js
const CONFIG = {
  note: "Write your message here"
};
Save the file and refresh the page.

Tip: write \n to go to a new line.

Controls
What you want to do	Computer	Phone
Walk	W A S D or arrow keys (or click on the ground)	Use the round joystick
Look around	Drag with the mouse	Drag with your finger
Zoom	Mouse wheel	-
Do something (rose, wish, swing...)	Click the pink button that appears	Tap the pink button

The buttons at the top right let you turn music on or off, start the auto tour, or switch to drone view.

Put it online (GitHub Pages)

Do this to get a link you can send to her.

Upload all the files to a new GitHub repository.
Open the repository Settings, then click Pages.
Under Branch, choose main and / (root), then click Save.
Wait about 1 minute. Your link will be: https://<your-username>.github.io/<repo-name>/
What is inside
File	What it does
index.html	The page itself
style.css	Colors and buttons
config.js	Your love note (change this one)
main.js	The 3D world and all the actions
README.md	This guide
LICENSE	Rules for using the code (MIT)
Made with

Three.js, HTML, CSS and JavaScript. No installation needed.

License

MIT. See the LICENSE file.
