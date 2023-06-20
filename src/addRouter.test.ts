import j from 'jscodeshift'
import { transformAppFile } from "./addRouter";
import { toString } from "./utils";

//
// The transformation
//

const transformation = transformAppFile;
const transformationName = "Add Router";

//
// The input of the transformation
//

const root = j(`\
export default function App() {
  return (<div><h1>Hello world</h1></div>)
}\
`);

//
// The expected output of the transformation
//

const expected = j(`\
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const pages = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  }
];

function Navbar() {
  return (
    <nav>
      <ul>
        {pages.map((page, index) => (
          <li key={index}>
            <Link to={page.path}>{page.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Contact() {
  return <h2>Contact</h2>;
}

export default function App() {
  return (
    <div>
      <h1>Hello world</h1>
      {/* Router component */}
      <BrowserRouter>
        <Navbar />
        <Routes>
          {pages.map((page, index) => (
            <Route
              key={index}
              path={page.path}
              element={<page.component />}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
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