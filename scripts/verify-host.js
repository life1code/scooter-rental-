
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Verification ---');

  // 1. Create a Pending Host
  const email = `test-host-${Date.now()}@example.com`;
  console.log(`Creating pending host: ${email}`);
  const host = await prisma.user.create({
    data: {
      email,
      name: 'Test Host',
      role: 'host',
      approvalStatus: 'pending',
      institutionName: 'Test Rentals',
      institutionAddress: '123 Test St',
      nicNumber: '123456789V',
      phoneNumber: '0700000000'
    }
  });

  // 2. Create a Scooter for this Host
  console.log('Creating scooter for pending host...');
  const scooter = await prisma.scooter.create({
    data: {
      name: 'Pending Host Scooter',
      model: 'Dio',
      type: 'Automatic',
      pricePerDay: 1000,
      image: 'http://example.com/image.jpg',
      description: 'Test Scooter',
      specs: {},
      hostId: host.id,
      status: 'Available'
    }
  });

  // 3. Simulate Public Fetch (filtering logic from route.ts)
  // Logic: OR [{ hostId: null }, { host: { approvalStatus: 'approved' } }]
  console.log('Fetching public scooters (expecting NOT to find it)...');
  const publicScootersBefore = await prisma.scooter.findMany({
    where: {
        OR: [
            { hostId: null },
            { host: { approvalStatus: 'approved' } }
        ]
    }
  });

  const foundBefore = publicScootersBefore.find(s => s.id === scooter.id);
  if (foundBefore) {
    console.error('❌ FAILURE: Scooter from pending host was found in public fetch!');
  } else {
    console.log('✅ SUCCESS: Scooter from pending host is hidden.');
  }

  // 4. Approve Host
  console.log('Approving host...');
  await prisma.user.update({
    where: { id: host.id },
    data: { approvalStatus: 'approved' }
  });

  // 5. Simulate Public Fetch Again
  console.log('Fetching public scooters (expecting to find it)...');
  const publicScootersAfter = await prisma.scooter.findMany({
    where: {
        OR: [
            { hostId: null },
            { host: { approvalStatus: 'approved' } }
        ]
    }
  });

  const foundAfter = publicScootersAfter.find(s => s.id === scooter.id);
  if (foundAfter) {
    console.log('✅ SUCCESS: Scooter from approved host is visible.');
  } else {
    console.error('❌ FAILURE: Scooter from approved host was NOT found!');
  }

  // Cleanup
  console.log('Cleaning up...');
  await prisma.scooter.delete({ where: { id: scooter.id } });
  await prisma.user.delete({ where: { id: host.id } });
  console.log('Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
