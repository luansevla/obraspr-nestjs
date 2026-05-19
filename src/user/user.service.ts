// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class UserService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cryptoService: CryptoService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds,
    );
    const encryptedDocument = this.cryptoService.encrypt(
      createUserDto.document,
    );
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      document: encryptedDocument,
      birthday: new Date(createUserDto.birthday),
    });
    const savedUser = await createdUser.save();
    const userObject = savedUser.toObject();
    const { password, ...userWithoutPassword } = userObject;
    userWithoutPassword.document = this.cryptoService.decrypt(
      userWithoutPassword.document,
    );
    return userWithoutPassword as unknown as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().select('-password').exec();

    return users.map((user) => {
      // Convertemos o documento do Mongoose de forma segura para o tipo User
      const userObj = user.toObject() as unknown as User;

      // Agora o ESLint sabe que o 'document' existe e é seguro alterá-lo
      userObj.document = this.cryptoService.decrypt(userObj.document);

      return userObj;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userObj = user.toObject() as unknown as User;
    userObj.document = this.cryptoService.decrypt(userObj.document);

    return userObj;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltRounds,
      );
    }

    if (updateUserDto.document) {
      updateData.document = this.cryptoService.encrypt(updateUserDto.document);
    }

    if (updateUserDto.birthday) {
      updateData.birthday = new Date(updateUserDto.birthday);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userObj = updatedUser.toObject() as unknown as User;
    userObj.document = this.cryptoService.decrypt(userObj.document);

    return userObj;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
