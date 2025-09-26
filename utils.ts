import type { ExtractedAP, FollowupResult } from './types';

export const formatFollowupToMessage = (followup: FollowupResult): string => {
  let message = `**Підсумок обговорення (Follow-up):**\n${followup.summary}\n\n`;

  if (followup.accepted && followup.accepted.length > 0) {
    message += `**✅ Прийнято:**\n${followup.accepted.map(item => `- ${item}`).join('\n')}\n\n`;
  }
  if (followup.rejected && followup.rejected.length > 0) {
    message += `**❌ Відхилено:**\n${followup.rejected.map(item => `- ${item}`).join('\n')}\n\n`;
  }
  if (followup.disputedPoints) {
    message += `**🤔 Спірні моменти:**\n${followup.disputedPoints}\n\n`;
  }
  if (followup.keyInsights && followup.keyInsights.length > 0) {
    message += `**💡 Ключові інсайти:**\n${followup.keyInsights.map(item => `- ${item}`).join('\n')}\n\n`;
  }
  if (followup.openQuestions && followup.openQuestions.length > 0) {
    message += `**❓ Відкриті питання:**\n${followup.openQuestions.map(item => `- ${item}`).join('\n')}\n\n`;
  }
  if (followup.diffFromPrevious) {
    message += `**🔄 Зміни від попереднього звіту:**\n${followup.diffFromPrevious}\n\n`;
  }
  if (followup.nextSteps) {
    message += `**🚀 План дій:**\n${followup.nextSteps}`;
  }

  return message.trim();
};