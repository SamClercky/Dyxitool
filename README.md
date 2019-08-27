# Dyxitool

This is a firefox and chrome extension that will help people with dyslexia.

## 1. Installing the plugin
Prebuild files can be found in ./build/ folder or the releases part of the [Github page](https://github.com/SamClercky/Dyxitool/releases) altough this is not the recommended way, since they are also hosted in the official marketplace of your browser's extension shop. 

## 2. Building the project
WARNING: These instructions are ment for a UNIX-compatible terminal. If you are using Windows, you can use docker or WSL (Windows Subsystem Linux)

### Step 1: Downloading
Depending on your system you can download this repo through git or by clicking the download link on Github.

```
$ git clone https://github.com/SamClercky/Dyxitool.git
```

### Step 2: Download dependencies
This project is build with gulp. I use node v10.15.2 and npm v6.10.3. Normaly the version numbers should not matter a lot, but if it does not work, this were my configurations.

```
$ npm install
```

### Step 3: build typescript
```
$ npx tsc
```

### Step 3: build the Firefox- or Chrome part
Now chose witch part you want to build because each build command will firstly clean the ./dist/ folder.
#### Build for Firefox
```
$ npx gulp firefox
$ cd dist
$ npx web-ext build
$ mv web-ext-artifacts/dyxitool-1.1.zip web-ext-artifacts/dyxitool-1.1.xpi
```

After this you will find a ready to use (unsigned) build in dist/web-ext-artifacts/

#### Build for Chrome
```
$ npx gulp chrome
```
Now go to your chrome browser and go to [chrome://extensions/](chrome://extensions/).
Make sure you enabled Dev-mode before you can `Package extension`. Fill in the path to the ./dist/ folder. (you can leave the private-key part open). The final buildfile will be found in the root directory of this project.

## 3. License
This code is licensed under [GPLv2](https://github.com/SamClercky/Dyxitool/blob/master/LICENSE). Everything except the `fonts` folder and the `lib` folder. These contain code from other libraries or projects and have their own license.
### Links to corresponding website
* [JQuery](https://jquery.com/)
* [Spectrum](https://bgrins.github.io/spectrum/)
* [browser-polyfill](https://github.com/mozilla/webextension-polyfill)
* [OpenDyslexic](https://opendyslexic.org/)

## 4. Dependencies
To make it easier to bulid the project exact as I did, the used libraries are wget'ed into a local `./lib/` folder. Since some webbrowser markets still want a link to the original files, here is a list.
* JQuery: [3.4.1](https://github.com/jquery/jquery/blob/3.4.1/dist/jquery.js)
* Webextension-polyfill: [0.4.0](https://github.com/mozilla/webextension-polyfill/blob/0.4.0/src/browser-polyfill.js)
* Spectrum: [1.8.0](https://github.com/bgrins/spectrum/blob/1.8.0/spectrum.js)
* OpenDyslexic: [At time of writing, site is down](https://opendyslexic.org/)

The files in the lib folder are wget'ed from following url's
* JQuery: [https://raw.githubusercontent.com/jquery/jquery/3.4.1/dist/jquery.min.js](https://raw.githubusercontent.com/jquery/jquery/3.4.1/dist/jquery.min.js)
* Spectrum:
    * Js: [https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js](https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js)
    * Css: [https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css](https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css)
* Webextension-polyfill: [https://unpkg.com/webextension-polyfill@0.4.0/dist/browser-polyfill.min.js](https://unpkg.com/webextension-polyfill@0.4.0/dist/browser-polyfill.min.js)