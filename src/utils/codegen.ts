// Detect all packages imported in block of JavaScript code and return the package names.
export const detectImportStatements = (content: string): string[] => {
    const pattern = /^import\s+.*?\s+from\s+['"]([^\/\.].*)['"];?$/gm;
    const matches = content.match(pattern);
  
    const extractPackageName = (packageName: string): string => {
      const packageRegex = /^(@[^/]+\/[^/]+|[^/]+)(?:\/|$)/;
      const match = packageName.match(packageRegex);
      return match ? match[1] : "";
    };
  
    if (matches) {
      return matches
        .map((match) => {
          const importStatement = match.match(/['"](.*?)['"]/);
          return importStatement ? extractPackageName(importStatement[1]) : "";
        })
        .filter((packageName) => packageName !== "");
    }
  
    return [];
  };