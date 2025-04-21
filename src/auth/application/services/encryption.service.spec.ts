import { HttpException } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should return a hashed password when provided with a valid input', async () => {
      const mockSalt = 'mockSalt';
      const mockHashedPassword = 'mockHashedPassword';
      const password = 'testPassword';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

      const result = await encryptionService.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10); // saltRounds is 10
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(mockHashedPassword);
    });

    it('should throw an HttpException when hashing fails', async () => {
      const mockSalt = 'mockSalt';
      const password = 'testPassword';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(null);

      await expect(encryptionService.hashPassword(password)).rejects.toThrow(
        new HttpException('Error hashing password', 500),
      );

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
    });
  });
});
