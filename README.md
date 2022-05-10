# AliceNet Wallet

#### Requirements
- `Bash 4.5+`
- `Nodejs 10+`
- `NPM 6+`

##
### Setup

1. Clone this repository.
2. Install dependencies: `npm ci`

##
### Build Application
> Application files will be in the /dist director

Linux: `npm run build-linux`  
Windows: `npm run build-windows`    
All: `npm run build-all`

Optionally, for a debug build, create a file `/app/client/.env` containing `REACT_APP_DEBUG=TRUE`. This allows for opening and closing the debug panel with ctrl+shift+Z.

##
### Development Mode
> This allows you to run the application stack without building the app.

1. `npm run dev`
2. Wait for React to start the development server...
3. Reload the application `CTRL+R`

##
#### Refactoring Dev Notes
Refactored files have been made with R_ prefixes to leave existing code with /app for reference during the initial overhaul.
