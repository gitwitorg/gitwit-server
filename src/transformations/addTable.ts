import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addHooks, addComponent } from '../utils'
import { FileList } from "../types"

const USE_EFFECT = `\
import { useState, useEffect } from 'react';

const useTableData = (url) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        setData(data);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, [url]);

  return { data, isLoading, error };
};

export default useTableData;
`

const HOOKS = `
const apiEndpoint = 'https://reqres.in/api/users?page=2';
const { data, isLoading, error } = useTableData(apiEndpoint);
`

const COMPONENT = `\
{isLoading ? (
  <p>Loading...</p>
) : error ? (
  <p>Error: {error.message}</p>
) : (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      {data.data && data.data.map((item) => (
        <tr key={item.id}>
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{item.email}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}
`;

export const transformAppFile = (root: j.Collection, { importPath }: { importPath: string }) => {

  const IMPORTS = `
  import useTableData from '${importPath}utils/useTableData';
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
  transformedFiles["/utils/useTableData.js"] = USE_EFFECT;
  return transformedFiles;
}
