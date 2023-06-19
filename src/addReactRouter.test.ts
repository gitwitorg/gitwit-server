import j from 'jscodeshift'
import { addReactRouter } from "./addReactRouter";
import { toString } from "./utils";

describe("Simple expression tests", () => {
  test("Check literal value", () => {
    const root = j(`\
export default function App() {
  return <h1>Hello friend</h1>
}\
`);
    const transformed = addReactRouter(root);
    const expected = j(`\
import { BrowserRouter, Route, Router, Switch } from "react-router-dom";

function Home() {
  return <h1>Hello world</h1>;
}

function About() {
  return <h1>About page</h1>;
}

export default function App() {
  return <Router><Switch><Route exact={true} path={"/"} component={Home}></Route><Route path={"/about"} component={About}></Route></Switch></Router>;
}\
`)
    expect(toString(transformed)).toEqual(toString(expected))
  });
});