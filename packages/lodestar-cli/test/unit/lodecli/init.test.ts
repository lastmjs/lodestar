import * as fs from "fs";
import yargs from "yargs/yargs";
import {expect} from "chai";
import rimraf from "rimraf";

import * as beacon from "../../../src/lodecli/cmds/beacon";

describe("beacon cli", function() {
  this.timeout(0);

  const tmpDir = ".tmp";

  after(async () => {
    await new Promise(resolve => rimraf(tmpDir, resolve));
  });

  it("should init beacon configuration", async function() {
    // initialize beacon node configured to talk to testnet
    // @ts-ignore
    await new Promise(resolve => yargs().defaults({
      rootDir: tmpDir,
    }).command(beacon as any).help().parse(["beacon", "init"], resolve));
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(fs.existsSync(tmpDir)).to.be.true;
    expect(fs.existsSync(`${tmpDir}/beacon/beacon.config.json`)).to.be.true;
  });
});
