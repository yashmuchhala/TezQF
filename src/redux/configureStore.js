import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { contract } from "./reducers/contract";
import { round } from "./reducers/round";
import { credentials } from "./reducers/credentials";
import { governance } from "./reducers/governance";
const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});
export const ConfigureStore = () => {
  const store = createStore(
    combineReducers({ contract, round, credentials, governance }),
    composeEnhancers(applyMiddleware(thunk))
  );

  return store;
};
