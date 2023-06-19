import j from 'jscodeshift'

export const addReactRouter = (root: j.Collection) => {

  // Construct new imports
  const reactRouterImport = j.importDeclaration(
    [
      j.importSpecifier(j.identifier('BrowserRouter'), j.identifier('BrowserRouter')),
      j.importSpecifier(j.identifier('Route'), j.identifier('Route')),
      j.importSpecifier(j.identifier('Router'), j.identifier('Router')),
      j.importSpecifier(j.identifier('Switch'), j.identifier('Switch')),
    ],
    j.literal('react-router-dom')
  );

  // Find existing imports
  const importDeclaration = root.find(j.ImportDeclaration);
  if (importDeclaration.length) {
    // If imports exist, add after the last import
    const lastImportDeclaration = importDeclaration.at(importDeclaration.length - 1);
    lastImportDeclaration.insertAfter(reactRouterImport);
  }
  else {
    // If no imports exist, add to the beginning
    const firstNode = root.find(j.Program).get('body', 0);
    firstNode.insertBefore(reactRouterImport);
  }

  // Find the default export
  const appExport = root.find(j.ExportDefaultDeclaration);

  // Create Home and About components
  const homeComponent = j.functionDeclaration(
    j.identifier('Home'),
    [],
    j.blockStatement([j.returnStatement(j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier('h1')), j.jsxClosingElement(j.jsxIdentifier('h1')), [j.jsxText('Hello world')]))])
  );
  const aboutComponent = j.functionDeclaration(
    j.identifier('About'),
    [],
    j.blockStatement([j.returnStatement(j.jsxElement(j.jsxOpeningElement(j.jsxIdentifier('h1')), j.jsxClosingElement(j.jsxIdentifier('h1')), [j.jsxText('About page')]))])
  );

  // Add components before the default export
  appExport.insertBefore(homeComponent)
  appExport.insertBefore(aboutComponent)

  // Replace the default export with a new one
  appExport.replaceWith(
    j.exportDefaultDeclaration(
      j.functionDeclaration(
        j.identifier('App'),
        [],
        j.blockStatement([
          j.returnStatement(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier('Router'), []),
              j.jsxClosingElement(j.jsxIdentifier('Router')),
              [
                j.jsxElement(
                  j.jsxOpeningElement(j.jsxIdentifier('Switch'), []),
                  j.jsxClosingElement(j.jsxIdentifier('Switch')),
                  [
                    j.jsxElement(
                      j.jsxOpeningElement(j.jsxIdentifier('Route'), [
                        j.jsxAttribute(j.jsxIdentifier('exact'), j.jsxExpressionContainer(j.literal(true))),
                        j.jsxAttribute(j.jsxIdentifier('path'), j.jsxExpressionContainer(j.literal('/'))),
                        j.jsxAttribute(j.jsxIdentifier('component'), j.jsxExpressionContainer(j.identifier('Home'))),
                      ]),
                      j.jsxClosingElement(j.jsxIdentifier('Route')),
                      []
                    ),
                    j.jsxElement(
                      j.jsxOpeningElement(j.jsxIdentifier('Route'), [
                        j.jsxAttribute(j.jsxIdentifier('path'), j.jsxExpressionContainer(j.literal('/about'))),
                        j.jsxAttribute(j.jsxIdentifier('component'), j.jsxExpressionContainer(j.identifier('About'))),
                      ]),
                      j.jsxClosingElement(j.jsxIdentifier('Route')),
                      []
                    ),
                  ]
                ),
              ]
            )
          ),
        ])
      )
    )
  );

  return root;
};