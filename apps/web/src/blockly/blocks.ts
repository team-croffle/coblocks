import * as Blockly from 'blockly/core';

import { TURN_STEP } from '@coblocks/shared';

/**
 * 미션 블록 정의.
 *
 * 블록 종류는 IR(`BlockKind`)과 1:1 로 맞춘다 — 에디터에만 있는 개념을 만들면
 * 변환기가 그것을 어떻게든 흉내 내야 하고, 그 순간 서버가 채점하는 것과 화면이
 * 보여주는 것이 갈라진다.
 *
 * 색은 개념 색을 그대로 쓴다(순차 = seq, 반복 = loop). Blockly 는 CSS 변수를 읽지
 * 못하므로 토큰과 같은 값을 여기에 적어 둔다. tokens.css 를 바꾸면 여기도 바꾼다.
 */
export const BLOCK_COLOURS = { seq: '#7C3AED', loop: '#EC4899' } as const;

export const BLOCK_FORWARD = 'coblocks_forward';
export const BLOCK_TURN = 'coblocks_turn';
export const BLOCK_REPEAT = 'coblocks_repeat';

let defined = false;

/** Blockly 는 전역 레지스트리를 쓰므로 한 번만 등록한다. */
export function defineBlocks(): void {
  if (defined) return;
  defined = true;

  Blockly.defineBlocksWithJsonArray([
    {
      type: BLOCK_FORWARD,
      message0: '앞으로 %1 칸',
      args0: [{ type: 'field_number', name: 'COUNT', value: 1, min: 1, max: 20, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: BLOCK_COLOURS.seq,
      tooltip: '보고 있는 방향으로 이동합니다.',
    },
    {
      type: BLOCK_TURN,
      message0: '%1 으로 돌기',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            ['오른쪽', String(TURN_STEP)],
            ['왼쪽', String(-TURN_STEP)],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BLOCK_COLOURS.seq,
      tooltip: '제자리에서 방향만 바꿉니다.',
    },
    {
      type: BLOCK_REPEAT,
      message0: '%1 번 반복하기',
      args0: [{ type: 'field_number', name: 'TIMES', value: 3, min: 1, max: 20, precision: 1 }],
      message1: '%1',
      args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      nextStatement: null,
      colour: BLOCK_COLOURS.loop,
      tooltip: '안에 넣은 블록을 정한 횟수만큼 되풀이합니다.',
    },
  ]);
}

/** 미션이 노출할 블록만 담은 툴박스를 만든다. */
export function toolboxFor(kinds: readonly string[]): Blockly.utils.toolbox.ToolboxDefinition {
  return {
    kind: 'flyoutToolbox',
    contents: kinds.map((type) => ({ kind: 'block', type })),
  };
}

/** v0.1 의 기본 구성. 미션별 제한은 v0.2 문제 에디터에서 붙인다. */
export const DEFAULT_BLOCKS = [BLOCK_FORWARD, BLOCK_TURN, BLOCK_REPEAT] as const;
