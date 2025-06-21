
export type GestureType = 'idle' | 'pan' | 'swipe' | 'pinch' | 'rotation' | 'tap' | 'longpress';

export interface GestureTransition {
  from: GestureType;
  to: GestureType;
  condition: (event: any) => boolean;
  action?: () => void;
}

export class GestureStateMachine {
  private currentState: GestureType = 'idle';
  private transitions: GestureTransition[] = [];
  private stateHistory: GestureType[] = [];
  private maxHistoryLength = 10;

  constructor() {
    this.initializeTransitions();
  }

  private initializeTransitions(): void {
    this.transitions = [
      {
        from: 'idle',
        to: 'pan',
        condition: (event) => event.type === 'move' && event.distance > 10
      },
      {
        from: 'idle',
        to: 'tap',
        condition: (event) => event.type === 'end' && event.duration < 300 && event.distance < 10
      },
      {
        from: 'idle',
        to: 'longpress',
        condition: (event) => event.type === 'longpress'
      },
      {
        from: 'pan',
        to: 'swipe',
        condition: (event) => event.type === 'end' && event.velocity.magnitude > 0.5
      },
      {
        from: 'idle',
        to: 'pinch',
        condition: (event) => event.type === 'multitouch' && event.pointers === 2
      },
      {
        from: 'pinch',
        to: 'rotation',
        condition: (event) => event.type === 'rotation' && Math.abs(event.rotation) > 5
      }
    ];
  }

  public transition(event: any): GestureType | null {
    const validTransition = this.transitions.find(
      t => t.from === this.currentState && t.condition(event)
    );

    if (validTransition) {
      this.stateHistory.push(this.currentState);
      if (this.stateHistory.length > this.maxHistoryLength) {
        this.stateHistory.shift();
      }

      this.currentState = validTransition.to;
      
      if (validTransition.action) {
        validTransition.action();
      }

      return this.currentState;
    }

    return null;
  }

  public reset(): void {
    this.currentState = 'idle';
  }

  public getCurrentState(): GestureType {
    return this.currentState;
  }

  public getStateHistory(): GestureType[] {
    return [...this.stateHistory];
  }

  public canTransitionTo(targetState: GestureType): boolean {
    return this.transitions.some(
      t => t.from === this.currentState && t.to === targetState
    );
  }
}
