import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 10);

  await prisma.favorite.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  await Promise.all([
    prisma.category.create({ data: { name: '全部', sortOrder: 0 } }),
    prisma.category.create({ data: { name: '教材', sortOrder: 1 } }),
    prisma.category.create({ data: { name: '电子产品', sortOrder: 2 } }),
    prisma.category.create({ data: { name: '生活用品', sortOrder: 3 } }),
    prisma.category.create({ data: { name: '美妆', sortOrder: 4 } }),
  ]);

  const users = await Promise.all([
    prisma.user.create({
      data: { username: '张三', password: hashedPassword, contact: 'zhangsan@campus.edu' },
    }),
    prisma.user.create({
      data: { username: '李四', password: hashedPassword, contact: 'lisi@campus.edu' },
    }),
    prisma.user.create({
      data: { username: '王五', password: hashedPassword, contact: 'wangwu@campus.edu' },
    }),
  ]);

  const items = [
    { title: '高等数学（第七版）', description: '同济大学编，九成新，无笔记无划线', price: 35, category: '教材', images: 'https://picsum.photos/400/300?random=1', sellerId: users[0].id, status: 'ACTIVE' },
    { title: '线性代数辅导讲义', description: '李永乐编，全新未拆封', price: 25, category: '教材', images: 'https://picsum.photos/400/300?random=2', sellerId: users[1].id, status: 'ACTIVE' },
    { title: '大学英语精读第三册', description: '使用过一学期，状况良好', price: 15, category: '教材', images: 'https://picsum.photos/400/300?random=3', sellerId: users[2].id, status: 'ACTIVE' },
    { title: 'iPad Air 4 64GB 灰色', description: '2021年购入，电池健康度95%，附赠保护壳和笔', price: 2800, category: '电子产品', images: 'https://picsum.photos/400/300?random=4', sellerId: users[0].id, status: 'ACTIVE' },
    { title: '机械键盘 Cherry MX 红轴', description: 'Cherry MX Board 3.0S，自用半年，因升级换轴出售', price: 350, category: '电子产品', images: 'https://picsum.photos/400/300?random=5', sellerId: users[1].id, status: 'ACTIVE' },
    { title: '索尼 WH-1000XM4 耳机', description: '黑色，降噪效果极佳，配件齐全', price: 1200, category: '电子产品', images: 'https://picsum.photos/400/300?random=6', sellerId: users[2].id, status: 'ACTIVE' },
    { title: '小米台灯 Pro', description: '使用两个月，光线柔和不伤眼', price: 80, category: '生活用品', images: 'https://picsum.photos/400/300?random=7', sellerId: users[0].id, status: 'ACTIVE' },
    { title: '宿舍小冰箱 50L', description: '制冷效果好，搬家带不走，自取优先', price: 200, category: '生活用品', images: 'https://picsum.photos/400/300?random=8', sellerId: users[1].id, status: 'ACTIVE' },
    { title: '兰蔻小黑瓶精华 100ml', description: '专柜购入，剩余约70%，因过敏转卖', price: 450, category: '美妆', images: 'https://picsum.photos/400/300?random=9', sellerId: users[2].id, status: 'ACTIVE' },
    { title: '完美日记口红套装', description: '三支装，色号：红丝绒、枫叶色、奶茶色', price: 120, category: '美妆', images: 'https://picsum.photos/400/300?random=10', sellerId: users[0].id, status: 'ACTIVE' },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }

  console.log('Seeded: 5 categories, 3 users, 10 items');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
