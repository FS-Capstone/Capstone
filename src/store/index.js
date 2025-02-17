import { createStore, combineReducers, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import auth from "./auth";
import ingredients from "./ingredients";
import pantries from "./pantry";
import complexRecipes from "./complexRecipes";
import ingredientRecipes from './ingredientRecipes';
import selectedPantry from "./selectedPantry";
import wines from "./wines";
import recipeIngredients from './recipeIngredients';
import shoppingList from "./shoppingList";

const reducer = combineReducers({
  auth,
  pantries,
  ingredients,
  complexRecipes,
  selectedPantry,
  ingredientRecipes,
  wines,
  recipeIngredients,
  shoppingList
});

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
export * from "./auth";
export * from "./ingredients";
export * from './pantry';
export * from "./complexRecipes";
export * from './ingredientRecipes';
export * from "./selectedPantry";
export * from "./wines";
export * from './recipeIngredients';
export * from './shoppingList';

