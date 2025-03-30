import { Enterprise } from '@prisma/client';

export interface EnterpriseRepositoryPort {
  findAll(ownerId: ?number): Promise<Enterprise[]>;

  create(value: Primsa.EnterpriseCreateInput): Promise<Enterprise>;

  update(id: string, value: Primsa.EnterpriseUpdateInput): Promise<Enterprise>;

  delete(id: string): Promise<void>;

  findById(
    id: string,
    options: { ownerId?: number } | null,
  ): Promise<Enterprise | null>;

  findBySlug(slug: string): Promise<Enterprise | null>;

  existsSlug(slug: string, id: string): Promise<boolean>;
}
