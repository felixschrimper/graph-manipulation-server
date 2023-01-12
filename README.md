# graph-manipulation-server

## Project setup

- Install packages:

```sh
npm install
```

- Run:

```sh
npm start
```

## Change of Ports

- By default, port 5001 is used to connect the server with the web application. If this needs to be changed, there are two files to change the port.

```sh
.../graph-manipulation-client/src/General/Constants.tsx line 6
```

```sh
.../graph-manipulation-server/index.js line 10
```

- After changing the port, please restart the server and the web application.
