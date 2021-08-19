import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'
import App from './App';
import RApp from './R_App.jsx';
import * as serviceWorker from './serviceWorker';

/* Legacy Switch for refactor TODO: Remove when legacy code is obsolete as reference material*/
const AppEntry = process.env.REACT_APP_BUILD_TYPE === "legacy" ? <App/> : <RApp/>

console.log(process.env)

if (process.env.REACT_APP_BUILD_TYPE === "legacy") {
  console.warn("Currently displaying legacy UI :: I hope this is on purpose.")
}

ReactDOM.render(
  AppEntry,
  document.getElementById('root')
);

serviceWorker.unregister();
