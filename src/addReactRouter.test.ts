import j from 'jscodeshift'
import { addReactRouter } from "./addReactRouter";
import { toString } from "./utils";

//
// The transformation
//

const transformation = addReactRouter;
const transformationName = "Add React router";

//
// The input of the transformation
//

const root = j(`\
export default function App() {
  return <h1>Hello friend</h1>
}\
`);

//
// The expected output of the transformation
//

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

//
// Check that the transformation works as expected
//
describe(transformationName, () => {
  test("Check AST transformation", () => {
    expect(
      toString(transformation(root))
    ).toEqual(
      toString(expected)
    )
  });
});