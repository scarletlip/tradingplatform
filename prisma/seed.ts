import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('123456', 10);

  await prisma.favorite.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // 1. Categories — 其他在最右
  console.log('Seeding categories...');
  const cats = [
    { name: '全部', sortOrder: 0 },
    { name: '教材', sortOrder: 1 },
    { name: '数码', sortOrder: 2 },
    { name: '生活', sortOrder: 3 },
    { name: '穿搭', sortOrder: 4 },
    { name: '运动', sortOrder: 5 },
    { name: '乐器', sortOrder: 6 },
    { name: '其他', sortOrder: 7 },
  ];
  for (const c of cats) {
    await prisma.category.create({ data: { ...c, icon: null } });
  }

  // 2. Users — 15 students, default password 123456
  console.log('Seeding users...');
  const adminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.create({
    data: { studentId: 'admin', name: '系统管理员', password: adminPassword, role: 'ADMIN', email: 'admin@cqut.edu.cn', dormitory: '管理后台', phone: null },
  });

  const userData = [
    { studentId: '2021770487', name: '同学1', email: '2021770487@cqut.edu.cn', dormitory: '兰园2栋', phone: '13846913810' },
    { studentId: '2021246316', name: '同学2', email: '2021246316@cqut.edu.cn', dormitory: '松园1栋', phone: '13883197857' },
    { studentId: '2021542417', name: '同学3', email: '2021542417@cqut.edu.cn', dormitory: '兰园2栋', phone: '13822575562' },
    { studentId: '2021629903', name: '同学4', email: '2021629903@cqut.edu.cn', dormitory: '兰园2栋', phone: '13885329037' },
    { studentId: '2021835392', name: '同学5', email: '2021835392@cqut.edu.cn', dormitory: '桂苑3栋', phone: '13839587039' },
    { studentId: '2021391704', name: '同学6', email: '2021391704@cqut.edu.cn', dormitory: '兰园1栋', phone: '13831429110' },
    { studentId: '2021391369', name: '同学7', email: '2021391369@cqut.edu.cn', dormitory: '梅园2栋', phone: '13855176955' },
    { studentId: '2021498382', name: '同学8', email: '2021498382@cqut.edu.cn', dormitory: '竹园5栋', phone: '13856164955' },
    { studentId: '2021865179', name: '同学9', email: '2021865179@cqut.edu.cn', dormitory: '榕苑5栋', phone: '13826753883' },
    { studentId: '2021678856', name: '同学10', email: '2021678856@cqut.edu.cn', dormitory: '竹园6栋', phone: '13887490893' },
    { studentId: '2021148050', name: '同学11', email: '2021148050@cqut.edu.cn', dormitory: '梅园3栋', phone: '13848840994' },
    { studentId: '2021205907', name: '同学12', email: '2021205907@cqut.edu.cn', dormitory: '梅园6栋', phone: '13870855700' },
    { studentId: '2021488162', name: '同学13', email: '2021488162@cqut.edu.cn', dormitory: '梅园2栋', phone: '13899949389' },
    { studentId: '2021174870', name: '同学14', email: '2021174870@cqut.edu.cn', dormitory: '松园5栋', phone: '13881691040' },
    { studentId: '2021584714', name: '同学15', email: '2021584714@cqut.edu.cn', dormitory: '梅园6栋', phone: '13895899313' },
  ];

  const userRecords = [];
  for (const u of userData) {
    userRecords.push(await prisma.user.create({
      data: { ...u, password: defaultPassword },
    }));
  }

  // 3. Items — ~30 test items covering all categories
  console.log('Seeding items...');
  const items = [
    // === 教材 (4 items) ===
    { title: '高等数学（第七版）', description: '同济大学编，九成新，无笔记无划线', price: 35, originalPrice: 55, category: '教材', subCategory: '数学教材', condition: '9成新', images: 'https://picsum.photos/400/300?random=1', campusLocation: '梅园2栋', tradeMethod: '面交', sellerIdx: 0, status: 'ACTIVE' },
    { title: '线性代数辅导讲义', description: '李永乐编，全新未拆封', price: 25, originalPrice: 42, category: '教材', subCategory: '数学教材', condition: '99新', images: 'https://picsum.photos/400/300?random=2', campusLocation: '松园1栋', tradeMethod: '自取', sellerIdx: 1, status: 'ACTIVE' },
    { title: '大学英语精读第三册', description: '使用过一学期，有少量笔记', price: 15, originalPrice: 38, category: '教材', subCategory: '英语教材', condition: '8成新', images: 'https://picsum.photos/400/300?random=3', campusLocation: '兰园2栋', tradeMethod: '面交', sellerIdx: 2, status: 'ACTIVE' },
    { title: 'C程序设计（第五版）', description: '谭浩强，几乎全新', price: 22, originalPrice: 48, category: '教材', subCategory: '计算机教材', condition: '95新', images: 'https://picsum.photos/400/300?random=4', campusLocation: '竹园5栋', tradeMethod: '快递', sellerIdx: 3, status: 'SOLD' },

    // === 数码 (4 items) ===
    { title: 'iPad Air 4 64GB 灰色', description: '2021年购入，电池健康度95%，附赠保护壳和笔', price: 2800, originalPrice: 4399, category: '数码', subCategory: '平板', condition: '9成新', images: 'https://picsum.photos/400/300?random=5', campusLocation: '桂苑3栋', tradeMethod: '面交', sellerIdx: 4, status: 'ACTIVE' },
    { title: '机械键盘 Cherry MX 红轴', description: 'Cherry MX Board 3.0S，自用半年', price: 350, originalPrice: 699, category: '数码', subCategory: '外设', condition: '9成新', images: 'https://picsum.photos/400/300?random=6', campusLocation: '兰园1栋', tradeMethod: '面交', sellerIdx: 5, status: 'ACTIVE' },
    { title: '索尼 WH-1000XM4 耳机', description: '黑色，降噪效果极佳，配件齐全', price: 1200, originalPrice: 2299, category: '数码', subCategory: '耳机', condition: '95新', images: 'https://picsum.photos/400/300?random=7', campusLocation: '梅园2栋', tradeMethod: '面交', sellerIdx: 6, status: 'ACTIVE' },
    { title: '小米手环7 NFC版', description: '黑色，使用三个月，功能正常', price: 150, originalPrice: 279, category: '数码', subCategory: '穿戴', condition: '8成新', images: 'https://picsum.photos/400/300?random=8', campusLocation: '榕苑5栋', tradeMethod: '自取', sellerIdx: 7, status: 'OFFLINE' },

    // === 生活 (4 items) ===
    { title: '小米台灯 Pro', description: '光线柔和不伤眼，宿舍必备', price: 80, originalPrice: 149, category: '生活', subCategory: '照明', condition: '9成新', images: 'https://picsum.photos/400/300?random=9', campusLocation: '竹园6栋', tradeMethod: '面交', sellerIdx: 8, status: 'ACTIVE' },
    { title: '宿舍小冰箱 50L', description: '制冷效果好，搬家带不走，自取优先', price: 200, originalPrice: 399, category: '生活', subCategory: '家电', condition: '8成新', images: 'https://picsum.photos/400/300?random=10', campusLocation: '梅园3栋', tradeMethod: '自取', sellerIdx: 9, status: 'ACTIVE' },
    { title: '折叠收纳箱 3个装', description: '全新未拆封，买多了用不完', price: 30, originalPrice: 59, category: '生活', subCategory: '收纳', condition: '99新', images: 'https://picsum.photos/400/300?random=11', campusLocation: '梅园6栋', tradeMethod: '面交', sellerIdx: 10, status: 'ACTIVE' },
    { title: '迷你电煮锅 1.5L', description: '可煮面煮粥，适合宿舍偷吃', price: 45, originalPrice: 89, category: '生活', subCategory: '厨具', condition: '有瑕疵', images: 'https://picsum.photos/400/300?random=12', campusLocation: '梅园2栋', tradeMethod: '面交', sellerIdx: 11, status: 'SOLD' },

    // === 穿搭 (3 items) ===
    { title: '优衣库羽绒服 M码', description: '深蓝色，只穿过一季，很保暖', price: 180, originalPrice: 499, category: '穿搭', subCategory: '外套', condition: '9成新', images: 'https://picsum.photos/400/300?random=13', campusLocation: '松园5栋', tradeMethod: '面交', sellerIdx: 12, status: 'ACTIVE' },
    { title: 'New Balance 574 38码', description: '灰色经典款，九成新', price: 260, originalPrice: 619, category: '穿搭', subCategory: '鞋子', condition: '9成新', images: 'https://picsum.photos/400/300?random=14', campusLocation: '梅园6栋', tradeMethod: '面交', sellerIdx: 13, status: 'ACTIVE' },
    { title: '帆布手提包 大容量', description: '米白色，通勤上课均可', price: 35, originalPrice: 89, category: '穿搭', subCategory: '包包', condition: '95新', images: 'https://picsum.photos/400/300?random=15', campusLocation: '兰园2栋', tradeMethod: '快递', sellerIdx: 14, status: 'ACTIVE' },

    // === 运动 (3 items) ===
    { title: '尤尼克斯羽毛球拍', description: 'NANORAY 系列，送一桶球', price: 150, originalPrice: 380, category: '运动', subCategory: '球类', condition: '8成新', images: 'https://picsum.photos/400/300?random=16', campusLocation: '桂苑3栋', tradeMethod: '面交', sellerIdx: 4, status: 'ACTIVE' },
    { title: '瑜伽垫 加厚10mm', description: '只用过两次，几乎全新', price: 25, originalPrice: 59, category: '运动', subCategory: '健身', condition: '95新', images: 'https://picsum.photos/400/300?random=17', campusLocation: '兰园2栋', tradeMethod: '自取', sellerIdx: 2, status: 'ACTIVE' },
    { title: '斯伯丁篮球', description: '7号球，室外场打过几次', price: 60, originalPrice: 169, category: '运动', subCategory: '球类', condition: '9成新', images: 'https://picsum.photos/400/300?random=18', campusLocation: '竹园6栋', tradeMethod: '面交', sellerIdx: 8, status: 'ACTIVE' },

    // === 乐器 (3 items) ===
    { title: '卡马吉他 D1C', description: '入门级吉他，送琴包和调音器', price: 280, originalPrice: 499, category: '乐器', subCategory: '吉他', condition: '95新', images: 'https://picsum.photos/400/300?random=19', campusLocation: '梅园3栋', tradeMethod: '面交', sellerIdx: 9, status: 'ACTIVE' },
    { title: '雅马哈竖笛 YRS-23', description: '音乐课用的，几乎全新', price: 30, originalPrice: 68, category: '乐器', subCategory: '管乐', condition: '95新', images: 'https://picsum.photos/400/300?random=20', campusLocation: '榕苑5栋', tradeMethod: '面交', sellerIdx: 7, status: 'ACTIVE' },
    { title: '电子琴 Casio CT-S200', description: '入门电子琴，含琴架和踏板', price: 450, originalPrice: 899, category: '乐器', subCategory: '键盘', condition: '9成新', images: 'https://picsum.photos/400/300?random=21', campusLocation: '松园1栋', tradeMethod: '自取', sellerIdx: 1, status: 'ACTIVE' },

    // === 其他 (3 items) ===
    { title: '兰蔻小黑瓶精华 100ml', description: '专柜购入，剩余约70%，因过敏转卖', price: 450, originalPrice: 1100, category: '其他', subCategory: '美妆', condition: '有瑕疵', images: 'https://picsum.photos/400/300?random=22', campusLocation: '兰园2栋', tradeMethod: '面交', sellerIdx: 2, status: 'ACTIVE' },
    { title: '考研英语真题 2024版', description: '张剑黄皮书，几乎全新没用过', price: 28, originalPrice: 69, category: '其他', subCategory: '考试资料', condition: '99新', images: 'https://picsum.photos/400/300?random=23', campusLocation: '梅园2栋', tradeMethod: '快递', sellerIdx: 0, status: 'ACTIVE' },
    { title: '宿舍用懒人沙发', description: '可折叠，非常舒服，搬家出', price: 55, originalPrice: 139, category: '其他', subCategory: '家具', condition: '8成新', images: 'https://picsum.photos/400/300?random=24', campusLocation: '松园5栋', tradeMethod: '自取', sellerIdx: 12, status: 'ACTIVE' },
  ];

  for (const item of items) {
    const { sellerIdx, ...data } = item;
    await prisma.item.create({
      data: { ...data, sellerId: userRecords[sellerIdx].id },
    });
  }

  console.log(`Seeded: ${cats.length} categories, ${userData.length + 1} users (1 admin), ${items.length} items`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
