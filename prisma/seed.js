import "dotenv/config.js";
import bcrypt from "bcryptjs";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Sample data
const adminUsers = [
  {
    name: "Admin User",
    email: "admin@farmingplatform.com",
    password: "AdminPass@123",
    role: "ADMIN",
  },
];

const vendorUsers = [
  {
    name: "Green Valley Farms",
    email: "greenvalley@farming.com",
    password: "VendorPass@123",
    farmName: "Green Valley Farms",
    farmLocation: "San Francisco, CA",
    farmDescription: "Organic vegetable and fruit farming",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    name: "Urban Harvest Co.",
    email: "urbanharvest@farming.com",
    password: "VendorPass@123",
    farmName: "Urban Harvest Co.",
    farmLocation: "Oakland, CA",
    farmDescription: "Sustainable urban farming with hydroponics",
    latitude: 37.8044,
    longitude: -122.2712,
  },
  {
    name: "Sunny Acres",
    email: "sunnyacres@farming.com",
    password: "VendorPass@123",
    farmName: "Sunny Acres",
    farmLocation: "Berkeley, CA",
    farmDescription: "Certified organic produce",
    latitude: 37.8715,
    longitude: -122.2727,
  },
  {
    name: "Fresh Roots Farm",
    email: "freshroots@farming.com",
    password: "VendorPass@123",
    farmName: "Fresh Roots Farm",
    farmLocation: "San Jose, CA",
    farmDescription: "Heritage vegetables and heirloom seeds",
    latitude: 37.3382,
    longitude: -121.8863,
  },
  {
    name: "Eco Farm Collective",
    email: "ecofarmc@farming.com",
    password: "VendorPass@123",
    farmName: "Eco Farm Collective",
    farmLocation: "Santa Cruz, CA",
    farmDescription: "Community-supported agriculture",
    latitude: 36.9741,
    longitude: -122.0891,
  },
  {
    name: "Organic Haven",
    email: "organichaven@farming.com",
    password: "VendorPass@123",
    farmName: "Organic Haven",
    farmLocation: "Palo Alto, CA",
    farmDescription: "Premium organic herbs and specialty crops",
    latitude: 37.4419,
    longitude: -122.143,
  },
  {
    name: "Garden Grove",
    email: "gardengrove@farming.com",
    password: "VendorPass@123",
    farmName: "Garden Grove",
    farmLocation: "Mountain View, CA",
    farmDescription: "Local vegetable production",
    latitude: 37.3861,
    longitude: -122.0839,
  },
  {
    name: "Seeds & Sprouts",
    email: "seedssprouts@farming.com",
    password: "VendorPass@123",
    farmName: "Seeds & Sprouts",
    farmLocation: "Sunnyvale, CA",
    farmDescription: "Heirloom and organic seeds",
    latitude: 37.3688,
    longitude: -122.0363,
  },
  {
    name: "Harvest Moon Farm",
    email: "harvestmoon@farming.com",
    password: "VendorPass@123",
    farmName: "Harvest Moon Farm",
    farmLocation: "Milpitas, CA",
    farmDescription: "Year-round organic greenhouse farming",
    latitude: 37.4316,
    longitude: -121.8945,
  },
  {
    name: "Sustainable Greens",
    email: "sustainablegreens@farming.com",
    password: "VendorPass@123",
    farmName: "Sustainable Greens",
    farmLocation: "Fremont, CA",
    farmDescription: "Vertical farming and aquaponics",
    latitude: 37.5485,
    longitude: -122.2157,
  },
];

const customerUsers = [
  {
    name: "John Doe",
    email: "john.doe@customer.com",
    password: "CustomerPass@123",
    city: "San Francisco",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@customer.com",
    password: "CustomerPass@123",
    city: "Oakland",
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@customer.com",
    password: "CustomerPass@123",
    city: "Berkeley",
  },
];

const productCategories = [
  "VEGETABLES",
  "FRUITS",
  "ORGANIC_SEEDS",
  "GARDENING_TOOLS",
  "COMPOST",
  "FERTILIZERS",
  "PESTICIDES_ORGANIC",
  "HERBS",
  "FLOWERS",
];

