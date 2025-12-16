import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create plans
  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'monthly',
      features: [
        '1 Project',
        '100 API calls/month',
        'Community support',
        'Basic analytics',
      ],
    },
    {
      name: 'Pro',
      price: 29.99,
      interval: 'monthly',
      features: [
        '10 Projects',
        '10,000 API calls/month',
        'Email support',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration',
      ],
    },
    {
      name: 'Enterprise',
      price: 99.99,
      interval: 'monthly',
      features: [
        'Unlimited Projects',
        'Unlimited API calls',
        'Priority support 24/7',
        'Enterprise analytics',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom contracts',
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        price: plan.price,
        interval: plan.interval,
        features: plan.features,
      },
      create: {
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        features: plan.features,
      },
    });
    console.log(`Created/Updated plan: ${plan.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
