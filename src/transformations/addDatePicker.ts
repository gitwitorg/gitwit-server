import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addHooks, addComponent } from '../utils'
import { FileList } from "../types"

const IMPORTS = `import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";`

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

  addImports(root, IMPORTS)
  addHooks(root, HOOKS)
  addComponent(root, COMPONENT)

  return root;
};

export default (files: FileList, activeFile: string) => {
  let transformedFiles: FileList = {};
  if (files[activeFile]) {
    try {
      transformedFiles[activeFile] = applyTransform(files[activeFile], transformAppFile);
    }
    catch (e) {
      console.log(e)
      throw new Error(`${activeFile}: You can't put that component here!`)
    }
  }
  if (files["/package.json"]) {
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "react-datepicker", "*")
  }
  return transformedFiles;
}