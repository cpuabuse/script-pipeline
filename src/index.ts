import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { MultiBar, Presets, SingleBar } from "cli-progress";

/**
 * A shell statement.
 */
interface Activity {}

/**
 * Represents a script, with a progress bar.
 */
class Script {
  /**
   * Progress bar.
   */
  bar: SingleBar = null;

  /**
   * Name of the script.
   */
  name: string;

  /**
   * Function to run
   */
  fn: () => void;

  /**
   * Constructor.
   */
  constructor(
    name: string = "unknown",
    fn: () => void = function(): void {
      // Nothing
    }
  ) {
    // Assign members
    this.name = name;
    this.fn = fn;
  }

  /**
   * Executes the script.
   */
  exec(): void {
    // Create bar
    this.bar = multibar.create(totalWeight, 0, {
      script: this.name.padStart(trimLength, space)
    });
  }
}

/**
 * Literal space character.
 */
const space: string = " ";

/**
 * The maximum length of the progress bar script name.
 */
const trimLength: number = 24;

// Create new bar
const multibar: MultiBar = new MultiBar(
  {
    clearOnComplete: true,
    format: "{script} {bar} {percentage}% {eta_formatted}",
    hideCursor: true,
    stopOnComplete: true
  },
  Presets.rect
);

/**
 * NPM script `build:release:client`.
 */
export async function buildReleaseClient(): Promise<void> {
  // Weights
  let rollupBuildWeight: number = 20;
  let rollupWeight: number = 80;
  let totalWeight: number = rollupBuildWeight + rollupWeight;

  // Create bar
  const bar: SingleBar = multibar.create(totalWeight, 0, {
    script: "build:release:client"
      .substring(0, trimLength)
      .padStart(trimLength, space)
  });

  // Build rollup
  await buildReleaseRollup();
  bar.increment(rollupBuildWeight);

  // Call rollup
  await new Promise(function(resolve) {
    // Create process
    let rollup: ChildProcessWithoutNullStreams = spawn(
      "npx",
      ["rollup", "--config", "build/release/bin/rollup/release.client.js"],
      {
        shell: true
      }
    );

    // Increment bar on exit
    rollup.on("exit", function() {
      resolve();
    });
  });
  bar.increment(rollupWeight);
}

/**
 * NPM script `build:release:rollup`.
 */
export async function buildReleaseRollup(): Promise<void> {
  // Weights
  let compileWeight: number = 100;
  let totalWeight: number = compileWeight;

  // Create bar
  const bar: SingleBar = multibar.create(totalWeight, 0, {
    script: "build:release:rollup"
      .substring(0, trimLength)
      .padStart(trimLength, space)
  });

  // Create process
  let spawned: ChildProcessWithoutNullStreams = spawn(
    "npm",
    ["tsc", "--project", "tsconfig/release/rollup.json"],
    {
      shell: true
    }
  );

  // Increment bar on exit
  spawned.on("exit", function() {
    bar.increment(compileWeight);
  });
}
buildReleaseClient();
