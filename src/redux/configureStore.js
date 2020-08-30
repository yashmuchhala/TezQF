import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";

import { contract } from "./reducers/contract";

export const ConfigureStore = () => {
  const store = createStore(
    combineReducers({ contract }),
    applyMiddleware(thunk)
  );

  return store;
};
