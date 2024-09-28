### p5.js Node Environment

This project contains a walkthrough for setting up a basic node environment using an express server, allowing fast and easy three.js development in a web environment, and providing the ability to develop and deploy seamlessly. I strongly recommend utilizing the walkthrough to ensure proper setup if this is your first time using the package, however there is a 3-step setup that utilizes a clone of this repo as the template.

How to setup similarly
    1. install npm and node via nvm
    2. use express.js generator https://expressjs.com/en/starter/generator.html
    3. update title in index.js
    4. install p5 download package (no need for npm package) OR, skip this step and add cdn to index.ejs
       1. https://p5js.org/download/ (translate)
          1. dl individual files (p5.js and p5.min.js)
          2. if needing sound add on, dl complete library, unzip and remove .js files
       2. update index.ejs to include p5.js and sketch.js script tags, remove default html
    5. create public/javascripts/sketch.js
    6. add base p5 code to sketch.js
        1. explain lack of ES6 and need to utilize p5 as a module

Alternatively, for a quick setup
    1. clone this repo
    2. run npm install
    3. to start the node server at port 3000 run 
        ```
        $DEBUG=myapp:* npm start
        ```