import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from 'src/auth/dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  /**
   * UTILS
   */

  async create(dto: SignupDto): Promise<User> {
    const user: User = this.usersRepo.create({
      username: dto.username,
      hashedPassword: await bcrypt.hash(dto.password, 5),
      email: dto.email,
      tag: await this.getUniqueTag(dto.username),
    });
    return this.usersRepo.save(user);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async getUniqueTag(username: string) {
    const usersWithSameUsername: User[] = await this.usersRepo.find({
      where: { username },
    });
    if (usersWithSameUsername.length >= 8999) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }
    const unavailableTag: number[] = [];
    usersWithSameUsername.map((user) => unavailableTag.push(user.tag));
    let tag: number | null = null;
    do {
      tag = Math.floor(Math.random() * 9000 + 1000);
    } while (unavailableTag.includes(tag));
    return tag;
  }
}
