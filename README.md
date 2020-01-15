Nobody's Perfect - Node.js Web Application
=========================================

The board game Nobody's perfect usually requires a lot of paperwork which needs to be passed around, returned and so on. Sometimes it is also hard to read someone else's handwriting. This app provides a server with an HTML interface to type in the question and answers. These will be displayed according to your role as game master or as competitor. You can connect to it with any browser from any device you wish.

## Installation and Start

There are two ways of installing and using this web application after downloading the code. You can either manually install all required software or use the Dockerfile.

### Use Docker

1. Make sure you have docker installed on your machine.
    
    ```bash
    docker --version
    ```
2. Change your working directory to the path you exctracted this project to:
    
    ```bash
    cd /path/to/the/project/
    ```
3. Run docker build to generate the docker image

    ```bash
    docker build -t nobodys-perfect .
    ```
4. Define your desired `PORT` and build the docker container:

    ```bash
    docker run -p <PORT>:8080 -d --name nobodys_perfect nobodys-perfect:latest
    ```
You can access the web app via `localhost:<PORT>`. If you want to shut down / start the web app later on:

```bash
docker start nobodys_perfect
docker stop nobodys_perfect
```

### Manual installation and start

1. Download this project and extract the .zip file into a directory of your choice for your server. Creating a designated directory is recommended.

2. [Download and install Node.js](https://nodejs.org/) for your OS.

3. Change your working directory to the path you exctracted this project to:
    ```
    ~$ cd /path/to/the/project/
    ```

4. Install node dependencies with npm (automatically installed with Node.js):
    ```
    ~$ npm install
    ```
    This will create a `node_modules` directory and a `package-lock.json` file in the app directory. These will be ignored by git, see `.gitignore`.

5. Run the app with Node.js:
    ```
    ~$ node app.js
    ```

The server should now be accesible via the IP address which is displayed in the output after launching the app. Type the address into a browser on a device in the same network as your server and you should see a web page asking for your player name. Have fun :)

## Remarks

* This is the first working and field tested version so bugs *will* appear.
* Right now the HTML interface is only available in German. Any help to support multiple languages is highly appreciated.

## Licence

This work is published under GPLv3. See `LICENCE` for further details.
