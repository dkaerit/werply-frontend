import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../user.schema';
import { UserDto } from '../user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUser: UserDocument = { username: 'newuser', email: 'newuser@example.com', passwd: '1234', nickname: 'nickname' } as UserDocument;
  let mockUsers = [
    { username: 'user1', email: 'user1@example.com' },
    { username: 'user2', email: 'user2@example.com' },
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, {
        // Simula el modelo de mongoose para User durante las pruebas.
        provide: getModelToken(User.name),
        useValue: {
          find: jest.fn(), // función simulada que imita "find" de mongoose
          findOne: jest.fn(), // función simulada que imita "findOne" de mongoose
          save: jest.fn(), // función simulada que imita "save" de mongoose,
          exec: jest.fn(), // función simulada que imita "save" de mongoose
        },
      }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      jest.spyOn(userService, 'createUser').mockResolvedValueOnce(mockUser);
      const result = await controller.createUser(mockUser as UserDto);
      expect(result).toBe(mockUser);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user by username', async () => {
      const mockUsername = 'testuser';
      const mockUser: UserDto = {
        username: mockUsername,
        email: 'testuser@example.com',
      };

      jest.spyOn(userService, 'findUserByField').mockResolvedValueOnce(mockUser);
      const result = await controller.getUserByUsername(mockUsername);
      expect(result).toEqual(expect.objectContaining({ username: mockUsername }));
    });
  });

  // Prueba para verificar el si el tipo de los usuarios listados es correcto
  describe('getUsers', () => {
    it('should return an Array of type User', async () => {
      jest.spyOn(userService, 'readUsers').mockImplementation(() => Promise.resolve(mockUsers as unknown as User[]));
      const result = await controller.getUsers();
      expect(result).toEqual(mockUsers);
    })
  })
});