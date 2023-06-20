import prettier from 'prettier'
import j from 'jscodeshift'

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