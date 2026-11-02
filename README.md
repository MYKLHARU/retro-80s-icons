# Retro 80s Icons

A colourful 80s icon pack for Android TV, made by MYKLHARU.

The website includes the complete collection of **1,104 designs**, search, 12 categories, individual transparent PNG downloads and an Android TV APK download. Every supplied icon is 320 × 180 pixels.

## Android TV app

- App: Retro 80s Icons, version 1.0.0
- Package: `dev.retro80s.iconpack`
- Requires Android TV 9 or newer
- Designed for remote controls and Projectivy Launcher
- APK: [Retro-80s-Icons-TV.apk](downloads/Retro-80s-Icons-TV.apk)
- [Install guide](downloads/Install-guide.txt)
- SHA-256: `c2eb6d00ba8ae3fed17357f270b50da889ad1f452042fcdb3024ac679286307b`

This is a separate app and repository from [Glitch Icons](https://github.com/MYKLHARU/glitch-icons).

## Website

The intended address is **https://myklharu.github.io/retro-80s-icons/** after publishing.

This is a static site with no external dependencies, tracking, account requirements or paid services. Open `index.html` locally, or serve this directory with any static web server. The gallery needs JavaScript.

Run `python verify_site.py` to check the artwork, APK and site links. This check also runs before each GitHub Pages deployment.

## Publishing

1. Create a public repository named `retro-80s-icons` under **MYKLHARU**.
2. Push this complete directory to its `main` branch, including `.github/workflows/pages.yml` and the `icons`, `assets` and `downloads` directories. Use Git for the upload: the APK is larger than GitHub's browser file-upload limit.
3. In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source.
4. Run **Actions → Publish Retro 80s Icons → Run workflow** if the first push ran before Pages was enabled.

The workflow publishes only the website files, artwork and downloads. No APK signing keys or passwords belong in this repository.

## Support

Optional support: https://www.paypal.com/paypalme/mickyharu

Brand names and logos belong to their respective owners. This is an independent icon collection.
