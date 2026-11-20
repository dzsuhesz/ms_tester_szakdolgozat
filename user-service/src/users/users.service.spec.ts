import { UsersService } from "./users.service";
import * as bcrypt from "bcryptjs";
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
    let service: UsersService;

    const dto = { email: 'Elek@Gmail.com', name: 'TesztElek', password: 'titok42'};

    beforeEach(() => {
        service = new UsersService();
    });

    describe('create', () => {

        it('user create, get normal emal and name', async () => {
            const user = await service.create(dto);

            expect(user.email).toBe('elek@gmail.com');
            expect(user.name).toBe('TesztElek');
            expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(user.createdAt).toBeInstanceOf(Date);
        });

        it('password and password hash 404', async () => {
            const user = await service.create(dto);

            expect(user).not.toHaveProperty('passwordHash');
            expect(user).not.toHaveProperty('password');

        });

        it('password stored as bcrpyt', async() => {
            await service.create(dto);
            const stored = service.findByEmail('elek@gmail.com')!;

            expect(stored.passwordHash).not.toBe(dto.password);
            expect(await bcrypt.compare(dto.password, stored.passwordHash)).toBe(true);
        });

        it('email 409', async () => {
            await service.create(dto);

            await expect(service.create({ ...dto, email: dto.email.toUpperCase() })).rejects.toThrow(ConflictException);
        });
    });
    
    describe('findById', () => {
        it('get user', async () => {
            const created = await service.create(dto);

            expect(service.findById(created.id)).toEqual(created);
        });

        it('404 for user', () => {
            expect(() => service.findById('no such id')).toThrow(NotFoundException);
        });
    }); 

});