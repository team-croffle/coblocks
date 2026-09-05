import type * as Blockly from 'blockly/core';

import { MAX_PROGRAM_BLOCKS, TURN_STEP } from '@coblocks/shared';
import type { BlockProgram, ProgramBlock } from '@coblocks/shared';

import { BLOCK_FORWARD, BLOCK_REPEAT, BLOCK_TURN } from './blocks';

/**
 * Blockly 워크스페이스를 IR 로 옮긴다.
 *
 * **IR 이 정본이다.** 서버는 Blockly 를 실행할 수 없으므로(브라우저 DOM 의존) 화면이
 * 이 변환을 맡고, 서버는 IR 만 받아 다시 검증하고 실행한다. 그래서 여기서 만드는 값은
 * 서버의 `validateProgram` 을 그대로 통과해야 한다.
 */
export function workspaceToIr(workspace: Blockly.Workspace): BlockProgram {
  const program: BlockProgram = [];

  // 최상위 블록이 여러 개면 화면에서 위에 있는 것부터 이어 붙인다.
  for (const top of workspace.getTopBlocks(true)) {
    appendChain(top, program);
  }
  return program.slice(0, MAX_PROGRAM_BLOCKS);
}

function appendChain(start: Blockly.Block | null, out: BlockProgram): void {
  let block: Blockly.Block | null = start;
  while (block) {
    if (block.isEnabled() && !block.isInsertionMarker()) appendBlock(block, out);
    block = block.getNextBlock();
  }
}

function appendBlock(block: Blockly.Block, out: BlockProgram): void {
  const id = block.id;

  switch (block.type) {
    case BLOCK_FORWARD: {
      // "앞으로 3칸" 은 fwd 세 개다. 화면에서는 한 블록이지만 실행은 세 걸음이다.
      const count = numberField(block, 'COUNT', 1);
      for (let i = 0; i < count; i++) out.push({ kind: 'fwd', id });
      return;
    }
    case BLOCK_TURN: {
      const raw = Number(block.getFieldValue('DIR'));
      const deg = Number.isFinite(raw) ? raw : TURN_STEP;
      out.push({ kind: 'turn', id, deg });
      return;
    }
    case BLOCK_REPEAT: {
      const body: BlockProgram = [];
      appendChain(block.getInputTargetBlock('DO'), body);
      // 안이 비어 있으면 실행할 것이 없다. rep/end 짝만 남기면 인터프리터가 헛돈다.
      if (body.length === 0) return;
      out.push({ kind: 'rep', id, count: numberField(block, 'TIMES', 1) }, ...body, {
        kind: 'end',
        id,
      });
      return;
    }
    default:
      // 모르는 블록은 조용히 건너뛴다. 알 수 없는 종류를 IR 에 넣으면 서버가 제출 전체를
      // invalid 로 되돌려, 학생은 이유를 알 수 없는 실패만 보게 된다.
      return;
  }
}

function numberField(block: Blockly.Block, name: string, fallback: number): number {
  const value = Number(block.getFieldValue(name));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(20, Math.max(1, Math.trunc(value)));
}

/** IR 블록이 어느 Blockly 블록에서 왔는지 — 실행 중 하이라이트에 쓴다. */
export const sourceBlockId = (block: ProgramBlock): string | undefined => block.id;
