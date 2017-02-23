# Design templates for Virtualni Dolicek website
This solution contains designe templates used to build new look & feel for Virtualni Dolicek website. 

### How to use
This project does not require any specific OS or editor, it will work on Windows, Mac or Linux, using any editor you like.
You will need Node.js (tested with v. 7.0.0) and npm (tested with version 3.10.8) only to run the project. 
Once you clone the repo, simply run following 2 commands:

`npm install
 npm start`

### Webpack
Once you run `npm start`, a local development server is started and index template page will open on url http://localhost:3000. If you make any changes in scss or html files, the change will be instantly picked up and you will see the change in your web browser.

### Structure
Main css file is compiled from sass modules (under css folder). For example, if you want to play only with colors, see /css/utilities/_colors.scss file.

Html files are under /mock directory. There are 8 templates in total - one is simple hub with links to other templates, one template is a style guide with common controls displayed.

### Contributions
We are happy to accept pull requests as long as they make any sense. 

### Authors
These templates were originally made by Filip Mares. For any inquiries, please find contacts at [http://bohemians.cz](http://bohemians.cz).
