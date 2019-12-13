Nobody's Perfect - NodeJS Web Applacation
=========================================

The board game Nobody's perfect usually requires a lot of paperwork which needs to be passed around, returned and so on. Sometimes it's hard to read someone else's handwriting. This app provides a server with a HTML interface you can connect to with any browser from every device you wish.

## Installation and Start

1. Download this project and extract .zip file to a directory you wish to place the server in. Creating a designated directory is recommended.

2. [Download and install NodeJS](https://nodejs.org/) for your OS.

3. Change your working directory to the path you exctracted this project to:
    ```
    ~$ cd /path/to/the/project/
    ```

4. Install the node dependencies with npm (automatically installed with NodeJS):
    ```
    ~$ npm install
    ```
    This will create a `node_modules` directory and a `package-lock.json` file in the app directory. These will be ignored by git, see `.gitignore`.

5. Run the app with NodeJS:
    ```
    ~$ node app.js
    ```

The server should now be accesible via the IP address which is diplayed in the outout after the launch of the app. Type in the address in a browser on a device in the same network as your server and you should see a web page asking for your player name. Have fun :)

## Remarks

* This is the first working and field tested version so bugs *will* appear.
* Right now the HTML interface is only available in German. Any help to support multiple languages is highly appreciated.

## Licence

This work is published under GPLv3. See `LICENCE` for further details.