const products = [
  {
    name: "Organic Tomatoes",
    category: "VEGETABLES",
    price: 4.99,
    quantity: 150,
  },
  { name: "Fresh Lettuce", category: "VEGETABLES", price: 3.49, quantity: 200 },
  { name: "Bell Peppers", category: "VEGETABLES", price: 5.99, quantity: 100 },
  { name: "Cucumber Mix", category: "VEGETABLES", price: 2.99, quantity: 180 },
  { name: "Spinach Bunch", category: "VEGETABLES", price: 3.99, quantity: 140 },
  {
    name: "Broccoli Crown",
    category: "VEGETABLES",
    price: 4.49,
    quantity: 120,
  },
  {
    name: "Carrots Bundle",
    category: "VEGETABLES",
    price: 2.49,
    quantity: 250,
  },
  { name: "Radish Mix", category: "VEGETABLES", price: 2.99, quantity: 160 },
  { name: "Kale Greens", category: "VEGETABLES", price: 4.99, quantity: 110 },
  { name: "Zucchini", category: "VEGETABLES", price: 3.99, quantity: 130 },
  { name: "Fresh Strawberries", category: "FRUITS", price: 6.99, quantity: 90 },
  {
    name: "Organic Blueberries",
    category: "FRUITS",
    price: 7.99,
    quantity: 80,
  },
  { name: "Local Apples", category: "FRUITS", price: 5.49, quantity: 200 },
  { name: "Ripe Bananas", category: "FRUITS", price: 2.99, quantity: 300 },
  { name: "Fresh Lemons", category: "FRUITS", price: 4.99, quantity: 150 },
  { name: "Organic Grapes", category: "FRUITS", price: 6.49, quantity: 100 },
  { name: "Peach Collection", category: "FRUITS", price: 5.99, quantity: 120 },
  { name: "Watermelon", category: "FRUITS", price: 8.99, quantity: 50 },
  {
    name: "Tomato Seeds",
    category: "ORGANIC_SEEDS",
    price: 3.99,
    quantity: 500,
  },
  {
    name: "Carrot Seeds",
    category: "ORGANIC_SEEDS",
    price: 2.99,
    quantity: 600,
  },
  {
    name: "Lettuce Seeds",
    category: "ORGANIC_SEEDS",
    price: 2.49,
    quantity: 700,
  },
  {
    name: "Herb Seed Collection",
    category: "ORGANIC_SEEDS",
    price: 12.99,
    quantity: 200,
  },
  {
    name: "Pumpkin Seeds",
    category: "ORGANIC_SEEDS",
    price: 4.99,
    quantity: 400,
  },
  {
    name: "Flower Seed Mix",
    category: "ORGANIC_SEEDS",
    price: 5.99,
    quantity: 300,
  },
  { name: "Basil Plant", category: "HERBS", price: 2.99, quantity: 150 },
  { name: "Parsley Bundle", category: "HERBS", price: 2.49, quantity: 160 },
  { name: "Mint Plant", category: "HERBS", price: 2.99, quantity: 140 },
  { name: "Cilantro Fresh", category: "HERBS", price: 2.49, quantity: 170 },
  { name: "Thyme Herb", category: "HERBS", price: 2.99, quantity: 130 },
  { name: "Oregano Plant", category: "HERBS", price: 2.49, quantity: 120 },
  { name: "Compost Organic", category: "COMPOST", price: 12.99, quantity: 100 },
  {
    name: "Garden Compost 10kg",
    category: "COMPOST",
    price: 14.99,
    quantity: 80,
  },
  { name: "Worm Compost", category: "COMPOST", price: 16.99, quantity: 60 },
  { name: "Peat Moss Mix", category: "COMPOST", price: 9.99, quantity: 120 },
  { name: "Soil Amendment", category: "COMPOST", price: 11.99, quantity: 90 },
  {
    name: "Organic Fertilizer",
    category: "FERTILIZERS",
    price: 13.99,
    quantity: 100,
  },
  {
    name: "Nitrogen Boost",
    category: "FERTILIZERS",
    price: 10.99,
    quantity: 120,
  },
  {
    name: "Phosphate Blend",
    category: "FERTILIZERS",
    price: 12.49,
    quantity: 110,
  },
  {
    name: "Potassium Feed",
    category: "FERTILIZERS",
    price: 11.99,
    quantity: 100,
  },
  {
    name: "Complete NPK Mix",
    category: "FERTILIZERS",
    price: 14.99,
    quantity: 90,
  },
  {
    name: "Organic Pest Control",
    category: "PESTICIDES_ORGANIC",
    price: 15.99,
    quantity: 80,
  },
  {
    name: "Neem Oil Spray",
    category: "PESTICIDES_ORGANIC",
    price: 16.99,
    quantity: 70,
  },
  {
    name: "Sulfur Dust",
    category: "PESTICIDES_ORGANIC",
    price: 9.99,
    quantity: 110,
  },
  {
    name: "Garden Insecticide",
    category: "PESTICIDES_ORGANIC",
    price: 12.99,
    quantity: 95,
  },
  {
    name: "Fungicide Spray",
    category: "PESTICIDES_ORGANIC",
    price: 14.99,
    quantity: 85,
  },
  {
    name: "Garden Spade",
    category: "GARDENING_TOOLS",
    price: 19.99,
    quantity: 50,
  },
  {
    name: "Hand Trowel Tool",
    category: "GARDENING_TOOLS",
    price: 8.99,
    quantity: 200,
  },
  {
    name: "Garden Rake",
    category: "GARDENING_TOOLS",
    price: 15.99,
    quantity: 70,
  },
  {
    name: "Watering Can",
    category: "GARDENING_TOOLS",
    price: 12.99,
    quantity: 100,
  },
  {
    name: "Garden Hose Set",
    category: "GARDENING_TOOLS",
    price: 24.99,
    quantity: 40,
  },
];

