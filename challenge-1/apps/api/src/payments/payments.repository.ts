import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository, LessThan, MoreThan } from 'typeorm';
import { Payment } from '@app/shared';

export interface PaginationOptions {
  limit: number;
  offset?: number;
  cursor?: string; // payment ID
}

@Injectable()
export class PaymentsRepository extends Repository<Payment> {
  private readonly logger = new Logger(PaymentsRepository.name);

  constructor(private dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }

  async findPaginated(options: PaginationOptions) {
    const { limit, offset, cursor } = options;
    const queryBuilder = this.createQueryBuilder('payment');

    queryBuilder.take(limit);

    if (cursor) {
      // Cursor-based pagination (using ID as simple cursor)
      // For more complex feeds, use a composite key or a sortable field like createdAt
      queryBuilder.where('payment.id > :cursor', { cursor });
    } else if (offset !== undefined) {
      // Offset-based pagination
      queryBuilder.skip(offset);
    }

    queryBuilder.orderBy('payment.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      nextCursor: items.length === limit ? items[items.length - 1].id : null,
    };
  }
}
