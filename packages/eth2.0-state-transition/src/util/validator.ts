/**
 * @module chain/stateTransition/util
 */

import {
  BeaconState,
  BLSSignature,
  CommitteeIndex,
  Epoch,
  Slot,
  uint64,
  Validator,
  ValidatorIndex,
} from "@chainsafe/eth2.0-types";
import {IBeaconConfig} from "@chainsafe/eth2.0-config";
import {getCurrentEpoch} from "./epoch";
import {hash, intDiv, bytesToInt} from "@chainsafe/eth2.0-utils";
import {getBeaconCommittee} from "./committee";


export function computeCompactValidator(config: IBeaconConfig, validator: Validator, index: ValidatorIndex): uint64 {
  // `index` (top 6 bytes) + `slashed` (16th bit) + `compact_balance` (bottom 15 bits)
  const compactBalance = validator.effectiveBalance / config.params.EFFECTIVE_BALANCE_INCREMENT;
  const compactValidator = (BigInt(index) << 16n) + (BigInt(validator.slashed ? 1 : 0) << 15n) + compactBalance;
  return compactValidator;
}

/**
 * Check if [[validator]] is active
 */
export function isActiveValidator(validator: Validator, epoch: Epoch): boolean {
  return validator.activationEpoch <= epoch && epoch < validator.exitEpoch;
}

/**
 * Check if [[validator]] is slashable
 */
export function isSlashableValidator(validator: Validator, epoch: Epoch): boolean {
  return (
    !validator.slashed &&
    validator.activationEpoch <= epoch &&
    epoch < validator.withdrawableEpoch
  );
}

/**
 * Return the sequence of active validator indices at [[epoch]].
 */
export function getActiveValidatorIndices(state: BeaconState, epoch: Epoch): ValidatorIndex[] {
  const indices: ValidatorIndex[] = [];
  state.validators.forEach((validator, index) => {
    if (isActiveValidator(validator, epoch)) {
      indices.push(index);
    }
  });
  return indices;
}

/**
 * Return the validator churn limit for the current epoch.
 */
export function getValidatorChurnLimit(config: IBeaconConfig, state: BeaconState): number {
  return Math.max(
    config.params.MIN_PER_EPOCH_CHURN_LIMIT,
    intDiv(
      getActiveValidatorIndices(state, getCurrentEpoch(config, state)).length,
      config.params.CHURN_LIMIT_QUOTIENT
    ),
  );
}

export function isAggregator(
  config: IBeaconConfig,
  state: BeaconState,
  slot: Slot,
  index: CommitteeIndex,
  slotSignature: BLSSignature
): boolean {
  const committee = getBeaconCommittee(config, state, slot, index);
  const modulo = Math.max(1, intDiv(committee.length, config.params.TARGET_COMMITTEE_SIZE));
  return (bytesToInt(hash(slotSignature).slice(0, 8)) % modulo) === 0;
}