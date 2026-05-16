import { AppError } from '../../utils/error';
import {
  WorkflowStateInput,
  WorkflowTransitionInput,
} from './workflow.types';

export function validateWorkflowDefinition(
  states: WorkflowStateInput[],
  transitions: WorkflowTransitionInput[]
) {
  const initial = states.filter((s) => s.isInitial);
  if (initial.length !== 1) {
    throw new AppError('Exactly one initial state required', 400);
  }

  const terminal = states.filter((s) => s.isTerminal);
  if (!terminal.length) {
    throw new AppError('At least one terminal state required', 400);
  }

  const names = new Set(states.map((s) => s.name));

  for (const t of transitions) {
    if (!names.has(t.fromState) || !names.has(t.toState)) {
      throw new AppError('Transition references invalid state', 400);
    }

    if (t.fromState === t.toState) {
      throw new AppError('Transition self-loop not allowed', 400);
    }

    if (t.approvalStrategy === 'quorum' && !t.quorumCount) {
      throw new AppError('quorumCount required', 400);
    }
  }
}