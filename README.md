A web site ([bloomlibrary.org](https://bloomlibrary.org)) for sharing literacy materials, especially templates for translation into minority languages.

Language speakers find books in their own language, and book creators find shellbooks to translate. They upload these to share them with the world.

---

# Development Process

## Prerequisites ##

### yarn ###
Install yarn (https://yarnpkg.com/lang/en/docs/install/#windows-stable)

### nvm ###
You'll need [nodejs](https://nodejs.org/en/) installed.  As time goes on, the required version of nodejs changes. To make this feasible, we use [nvm-windows](https://github.com/coreybutler/nvm-windows) on Windows to install and manage which version of nodejs is active for the build process. To install nvm on Windows, go to  [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases) and download the latest nvm-setup.zip file. Unzip the downloaded file and run the nvm-setup.exe program to install nvm.

### nodejs ###
Once nvm has been installed for windows, run these commands in a command window to install the needed versions of nodejs. This needs to be done only once.

    nvm install 16.13.0 # or whatever the version should be. Check "engines" field of package.json.

The following command is also helpful to switch between node versions:

    nvm use 16.13.0 # or whatever the version should be. Check "engines" field of package.json.

### yarn install ###
Finally, run yarn in a command line (e.g. in VSCode) to install dependencies

    yarn

---

## Running locally ##
To run the code locally, do:

    yarn start

This runs the app in the development mode and should open a web browser page at [http://localhost:3000](http://localhost:3000).

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


## Unit Tests ##
To run the unit tests, do

    yarn test
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

---

### Pointing to Prod, Dev, or Local
This project talks to a Parse server to get the list of books. This can be the Production Parse server, or the Development Parse server, or a locally hosted Parse server. You can manually change which server it talks to if needed.

Go to the file ```ParseServerConnection.ts``` and modify it to point to the desired server.

---

## bloom-player
This project depends upon the companion [bloom-player](https://github.com/BloomBooks/bloom-player) repository to provide the book reading experience.
This is installed as a normal dependency. However, sometimes during the development process you may wish to run your own local build of bloom-player.

If you need to do that, there are a couple options:
### A) yarn link
One option is to ```yarn link``` to the local bloom-player source code on the same computer.<br />
Official documentation: https://classic.yarnpkg.com/lang/en/docs/cli/link/

### B) manual copy
Another option is to manually copy the bloom-player build to BloomLibrary.
In the bloom-player repository, build it there:<br />
```yarn build-dev``` (or ```yarn build```)

bloom-player will build it in its ```dist``` folder. Overwrite this project's ```node_modules/bloom-player/dist``` folder with the newly-built ```dist``` folder from bloom-player.  (Remember to restore the original ```dist``` folder when you're done)


---

## Kanban / Bug Reports

We use [YouTrack](https://silbloom.myjetbrains.com) Kanban boards.

## Continuous Build System

Each time code is checked in, an automatic build begins on our [TeamCity build server](https://build.palaso.org/project/Bloom), running all the unit tests.


---

# Learn More about Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

---
### Ejecting from Create React App ###
**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.



# License

Bloom is open source, using the [MIT License](http://sil.mit-license.org). It is Copyright SIL International.
"Bloom" is a registered trademark of SIL International.
