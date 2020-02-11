import sinon from "sinon";
import {expect} from "chai";
import {config} from "@chainsafe/eth2.0-config/lib/presets/mainnet";
import {assembleAttestationData} from "../../../../../src/chain/factory/attestation/data";
import {generateState} from "../../../../utils/state";
import {generateEmptyBlock} from "../../../../utils/block";
import {BlockRepository} from "../../../../../src/db/api/beacon/repositories";

describe("assemble attestation data", function () {

  const sandbox = sinon.createSandbox();
  let  dbStub;

  beforeEach(() => {
    dbStub = {
      block: sandbox.createStubInstance(BlockRepository)
    };
    dbStub.config = config;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should produce attestation', async function () {
    const state = generateState({slot: 2});
    const block = generateEmptyBlock();
    const result = await assembleAttestationData(config, dbStub, state, block, 2, 1);
    expect(result).to.not.be.null;
  });

});