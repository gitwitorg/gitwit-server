import j from 'jscodeshift'
import { applyTransform, addDependency, addImports, addComponent } from '../utils'
import { FileList } from "../types"

const IMPORTS = `import { Label } from "@teovilla/shadcn-ui-react"
import { RadioGroup, RadioGroupItem } from "@teovilla/shadcn-ui-react"`

const COMPONENT = `
{/* RadioGroup component */}
<RadioGroup defaultValue="comfortable">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="default" id="r1" />
    <Label htmlFor="r1">Default</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="comfortable" id="r2" />
    <Label htmlFor="r2">Comfortable</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="compact" id="r3" />
    <Label htmlFor="r3">Compact</Label>
  </div>
</RadioGroup>
`;

export const transformAppFile = (root: j.Collection) => {

  addImports(root, IMPORTS)
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
    transformedFiles["/package.json"] = addDependency(files["/package.json"], "@teovilla/shadcn-ui-react", "*")
  }
  return transformedFiles;
}