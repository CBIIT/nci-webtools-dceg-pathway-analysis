* Jade
* Stylus
* Gulp
* bower

* partial templates written in jade are turned into html and included in `index.html`
* css files are concatenated into `styles.css`

# Usage
* Code and file structure is managed and compiled by the Gulp.js build system (http://gulpjs.com/, https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)
* always work inside of the src folder (except when editing R or python files)
* store html jade file templates inside jade folder at compilation the files will be merged in the `index.jade` -> `index.html` (review resource @ http://jade-lang.com/)
* static scripts (js) should be stored in the scripts folder under src. At compilation, these scripts will be merged into one js file

## --- DO THIS AT FIRST USE--
Install required packages:
1.    install node.js, if not already installed
2.    run following commands in command line in the directory which the code will be
3.    `$ npm install -g` -- to download node packages required for this project and store them globally(Only need to run when first pulling down code or when new node_packages are added in package.json)
4.    `npm link pathway` -- to link the global node_module to your local instance of the application
5.    `$ npm run build` -- to compile code which is placed in the root folder

* Once compiled the code will be generated one folder level above the gulpfile.js in the project root directory

Compile code by running `$ npm run build` in command line while in the `src` directory
