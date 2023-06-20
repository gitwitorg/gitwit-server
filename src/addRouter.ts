import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addComponent } from './utils'
import { FileList } from "./types"

const IMPORTS = `
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, About, Contact } from './pages';
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
`;

const HOME = `\
export const Home = () => {
  return <h2>Home</h2>;
}
`

const ABOUT = `\
export const About = () => {
  return <h2>About</h2>;
}
`

const CONTACT = `\
export const Contact = () => {
  return <h2>Contact</h2>;
}
`

const INDEX = `\
export { Home } from "./Home";
export { About } from "./About";
export { Contact } from "./Contact";
`

export const transformAppFile = (root: j.Collection) => {

  addImports(root, IMPORTS)

  // Add the constants and functions
  const appExport = root.find(j.ExportDefaultDeclaration);
  appExport.insertBefore(CONSTANTS);
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
  transformedFiles["/pages/Home.js"] = HOME;
  transformedFiles["/pages/About.js"] = ABOUT;
  transformedFiles["/pages/Contact.js"] = CONTACT;
  transformedFiles["pages/index.js"] = INDEX;
  return transformedFiles;
}