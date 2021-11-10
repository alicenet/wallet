import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Legacy APP Entry Point
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-less/semantic.less'
import 'style/tailwind.css';
import 'style/main.scss';

/* Redux Store */
import store from "redux/store/store.js"; // Redux store if using
import { Provider } from "react-redux";
/* Logging */
import log from 'loglevel';
log.setLevel('trace', false);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
