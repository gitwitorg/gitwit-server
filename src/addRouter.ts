import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addComponent, formatCode } from './utils'
import { FileList } from "./types"

const IMPORTS = `
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { pages } from './pages';
`

const COMPONENT = `
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
`;

const HOME = `\
export default function Home() {
  return (<div><h2>Home</h2></div>);
}
`

const ABOUT = `\
export default function About() {
  return (<div><h2>About</h2></div>);
}
`

const CONTACT = `\
export default function Contact() {
  return (<div><h2>Contact</h2></div>);
}
`

const INDEX = `\
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";

export const pages = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
  },
];
`

export const transformAppFile = (root: j.Collection) => {

  addImports(root, IMPORTS)

  // Add the constants and functions
  const appExport = root.find(j.ExportDefaultDeclaration);
  appExport.insertBefore(FUNCTIONS);

  // Add the Router component
  addComponent(root, COMPONENT)

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
  transformedFiles["/pages/Home.js"] = formatCode(HOME);
  transformedFiles["/pages/About.js"] = formatCode(ABOUT);
  transformedFiles["/pages/Contact.js"] = formatCode(CONTACT);
  transformedFiles["pages/index.js"] = formatCode(INDEX);
  return transformedFiles;
}