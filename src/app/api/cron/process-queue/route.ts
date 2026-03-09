import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCampaignMessage } from '@/lib/openai';
import { sendWhatsAppMessage } from '@/lib/zapi';
import { sendCampaignEmail } from '@/lib/email';

const BATCH_SIZE = 20;
const DELAY_BETWEEN_SENDS_MS = 4000; // ~5 msgs/min, within Z-API limits

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Find entries ready to send
  const entries = await prisma.campaignBroker.findMany({
    where: {
      nextMessageAt: { lte: now },
      status: { in: ['pending', 'in_progress'] },
      campaign: { status: 'active' },
    },
    include: {
      broker: true,
      campaign: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
      messages: { orderBy: { sentAt: 'desc' }, select: { content: true } },
    },
    orderBy: { nextMessageAt: 'asc' },
    take: BATCH_SIZE,
  });

  let processed = 0;
  let failed = 0;

  for (const entry of entries) {
    const nextStep = entry.currentStep + 1;
    const step = entry.campaign.steps.find((s) => s.stepNumber === nextStep);

    if (!step) {
      // No more steps — mark unresponsive
      await prisma.campaignBroker.update({
        where: { id: entry.id },
        data: { status: 'unresponsive', nextMessageAt: null },
      });
      await prisma.broker.update({
        where: { id: entry.brokerId },
        data: { status: 'unresponsive' },
      });
      processed++;
      continue;
    }

    const channel = entry.campaign.channel as 'whatsapp' | 'email' | 'both';
    const shouldWhatsApp = channel === 'whatsapp' || channel === 'both';
    const shouldEmail = (channel === 'email' || channel === 'both') && !!entry.broker.email;

    // Skip broker entirely if email-only and no email
    if (channel === 'email' && !entry.broker.email) {
      console.log(`[cron] Skipping broker ${entry.broker.name} (no email) for email-only campaign`);
      processed++;
      continue;
    }

    try {
      // If step has a fixed message (promptOverride), send it directly.
      // Only use AI generation when there's no override.
      let message: string;
      if (step.promptOverride) {
        message = step.promptOverride
          .replace(/\{nome\}/gi, entry.broker.name)
          .replace(/\{telefone\}/gi, entry.broker.phone);
      } else {
        message = await generateCampaignMessage({
          brokerName: entry.broker.name,
          stepNumber: nextStep,
          totalSteps: entry.campaign.totalSteps,
          basePrompt: entry.campaign.basePrompt,
          promptOverride: null,
          previousMessages: entry.messages.map((m) => m.content),
        });
      }

      // Only send media on the first step
      const imageUrl = nextStep === 1 ? entry.campaign.imageUrl : null;
      const mediaType = nextStep === 1 ? entry.campaign.mediaType : null;

      // Send via WhatsApp
      if (shouldWhatsApp) {
        await sendWhatsAppMessage(entry.broker.phone, message, imageUrl, mediaType);
        await prisma.messageLog.create({
          data: {
            campaignBrokerId: entry.id,
            stepNumber: nextStep,
            content: message,
            channel: 'whatsapp',
            status: 'sent',
          },
        });
      }

      // Send via Email
      if (shouldEmail) {
        const subject = `${entry.campaign.name} — Etapa ${nextStep}`;
        const result = await sendCampaignEmail({
          to: entry.broker.email!,
          subject,
          text: message,
          imageUrl,
          mediaType,
        });
        await prisma.messageLog.create({
          data: {
            campaignBrokerId: entry.id,
            stepNumber: nextStep,
            content: message,
            channel: 'email',
            status: result.success ? 'sent' : 'failed',
          },
        });
      }

      // Calculate next message time
      const nextStepConfig = entry.campaign.steps.find((s) => s.stepNumber === nextStep + 1);
      const nextMessageAt = nextStepConfig
        ? new Date(now.getTime() + nextStepConfig.delayDays * 24 * 60 * 60 * 1000)
        : null;

      // Update records
      await prisma.campaignBroker.update({
        where: { id: entry.id },
        data: {
          currentStep: nextStep,
          status: nextMessageAt ? 'in_progress' : 'unresponsive',
          lastMessageAt: now,
          nextMessageAt,
        },
      });

      // Mark unresponsive if this was the last step
      if (!nextMessageAt) {
        await prisma.broker.update({
          where: { id: entry.brokerId },
          data: { status: 'unresponsive' },
        });
      }

      processed++;

      // Delay between sends (only needed when WhatsApp is involved)
      if (shouldWhatsApp && processed < entries.length) {
        await sleep(DELAY_BETWEEN_SENDS_MS);
      }
    } catch (err) {
      console.error(`[cron] Failed to process entry ${entry.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    processed,
    failed,
    total: entries.length,
    timestamp: now.toISOString(),
  });
}
