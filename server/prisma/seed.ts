import { AuditAction, PrismaClient, RequestStatus, RequestStrategy, TenantRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Prisma seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [alice, bob, charlie, diana] = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: { fullName: "Alice Admin" },
      create: {
        email: "alice@example.com",
        passwordHash,
        fullName: "Alice Admin",
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: { fullName: "Bob Approver" },
      create: {
        email: "bob@example.com",
        passwordHash,
        fullName: "Bob Approver",
      },
    }),
    prisma.user.upsert({
      where: { email: "charlie@example.com" },
      update: { fullName: "Charlie Member" },
      create: {
        email: "charlie@example.com",
        passwordHash,
        fullName: "Charlie Member",
      },
    }),
    prisma.user.upsert({
      where: { email: "diana@example.com" },
      update: { fullName: "Diana Viewer" },
      create: {
        email: "diana@example.com",
        passwordHash,
        fullName: "Diana Viewer",
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
      { tenantId: tenant.id, userId: alice.id, role: TenantRole.admin },
      { tenantId: tenant.id, userId: bob.id, role: TenantRole.approver },
      { tenantId: tenant.id, userId: charlie.id, role: TenantRole.member },
      { tenantId: tenant.id, userId: diana.id, role: TenantRole.viewer },
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
        createdBy: alice.id,
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
      createdBy: charlie.id,
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
      requestedBy: charlie.id,
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
        actorId: alice.id,
        action: AuditAction.tenant_created,
        entityType: "Tenant",
        entityId: tenant.id,
      },
      {
        tenantId: tenant.id,
        actorId: alice.id,
        action: AuditAction.workflow_created,
        entityType: "Workflow",
        entityId: workflow.id,
      },
      {
        tenantId: tenant.id,
        actorId: charlie.id,
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