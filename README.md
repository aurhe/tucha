#  tucha

Animal Shelter Database System developed for the animal shelter association "Abrigo de Carinho dos Animais do Concelho de Mira".

Still a work in progress.

## Build instructions

Requires [Node.js](http://nodejs.org/), [Grunt](http://gruntjs.com/), [Compass](http://compass-style.org/install/) and [MySQL](https://www.mysql.com/).

Load the database/script.sql to a MySQL database and configure server/main.js to connect to it.

### Server
```
$ npm install
$ node main.js
```

### Client
```
$ npm install
$ bower install
$ grunt build
```

## License

Copyright (C) 2015 Aurélio Santos

Licensed under the GPL v3 license.
