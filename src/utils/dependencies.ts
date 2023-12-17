import Queue from "./queue";
import { mostRecentVersion } from "./npm";

// Use the knowledge cutoff date to find compatible dependencies.
const timeMachineDate = new Date('2021-09-01');

type VersionResultStatus = "loading" | "ready" | "sent";

const packageVersions: Record<string, Record<string, string>> = {
    "react-router-dom": { "react-router-dom": "5.3.4" },
    "react-chartjs-2": { "react-chartjs-2": "3.2.0", "chart.js": "3.5.1" },
    "react-webcam": { "react-webcam": "7.2.0" }
};

export class DependencyIndex {
  peerDependencies: Set<string>;
  versionRequests: Queue; // A queue of requests to the npm registry.
  versionResults: { [key: string]: string }; // A map of package names to their latest versions.
  versionResultStatuses: { [key: string]: VersionResultStatus }; // A map of package names to their latest versions.

  constructor() {
    this.versionRequests = new Queue();
    this.versionResults = {};
    this.peerDependencies = new Set();
    // Ignore these three because they are already included in the template.
    this.versionResultStatuses = {
      react: "loading",
      "react-dom": "loading",
      "react-scripts": "loading",
    };
  }

  public dependencies() {
    // Find all dependencies that are ready to be sent.
    const versionsToSend: { [key: string]: string } = {};
    for (const packageName in this.versionResultStatuses) {
      if (this.versionResultStatuses[packageName] === "ready") {
        this.versionResultStatuses[packageName] = "sent";
        versionsToSend[packageName] = this.versionResults[packageName];
      }
    }
    return versionsToSend;
  }

  public async fetchVersion(packageName: string) {
    if (packageVersions.hasOwnProperty(packageName)) {
      for (const [dependencyName, version] of Object.entries(
        packageVersions[packageName]
      )) {
        this.versionResults[dependencyName] = version;
        this.versionResultStatuses[dependencyName] = "ready";
      }
      return;
    }

    // Ensure that we only make one request per package.
    if (this.versionResultStatuses.hasOwnProperty(packageName)) return;
    this.versionResultStatuses[packageName] = "loading";

    // Add the version request to the queue.
    this.versionRequests.addTask(async () => {
      try {
        const version = await mostRecentVersion(packageName, timeMachineDate);
        this.versionResults[packageName] = version.version;
        // Add all peer dependencies to the list of dependencies.
        for (const key in version.peerDependencies) {
          this.peerDependencies.add(key);
        }
      } catch (error) {
        console.error("Error fetching version for", packageName, error);
        this.versionResults[packageName] = "*";
      }
      this.versionResultStatuses[packageName] = "ready";
    });
  }
}
