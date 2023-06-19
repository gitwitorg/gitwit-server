import prettier from 'prettier'

// Utility function to compare two ASTs
export const toString = (ast: j.Collection) => prettier.format(
  ast.toSource(), { parser: 'babel' }
)