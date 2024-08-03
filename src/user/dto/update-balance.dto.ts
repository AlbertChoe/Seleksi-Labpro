import { IsInt, Min } from 'class-validator';

export class UpdateBalanceDto {
  @IsInt()
  @Min(1)
  increment: number;
}
