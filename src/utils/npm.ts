// Get the last released version of an npm package before a given date.
export const mostRecentVersion = async (packageName: string, beforeDate: Date) => {

    // Get all versions of the package from the npm registry.
    const response = await fetch('https://registry.npmjs.org/' + packageName);
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    const versions = (await response.json()).time;

    // Filter versions that are before the given date
    const versionsBeforeDate = Object.keys(versions)
        .filter(version => {
            // Excludes versions like 'modified', 'created', etc. and prerelease versions
            const semverRegex = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;
            return semverRegex.test(version) && new Date(versions[version]) <= beforeDate;
        });

    // Sort the versions as they might not be chronologically sorted.
    versionsBeforeDate.sort((a, b) => new Date(versions[a]).getTime() - new Date(versions[b]).getTime());

    // Find the most recent version before the given date.
    return versionsBeforeDate.length > 0
        ? versionsBeforeDate[versionsBeforeDate.length - 1]
        : '*';
};