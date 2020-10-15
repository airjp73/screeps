"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";

const dest = process.env.DEST;
const screepsConfig = require("./screeps.json");
const destinationConfig = screepsConfig[dest];

if (!dest) {
  console.log(
    "No destination specified - code will be compiled but not uploaded"
  );
} else if (destinationConfig == null) {
  throw new Error("Invalid upload destination");
}

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    screeps({ config: destinationConfig, dryRun: screepsConfig == null }),
  ],
};
