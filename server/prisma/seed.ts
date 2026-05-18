import { AuditAction, PrismaClient, RequestStatus, RequestStrategy, TenantRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Prisma seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [ben, joe, jos, stuart] = await Promise.all([
    prisma.user.upsert({
      where: { email: "ben@example.com" },
      update: { fullName: "Ben Stokes" },
      create: {
        email: "ben@example.com",
        passwordHash,
        fullName: "Ben Stokes",
      },
    }),
    prisma.user.upsert({
      where: { email: "joe@example.com" },
      update: { fullName: "Joe Root" },
      create: {
        email: "joe@example.com",
        passwordHash,
        fullName: "Joe Root",
      },
    }),
    prisma.user.upsert({
      where: { email: "jos@example.com" },
      update: { fullName: "Jos Buttler" },
      create: {
        email: "jos@example.com",
        passwordHash,
        fullName: "Jos Buttler",
      },
    }),
    prisma.user.upsert({
      where: { email: "stuart@example.com" },
      update: { fullName: "Stuart Broad" },
      create: {
        email: "stuart@example.com",
        passwordHash,
        fullName: "Stuart Broad",
      },
    }),
  ]);

  console.log("Users seeded");

  // -----------------------
  // Tenant
  // -----------------------
  const tenant = await prisma.tenant.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  console.log("Tenant seeded");

  // -----------------------
  // Memberships
  // -----------------------
  await prisma.tenantMembership.createMany({
    data: [
      { tenantId: tenant.id, userId: ben.id, role: TenantRole.admin },
      { tenantId: tenant.id, userId: joe.id, role: TenantRole.approver },
      { tenantId: tenant.id, userId: jos.id, role: TenantRole.member },
      { tenantId: tenant.id, userId: stuart.id, role: TenantRole.viewer },
    ],
    skipDuplicates: true,
  });

  console.log("Memberships seeded");

  // -----------------------
  // Workflow
  // -----------------------
  const existingWorkflow = await prisma.workflow.findFirst({
    where: {
      tenantId: tenant.id,
      name: "Document Review",
    },
  });

  const workflow =
    existingWorkflow ??
    (await prisma.workflow.create({
      data: {
        tenantId: tenant.id,
        name: "Document Review",
        description: "Standard document review workflow",
        createdBy: ben.id,
      },
    }));

  console.log("Workflow seeded");

  // -----------------------
  // Workflow States
  // -----------------------
  const stateNames = ["Draft", "In Review", "Approved", "Rejected", "Published"];

  for (const [index, name] of stateNames.entries()) {
    await prisma.workflowState.upsert({
      where: {
        workflowId_name: {
          workflowId: workflow.id,
          name,
        },
      },
      update: {},
      create: {
        workflowId: workflow.id,
        tenantId: tenant.id,
        name,
        isInitial: name === "Draft",
        isTerminal: ["Approved", "Rejected", "Published"].includes(name),
        positionOrder: index,
      },
    });
  }

  const states = await prisma.workflowState.findMany({
    where: { workflowId: workflow.id },
  });

  const stateMap = Object.fromEntries(states.map((s) => [s.name, s.id]));

  console.log("States seeded");

  // -----------------------
  // Transitions
  // -----------------------
  const transitions = [
    {
      from: "Draft",
      to: "In Review",
      name: "Submit for Review",
      requiresApproval: false,
      approvalStrategy: RequestStrategy.none,
    },
    {
      from: "In Review",
      to: "Approved",
      name: "Approve",
      requiresApproval: true,
      approvalStrategy: RequestStrategy.single,
    },
    {
      from: "In Review",
      to: "Rejected",
      name: "Reject",
      requiresApproval: true,
      approvalStrategy: RequestStrategy.single,
    },
  ];

  for (const t of transitions) {
    const exists = await prisma.workflowTransition.findFirst({
      where: {
        workflowId: workflow.id,
        fromStateId: stateMap[t.from],
        toStateId: stateMap[t.to],
      },
    });

    if (!exists) {
      await prisma.workflowTransition.create({
        data: {
          workflowId: workflow.id,
          tenantId: tenant.id,
          fromStateId: stateMap[t.from],
          toStateId: stateMap[t.to],
          name: t.name,
          requiresApproval: t.requiresApproval,
          approvalStrategy: t.approvalStrategy,
          allowedRoles: [TenantRole.admin, TenantRole.approver],
        },
      });
    }
  }

  console.log("Transitions seeded");

  // -----------------------
  // Items
  // -----------------------
  const item = await prisma.item.create({
    data: {
      tenantId: tenant.id,
      workflowId: workflow.id,
      currentStateId: stateMap["Draft"],
      createdBy: jos.id,
      title: "Employee Leave Request",
      description: "Annual leave request for June",
      metadata: {
        priority: "medium",
      },
    },
  });

  console.log("Items seeded");

  // -----------------------
  // Request
  // -----------------------
  const approveTransition = await prisma.workflowTransition.findFirstOrThrow({
    where: {
      workflowId: workflow.id,
      name: "Approve",
    },
  });

  const request = await prisma.request.create({
    data: {
      tenantId: tenant.id,
      itemId: item.id,
      transitionId: approveTransition.id,
      requestedBy: jos.id,
      status: RequestStatus.pending,
      idempotencyKey: `seed-${Date.now()}`,
    },
  });

  console.log("Requests seeded");

  // -----------------------
  // Audit Logs
  // -----------------------
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        actorId: ben.id,
        action: AuditAction.tenant_created,
        entityType: "Tenant",
        entityId: tenant.id,
      },
      {
        tenantId: tenant.id,
        actorId: ben.id,
        action: AuditAction.workflow_created,
        entityType: "Workflow",
        entityId: workflow.id,
      },
      {
        tenantId: tenant.id,
        actorId: jos.id,
        action: AuditAction.item_created,
        entityType: "Item",
        entityId: item.id,
      },
    ],
  });

  console.log("Audit logs seeded");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });