import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {randomUUID} from 'crypto';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import bcrypt from 'bcryptjs';

// dependency injection, nem én hozom létre, hanem a nest

@Injectable()
export class UsersService {
    private users = new Map<string, User>();

    async create(dto: CreateUserDto) {
        const email = dto.email.trim().toLowerCase();

        if (this.findByEmail(email)){
            throw new ConflictException("Email alrady registered");
        }
    

    const user: User = {
        id: randomUUID(),
        email: email,
        name: dto.name.trim(),
        // password -> hash lesz, 1024 kör és 0,1 mp lassúság biztonsági okok miatt
        passwordHash: await bcrypt.hash(dto.password, 10),
        createdAt: new Date(),
    };
    this.users.set(user.id, user);

    return this.toPublic(user);
    }


    findById(id: string) {
        const user = this.users.get(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
            return this.toPublic(user);
    }



    findByEmail(email: string): User | undefined {
        const wanted = email.trim().toLowerCase();
        for (const user of this.users.values()) {
            if (user.email === wanted) {
                return user;
            }
        }
        return undefined;
    }

    //mentés privátból publicba

    private toPublic(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

  }
}