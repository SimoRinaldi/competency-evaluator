import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './dto/user-role.enum';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>) {}

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({where: {email}});
    }

    findById(id: number): Promise<UserEntity | null> {
        return this.repository.findOne({where: {id}});
    }

    async createOne(dto: CreateUserDto, passwordHash: string): Promise<UserEntity> {
        const user = this.repository.create({
            name: dto.name,
            email: dto.email,
            passwordHash: passwordHash,
            role: dto.role
        });
        return this.repository.save(user);
    }

    findAll(role?: UserRole): Promise<UserEntity[]> {
        if (role) {
            return this.repository.find({
                where: { role },
                order: { id: 'ASC' },
            });
        }
        return this.repository.find({order: {id: 'ASC'}});
    }

    async updateOne(id: number, dto: UpdateUserDto): Promise<UserEntity|null> {
        const user = await this.findById(id);
        if(!user)
            return null;
        if (dto.name !== undefined) user.name = dto.name;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.role !== undefined) user.role = dto.role;

        return this.repository.save(user);
    }

    async deleteOne(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
