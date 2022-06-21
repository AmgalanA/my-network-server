export class createMessageDto {
  readonly text: string;
  readonly senderId: number;
  readonly conversationId?: number;
  readonly messageId?: number;
}
