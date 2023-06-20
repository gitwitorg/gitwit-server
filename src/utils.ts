import prettier from 'prettier'
import j from 'jscodeshift'

// Utility function to compare two ASTs
export const toString = (ast: j.Collection) => prettier.format(
  ast.toSource(), { parser: 'babel' }
)

// Format the modified source code with ESLint or Prettier
export const formatCode = (code: string) =>
  prettier.format(code, {
    parser: 'babel'
  })

// Apply an AST transformation to the contents of a file
export const applyTransform = (code: string, transform: Function) => formatCode(transform(j(code)).toSource())