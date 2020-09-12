import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./App";
import "bootswatch/dist/lumen/bootstrap.min.css";
import "./index.css";
import "./App.css";

import { ConfigureStore } from "./redux/configureStore";

const store = ConfigureStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
