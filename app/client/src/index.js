import React from 'react';
import ReactDOM from 'react-dom';
import RApp from './R_App.jsx';
import * as serviceWorker from './serviceWorker';
import 'react-toastify/dist/ReactToastify.css';
import 'semantic-ui-less/semantic.less'
import 'style/tailwind.css';
import 'style/main.scss';

/* Redux Store */
import store from "redux/store/store.js"; // Redux store if using
import { Provider } from "react-redux";

ReactDOM.render(
  <Provider store={store}>
    <RApp/>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
