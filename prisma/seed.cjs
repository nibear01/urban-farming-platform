#!/usr/bin/env node

"use strict";

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Cleaning up existing data...");
    await prisma.forumPost.deleteMany({});
    await prisma.communityPost.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.produce.deleteMany({});
    await prisma.rental.deleteMany({});
    await prisma.rentalSpace.deleteMany({});
    await prisma.sustainabilityCert.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.vendorProfile.deleteMany({});
    await prisma.user.deleteMany({});

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminPassword = await bcrypt.hash("AdminPass@123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@farmingplatform.com",
        password: adminPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(`   ✓ Admin created: ${admin.email}`);

    // Create vendor users with profiles
    console.log("\n🌾 Creating vendor users...");
    const vendorData = [
      {
        name: "Green Valley Farms",
        email: "greenvalley@farming.com",
        farmName: "Green Valley Farms",
        farmLocation: "San Francisco, CA",
        lat: 37.7749,
        lng: -122.4194,
      },
      {
        name: "Urban Harvest Co.",
        email: "urbanharvest@farming.com",
        farmName: "Urban Harvest Co.",
        farmLocation: "Oakland, CA",
        lat: 37.8044,
        lng: -122.2712,
      },
      {
        name: "Sunny Acres",
        email: "sunnyacres@farming.com",
        farmName: "Sunny Acres",
        farmLocation: "Berkeley, CA",
        lat: 37.8715,
        lng: -122.2727,
      },
      {
        name: "Fresh Roots Farm",
        email: "freshroots@farming.com",
        farmName: "Fresh Roots Farm",
        farmLocation: "San Jose, CA",
        lat: 37.3382,
        lng: -121.8863,
      },
      {
        name: "Eco Farm Collective",
        email: "ecofarmc@farming.com",
        farmName: "Eco Farm Collective",
        farmLocation: "Santa Cruz, CA",
        lat: 36.9741,
        lng: -122.0891,
      },
      {
        name: "Organic Haven",
        email: "organichaven@farming.com",
        farmName: "Organic Haven",
        farmLocation: "Palo Alto, CA",
        lat: 37.4419,
        lng: -122.143,
      },
      {
        name: "Garden Grove",
        email: "gardengrove@farming.com",
        farmName: "Garden Grove",
        farmLocation: "Mountain View, CA",
        lat: 37.3861,
        lng: -122.0839,
      },
      {
        name: "Seeds & Sprouts",
        email: "seedssprouts@farming.com",
        farmName: "Seeds & Sprouts",
        farmLocation: "Sunnyvale, CA",
        lat: 37.3688,
        lng: -122.0363,
      },
      {
        name: "Harvest Moon Farm",
        email: "harvestmoon@farming.com",
        farmName: "Harvest Moon Farm",
        farmLocation: "Milpitas, CA",
        lat: 37.4316,
        lng: -121.8945,
      },
      {
        name: "Sustainable Greens",
        email: "sustainablegreens@farming.com",
        farmName: "Sustainable Greens",
        farmLocation: "Fremont, CA",
        lat: 37.5485,
        lng: -122.2157,
      },
    ];

    const vendors = [];
    for (const v of vendorData) {
      const hashedPassword = await bcrypt.hash("VendorPass@123", 10);
      const vendor = await prisma.user.create({
        data: {
          name: v.name,
          email: v.email,
          password: hashedPassword,
          role: "VENDOR",
          status: "ACTIVE",
          city: v.farmLocation.split(",")[0],
        },
      });

      const profile = await prisma.vendorProfile.create({
        data: {
          userId: vendor.id,
          farmName: v.farmName,
          farmLocation: v.farmLocation,
          farmDescription: `Premium farm - ${v.farmName}`,
          latitude: v.lat,
          longitude: v.lng,
          certificationStatus: "APPROVED",
        },
      });

      await prisma.sustainabilityCert.create({
        data: {
          vendorId: profile.id,
          certifyingAgency: "USDA Organic",
          certificationNumber: `CERT-${vendor.id.slice(0, 8)}`,
          certificationDate: new Date(2023, 0, 1),
          expiryDate: new Date(2026, 0, 1),
          status: "APPROVED",
        },
      });

      vendors.push({ user: vendor, profile });
      console.log(`   ✓ Vendor: ${v.email}`);
    }

    // Create customer users
    console.log("\n👥 Creating customer users...");
    const customers = [];
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await bcrypt.hash("CustomerPass@123", 10);
      const customer = await prisma.user.create({
        data: {
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
          password: hashedPassword,
          role: "CUSTOMER",
          status: "ACTIVE",
          city: "San Francisco",
        },
      });
      customers.push(customer);
    }
    console.log(`   ✓ Created ${customers.length} customers`);

    // Create products - 100+
    console.log("\n🥬 Creating 100+ products...");
    const products = [
      { n: "Organic Tomatoes", c: "VEGETABLES", p: 4.99 },
      { n: "Fresh Lettuce", c: "VEGETABLES", p: 3.49 },
      { n: "Bell Peppers", c: "VEGETABLES", p: 5.99 },
      { n: "Cucumber Mix", c: "VEGETABLES", p: 2.99 },
      { n: "Spinach", c: "VEGETABLES", p: 3.99 },
      { n: "Broccoli", c: "VEGETABLES", p: 4.49 },
      { n: "Carrots", c: "VEGETABLES", p: 2.49 },
      { n: "Fresh Strawberries", c: "FRUITS", p: 6.99 },
      { n: "Blueberries", c: "FRUITS", p: 7.99 },
      { n: "Apples", c: "FRUITS", p: 5.49 },
      { n: "Tomato Seeds", c: "ORGANIC_SEEDS", p: 3.99 },
      { n: "Basil Plant", c: "HERBS", p: 2.99 },
      { n: "Organic Compost", c: "COMPOST", p: 12.99 },
      { n: "Fertilizer Mix", c: "FERTILIZERS", p: 13.99 },
      { n: "Garden Spade", c: "GARDENING_TOOLS", p: 19.99 },
    ];

    let prodCount = 0;
    for (const vendor of vendors) {
      for (let i = 0; i < 7; i++) {
        const p = products[i % products.length];
        await prisma.produce.create({
          data: {
            vendorId: vendor.profile.id,
            name: `${p.n} - ${vendor.profile.farmName}`,
            description: `Fresh produce from ${vendor.profile.farmName}`,
            price: p.p,
            category: p.c,
            availableQuantity: Math.floor(Math.random() * 200) + 50,
            unit: "kg",
            certificationStatus: "APPROVED",
          },
        });
        prodCount++;
      }
    }
    console.log(`   ✓ Created ${prodCount} products`);

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
            description: `${100 + i * 50}sqm farming space`,
            latitude: vendor.profile.latitude,
            longitude: vendor.profile.longitude,
          },
        });
      }
    }
    console.log(`   ✓ Created rental spaces`);

    // Create sample orders
    console.log("\n📦 Creating sample orders...");
    let orderCount = 0;
    for (const customer of customers) {
      const produces = await prisma.produce.findMany({ take: 5 });
      for (const produce of produces) {
        await prisma.order.create({
          data: {
            userId: customer.id,
            produceId: produce.id,
            vendorId: produce.vendorId,
            quantity: Math.floor(Math.random() * 5) + 1,
            totalPrice: produce.price * (Math.floor(Math.random() * 5) + 1),
            status: "DELIVERED",
          },
        });
        orderCount++;
      }
    }
    console.log(`   ✓ Created ${orderCount} orders`);

    // Create community posts
    console.log("\n💬 Creating community posts...");
    const posts = [
      {
        t: "Urban rooftop farming tips",
        c: "Starting an urban rooftop garden? Share your tips!",
        cat: "tips",
      },
      {
        t: "Organic pest control",
        c: "How to deal with aphids organically?",
        cat: "pests",
      },
      {
        t: "Seed preservation",
        c: "How to preserve heirloom seeds?",
        cat: "breeding",
      },
      {
        t: "Tomato harvest timing",
        c: "When is the best time to harvest tomatoes?",
        cat: "harvesting",
      },
      {
        t: "Soil pH management",
        c: "How to test and adjust soil pH?",
        cat: "soil",
      },
    ];

    for (let i = 0; i < posts.length; i++) {
      const post = await prisma.communityPost.create({
        data: {
          userId: customers[i % customers.length].id,
          title: posts[i].t,
          content: posts[i].c,
          category: posts[i].cat,
        },
      });

      // Add replies
      for (let j = 0; j < 2; j++) {
        await prisma.forumPost.create({
          data: {
            postId: post.id,
            userId: vendors[j % vendors.length].user.id,
            content: `Great question! From my experience at ${vendors[j % vendors.length].profile.farmName}...`,
          },
        });
      }
    }
    console.log(`   ✓ Created community posts`);

    console.log("\n✅ Database seeding completed!");
    console.log("\n📊 Summary:");
    console.log(`   - Admin: 1`);
    console.log(`   - Vendors: ${vendors.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Products: ${prodCount}`);
    console.log(`   - Orders: ${orderCount}`);
    console.log("\n🔐 Test Credentials:");
    console.log(`   Admin: admin@farmingplatform.com / AdminPass@123`);
    console.log(`   Vendor: greenvalley@farming.com / VendorPass@123`);
    console.log(`   Customer: customer1@example.com / CustomerPass@123`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
