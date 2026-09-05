import * as Blockly from 'blockly/core';
import * as Ko from 'blockly/msg/ko';
import { useEffect, useRef } from 'react';

import type { BlockProgram } from '@coblocks/shared';

import { DEFAULT_BLOCKS, defineBlocks, toolboxFor } from '@/blockly/blocks';
import { workspaceToIr } from '@/blockly/to-ir';

interface Props {
  /** 마지막으로 저장된 워크스페이스. 없으면 빈 화면에서 시작한다. */
  initialWorkspace?: unknown;
  /** 블록이 바뀔 때마다 IR 과 워크스페이스를 함께 올려 보낸다. */
  onChange: (program: BlockProgram, workspace: unknown) => void;
  /** 실행 중인 블록 id. 하이라이트한다. */
  activeBlockId?: string | null;
}

Blockly.setLocale(Ko as unknown as Record<string, string>);

/**
 * Blockly 워크스페이스.
 *
 * 이 컴포넌트만 Blockly 를 안다. 바깥은 IR(`BlockProgram`)만 주고받으므로,
 * 나중에 에디터를 갈아끼워도 실행·채점 경로는 그대로다.
 */
export function BlocklyEditor({ initialWorkspace, onChange, activeBlockId }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  // 콜백이 매 렌더 바뀌어도 리스너를 다시 달지 않도록 최신 값만 참조한다.
  const latestOnChange = useRef(onChange);
  latestOnChange.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    defineBlocks();

    const ws = Blockly.inject(host.current, {
      toolbox: toolboxFor(DEFAULT_BLOCKS),
      renderer: 'zelos',
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
      zoom: { controls: true, wheel: false, startScale: 0.9 },
      grid: { spacing: 24, length: 3, colour: 'rgba(0,0,0,0.08)', snap: true },
    });
    workspace.current = ws;

    if (initialWorkspace && typeof initialWorkspace === 'object') {
      try {
        Blockly.serialization.workspaces.load(initialWorkspace as Record<string, unknown>, ws);
      } catch {
        // 저장된 워크스페이스가 옛 형식이면 무시하고 빈 화면에서 시작한다.
      }
    }

    const emit = (): void => {
      latestOnChange.current(workspaceToIr(ws), Blockly.serialization.workspaces.save(ws));
    };
    const listener = (event: Blockly.Events.Abstract): void => {
      if (event.isUiEvent) return;
      emit();
    };
    ws.addChangeListener(listener);
    emit();

    return () => {
      ws.removeChangeListener(listener);
      ws.dispose();
      workspace.current = null;
    };
    // 미션이 바뀌면 부모가 key 로 이 컴포넌트를 통째로 새로 만든다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 실행 중인 블록을 표시한다. Blockly 가 직접 클래스를 붙인다.
  useEffect(() => {
    const ws = workspace.current;
    if (!ws) return;
    ws.highlightBlock(activeBlockId ?? null);
  }, [activeBlockId]);

  return <div ref={host} className='h-[420px] w-full rounded-xl border border-line' />;
}
