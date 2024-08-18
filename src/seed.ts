import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export async function seedDatabase(prisma: PrismaService) {
  const users = [
    {
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'Labpro',
      password: 'admin123',
      role: 'admin',
    },
    {
      email: 'user@example.com',
      username: 'user',
      firstName: 'User',
      lastName: 'Labpro',
      password: 'user123',
      role: 'user',
    },
  ];

  for (const user of users) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
          data: {
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            password: hashedPassword,
            role: user.role,
          },
        });
        console.log(`User ${user.username} created`);
      } else {
        console.log(`User ${user.username} already exists`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.username}: ${error.message}`);
    }
  }
}
