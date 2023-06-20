import j from 'jscodeshift'
import { applyTransform, addDependency, addImports } from './utils'
import { FileList } from "./types"

const IMPORTS = `
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
`

const CONSTANTS = `
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
`

const COMPONENT = `
{/* Router component */}
<Router>
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
</Router>
`;

const FUNCTIONS = `
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
`;

export const transformAppFile = (root: j.Collection) => {

  addImports(root, IMPORTS)

  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);

  appExport.insertBefore(CONSTANTS);
  appExport.insertBefore(FUNCTIONS);

  // Find the return statement
  const returnStament = appExport.find(j.ReturnStatement);

  // Insert the new component add the end of the first JSX element
  returnStament.find(j.JSXElement).at(0)
    .childNodes().at(-1)
    .insertAfter(COMPONENT);

  return root;
};

export default (files: FileList) => {
  let transformedFiles: FileList = {};
  if (files["/App.js"]) {
    transformedFiles["/App.js"] = applyTransform(files["/App.js"], transformAppFile);
  }
  if (files["/package.json"]) {
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "react-router-dom", "*")
  }
  return transformedFiles;
}