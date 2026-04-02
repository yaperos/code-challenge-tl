export class TransferStartedEvent {
  constructor(
    public readonly transferId: string,
    public readonly fromWalletId: string,
    public readonly toWalletId: string,
    public readonly amount: number,
    public readonly version: number,
  ) {}
}

export class TransferCompletedEvent {
  constructor(
    public readonly transferId: string,
    public readonly version: number,
  ) {}
}

export class TransferFailedEvent {
  constructor(
    public readonly transferId: string,
    public readonly reason: string,
    public readonly version: number,
  ) {}
}
