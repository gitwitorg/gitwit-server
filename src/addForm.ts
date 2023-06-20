import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addHooks, addComponent } from './utils'
import { FileList } from "./types"

const USE_FORM = `\
import { useState } from 'react';

const useAjaxForm = (url) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        // Handle the response data
        console.log(data);
      })
      .catch((error) => {
        setIsLoading(false);
        // Handle errors
        setError(error);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return { formData, isLoading, error, handleSubmit, handleChange };
};

export default useAjaxForm;
`

const HOOKS = `
const apiBaseUrl = 'https://reqres.in/api/login';
const { formData, isLoading, error, handleSubmit, handleChange } = useAjaxForm(apiBaseUrl);
`

const COMPONENT = `\
<form onSubmit={handleSubmit}>
<label>
  Name:
  <input type="text" name="name" onChange={handleChange} />
</label>
<br />
<label>
  Email:
  <input type="email" name="email" onChange={handleChange} />
</label>
<br />
<button type="submit" disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
</form>
{error && <p>Error: {error.message}</p>}
`;

export const transformAppFile = (root: j.Collection, { importPath }: { importPath: string }) => {

  const IMPORTS = `
  import useAjaxForm from '${importPath}utils/useAjaxForm';
  `

  addImports(root, IMPORTS)
  addHooks(root, HOOKS)
  addComponent(root, COMPONENT)

  return root;
};

export default (files: FileList, activeFile: string) => {
  let transformedFiles: FileList = {};
  if (files[activeFile]) {
    try {
      const distance = activeFile.split("/").length - 1;
      const importPath = distance > 1 ? "../".repeat(distance - 1) : "./"
      transformedFiles[activeFile] = applyTransform(files[activeFile], transformAppFile, { importPath });
    }
    catch (e) {
      console.log(e)
      throw new Error(`${activeFile}: You can't put that component here!`)
    }
  }
  if (files["/package.json"]) {
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "firebase", "*")
  }
  transformedFiles["/utils/useAjaxForm.js"] = USE_FORM;
  return transformedFiles;
}