// Get the last released version of an npm package before a given date.
export const mostRecentVersion = async (packageName: string, beforeDate: Date) => {

    // Get all versions of the package from the npm registry.
    const response = await fetch('https://registry.npmjs.org/' + packageName);
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    const responseData = await response.json();
    const times = responseData.time;

    // Find the keys that are both in the time and versions objects.
    const versions = Object.keys(times).filter(
        (key: string) => Object.keys(responseData.versions).includes(key)
    )

    // Sort the versions as they might not be chronologically sorted.
    versions.sort((a, b) => new Date(times[a]).getTime() - new Date(times[b]).getTime());

    // Filter versions that are before the given date
    const versionsBeforeDate = versions.filter(version => {
        return new Date(times[version]) <= beforeDate;
    });

    // Find the most recent version before the given date.
    return versionsBeforeDate.length > 0
        ? versionsBeforeDate[versionsBeforeDate.length - 1]
        : '*';

    return responseData.versions[versionNumber];
};