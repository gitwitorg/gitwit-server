// Detect all packages imported in block of JavaScript code and return the package names.
export const detectImportStatements = (content: string): string[] => {
    const pattern = /^import\s+(?:.*?\s+from\s+)?['"]([^\/\.][^\n]*)['"];?\s*(?:\/\/[^\n]*)?$/gms;

    const matches = [];
    let match;
    while ((match = pattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
      
    const extractPackageName = (packageName: string): string => {
      const packageRegex = /^(@[^/]+\/[^/]+|[^/]+)(?:\/|$)/;
      const match = packageName.match(packageRegex);
      return match ? match[1] : "";
    };
  
    if (matches) {
      return matches
        .map(match => match ? extractPackageName(match) : "")
        .filter((packageName) => packageName !== "");
    }
  
    return [];
  };