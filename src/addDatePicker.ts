import j from 'jscodeshift'
import { applyTransform, addDependency } from './utils'
import { FileList } from "./types"

const IMPORTS = `
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
`

const HOOKS = `
// State to store the selected date
const [selectedDate, setSelectedDate] = useState(null);

// Event handler for date change
const handleDateChange = (date) => {
  setSelectedDate(date);
};
`;

const COMPONENT = `
{/* DatePicker component */}
<DatePicker
  selected={selectedDate}
  onChange={handleDateChange}
  dateFormat="dd/MM/yyyy"
/>
`;

export const transformAppFile = (root: j.Collection) => {

  // Find existing imports
  const importDeclaration = root.find(j.ImportDeclaration);
  // Insert the imports after the last existing import
  if (importDeclaration.length) {
    importDeclaration.at(-1).insertAfter(IMPORTS);
  }
  // Add the imports to the beginnning of the file
  else {
    root.find(j.Program).get('body', 0).insertBefore(IMPORTS);
  }

  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);
  const returnStament = appExport.find(j.ReturnStatement);

  // Insert the hooks before the return statement
  returnStament.at(0).insertBefore(HOOKS);

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
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "react-datepicker", "*")
  }
  return transformedFiles;
}