const forumCategories = [
  "tips",
  "pests",
  "breeding",
  "harvesting",
  "soil",
  "general",
];

async function seed() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Cleaning up existing data...");
    await prisma.forumPost.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.order.deleteMany();
    await prisma.produce.deleteMany();
    await prisma.rental.deleteMany();
    await prisma.rentalSpace.deleteMany();
    await prisma.sustainabilityCert.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.vendorProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await bcrypt.hash(adminUsers[0].password, 10);
    const admin = await prisma.user.create({
      data: {
        name: adminUsers[0].name,
        email: adminUsers[0].email,
        password: adminPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`   ✓ Admin created: ${admin.email}`);

    // Create vendor users
    console.log("\n🌾 Creating vendor users...");
    const vendors = [];
    for (const vendorData of vendorUsers) {
      const hashedPassword = await bcrypt.hash(vendorData.password, 10);
      const vendor = await prisma.user.create({
        data: {
          name: vendorData.name,
          email: vendorData.email,
          password: hashedPassword,
          role: "VENDOR",
          status: "ACTIVE",
          city: vendorData.farmLocation.split(",")[0],
        },
      });

      // Create vendor profile
      const vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: vendor.id,
          farmName: vendorData.farmName,
          farmLocation: vendorData.farmLocation,
          farmDescription: vendorData.farmDescription,
          latitude: vendorData.latitude,
          longitude: vendorData.longitude,
          certificationStatus: "APPROVED",
        },
      });

      // Create sustainability certification
      await prisma.sustainabilityCert.create({
        data: {
          vendorId: vendorProfile.id,
          certifyingAgency: "USDA Organic",
          certificationNumber: `CERT-${vendor.id.slice(0, 8).toUpperCase()}`,
          certificationDate: new Date(2023, 0, 1),
          expiryDate: new Date(2026, 0, 1),
          status: "APPROVED",
        },
      });

      vendors.push({ user: vendor, profile: vendorProfile });
      console.log(
        `   ✓ Vendor created: ${vendor.email} (${vendorData.farmName})`,
      );
    }

    // Create customer users
    console.log("\n👥 Creating customer users...");
    const customers = [];
    for (const customerData of customerUsers) {
      const hashedPassword = await bcrypt.hash(customerData.password, 10);
      const customer = await prisma.user.create({
        data: {
          name: customerData.name,
          email: customerData.email,
          password: hashedPassword,
          role: "CUSTOMER",
          status: "ACTIVE",
          city: customerData.city,
        },
      });
      customers.push(customer);
      console.log(`   ✓ Customer created: ${customer.email}`);
    }

    // Create products for each vendor
    console.log("\n🥬 Creating products (100+)...");
    let productCount = 0;
    for (const vendor of vendors) {
      const productsPerVendor = Math.ceil(products.length / vendors.length) + 5;
      for (let i = 0; i < productsPerVendor; i++) {
        const productTemplate = products[i % products.length];
        const produce = await prisma.produce.create({
          data: {
            vendorId: vendor.profile.id,
            name: `${productTemplate.name} (${vendor.profile.farmName})`,
            description: `Fresh ${productTemplate.name} from ${vendor.profile.farmName}`,
            price: productTemplate.price,
            category: productTemplate.category,
            availableQuantity:
              productTemplate.quantity + Math.floor(Math.random() * 100),
            unit: "kg",
            certificationStatus: "APPROVED",
          },
        });
        productCount++;
      }
    }
    console.log(`   ✓ Created ${productCount} products`);

    // Create rental spaces
    console.log("\n🏡 Creating rental spaces...");
    for (const vendor of vendors) {
      for (let i = 0; i < 3; i++) {
        await prisma.rentalSpace.create({
          data: {
            vendorId: vendor.profile.id,
            location: `${vendor.profile.farmLocation} - Plot ${i + 1}`,
            size: 100 + i * 50,
            price: 150 + i * 50,
            availability: "AVAILABLE",
            description: `${100 + i * 50}sqm farming space with irrigation`,
            latitude: vendor.profile.latitude,
            longitude: vendor.profile.longitude,
          },
        });
      }
    }
    console.log(`   ✓ Created rental spaces for all vendors`);

    // Create sample orders
    console.log("\n📦 Creating sample orders...");
    let orderCount = 0;
    for (const customer of customers) {
      for (let i = 0; i < 5; i++) {
        const randomProduce = await prisma.produce.findFirst({
          skip: Math.floor(Math.random() * productCount),
          take: 1,
        });

        if (randomProduce) {
          await prisma.order.create({
            data: {
              userId: customer.id,
              produceId: randomProduce.id,
              vendorId: randomProduce.vendorId,
              quantity: Math.floor(Math.random() * 5) + 1,
              totalPrice:
                randomProduce.price * (Math.floor(Math.random() * 5) + 1),
              status: "DELIVERED",
            },
          });
          orderCount++;
        }
      }
    }
    console.log(`   ✓ Created ${orderCount} sample orders`);

    // Create community posts
    console.log("\n💬 Creating community posts...");
    const forumPosts = [
      {
        title: "Best techniques for urban rooftop farming",
        content:
          "I am starting an urban rooftop garden and would like to know the best practices and techniques from experienced farmers.",
        category: "tips",
      },
      {
        title: "Dealing with aphids organically",
        content:
          "My vegetables are being attacked by aphids. What are some effective organic pest control methods?",
        category: "pests",
      },
      {
        title: "Heritage seed preservation",
        content:
          "How do you preserve heirloom seeds for next year's planting season?",
        category: "breeding",
      },
      {
        title: "Timing for tomato harvest",
        content:
          "When is the best time to harvest tomatoes? I want to ensure maximum ripeness.",
        category: "harvesting",
      },
      {
        title: "Soil pH management",
        content: "How can I test and adjust soil pH for optimal plant growth?",
        category: "soil",
      },
    ];

    for (let i = 0; i < forumPosts.length; i++) {
      const post = await prisma.communityPost.create({
        data: {
          userId: customers[i % customers.length].id,
          title: forumPosts[i].title,
          content: forumPosts[i].content,
          category: forumPosts[i].category,
        },
      });

      // Add sample replies
      for (let j = 0; j < 2; j++) {
        await prisma.forumPost.create({
          data: {
            postId: post.id,
            userId: vendors[j % vendors.length].user.id,
            content: `Great question! From my experience at ${vendors[j % vendors.length].profile.farmName}, I can share some insights...`,
          },
        });
      }
    }
    console.log(`   ✓ Created community posts with replies`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Admin users: 1`);
    console.log(`   - Vendor users: ${vendors.length}`);
    console.log(`   - Customer users: ${customers.length}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Orders: ${orderCount}`);
    console.log(`   - Community posts: ${forumPosts.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log(`   Admin: admin@farmingplatform.com / AdminPass@123`);
    console.log(`   Vendor: greenvalley@farming.com / VendorPass@123`);
    console.log(`   Customer: john.doe@customer.com / CustomerPass@123`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
