export enum PositionState {
  INITIALIZED = 'initialized',
	PENDING = 'pending',
	OPEN = 'open',
	CLOSED = 'closed',
}

export class Position {
	constructor(public entryPrice: number, public stopLossPrice: number, public state = PositionState.INITIALIZED) {}

	open() {
		this.state = PositionState.OPEN;
	}

	close() {
		this.state = PositionState.CLOSED;
	}

	updateStopLoss(_stopLossPrice: number) {
    this.stopLossPrice = _stopLossPrice;
  }

  isOpen() {
    return this.state === PositionState.OPEN;
  }

  isClosed() {
    return this.state === PositionState.CLOSED;
  }
}