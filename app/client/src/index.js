import React from 'react';
import ReactDOM from 'react-dom';
import App from 'App.jsx';
import * as serviceWorker from './serviceWorker';
import 'react-toastify/dist/ReactToastify.css';
import 'semantic-ui-less/semantic.less'
import 'style/tailwind.css';
import 'style/main.scss';

/* Redux Store */
import store from "redux/store/store.js";
import { Provider } from "react-redux";

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
