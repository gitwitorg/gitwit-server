import prettier from 'prettier'
import j from 'jscodeshift'
import addImportStatements from 'jscodeshift-add-imports'

// Format the modified source code with ESLint or Prettier
export const formatCode = (code: string) =>
  prettier.format(code, {
    parser: 'babel'
  })

// Utility function to compare two ASTs
export const toString = (ast: j.Collection) => formatCode(
  ast.toSource()
)

// Apply an AST transformation to the contents of a file
export const applyTransform = (code: string, transform: Function) =>
  formatCode(
    transform(j(code))
      .toSource()
  )

// Add a dependency to a package.json file
export const addDependency = (code: string, dependency: string, version: string) => {
  const packageJSON = JSON.parse(code);
  packageJSON.dependencies[dependency] = version;
  return JSON.stringify(packageJSON, null, 2);
}

export const addImports = (root: j.Collection, block: string) => {
  const noImports = root.find(j.ImportDeclaration).length === 0;
  if (noImports) {
    root.find(j.Program).get('body', 0).insertBefore("\n");
  }
  addImportStatements(root, j(block).find(j.Statement).nodes());
}

export const addHooks = (root: j.Collection, block: string) => {
  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);
  const returnStament = appExport.find(j.ReturnStatement);

  // Insert the hooks before the return statement
  returnStament.at(0).insertBefore(block);
}

export const addComponent = (root: j.Collection, block: string) => {
  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);
  const returnStament = appExport.find(j.ReturnStatement);

  // Insert the new component add the end of the first JSX element
  returnStament.find(j.JSXElement).at(0)
    .childNodes().at(-1)
    .insertAfter(block);
}