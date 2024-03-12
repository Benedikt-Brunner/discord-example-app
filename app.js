import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
import { openDb, setupDb, addStudent, getStudents, addExam, getExams, addStudentToExam, getStudentsWritingExam, removeExam } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const db = await openDb();

await setupDb(db);

function formatStudents(students) {
  let formatted = '---- Students ----\n';

  for (const student of students) {
    formatted += `- ${student.name} ${student.emote}\n`;
  }

  return formatted;
}

async function formatExams(exams) {
  let formatted = '---- Exams ----\n';

  for (const exam of exams) {
    const emotes = await getStudentsWritingExam(db, exam.id);
    const emotesString = emotes.map((emote) => emote.emote).join(' ');
    const date = new Date(exam.date);
    const formattedDate = date.toLocaleDateString("de-DE", {  month: 'numeric', day: 'numeric' }).slice(0, -1);

    if (date.getTime() < Date.now()) {
      await removeExam(db, exam.id);

      continue;
    }

    formatted += `- ${exam.subject}${emotesString} : ${formattedDate}\n`;
  }

  return formatted;
}

function formatStudentsForExamSelect(students) {
  return students.map((student) => ({
    label: student.name + ' ' + student.emote,
    value: student.id,
    description: 'Student',
  }));
}

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const { custom_id, values } = data;
    if (custom_id.startsWith('student_select_')) {
      const examId = custom_id.split('_')[2];
      values.forEach(async (studentId) => {
        await addStudentToExam(db, studentId, examId);
      });

      return res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          content: 'Exam added',
          components: [],
        },
      });
    }
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    // "test" command
    if (name === 'addstudent') {
      await addStudent(db, {
        name: options[0].value,
        emote: options[1].value,
      });
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: formatStudents(await getStudents(db)),
        },
      });
    }

    if (name === 'addexam') {
      const studentsOptions = formatStudentsForExamSelect(await getStudents(db));

      const id = await addExam(db, {
        subject: options[0].value,
        date: options[1].value,
      });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Select a student',
          components: [{
              type: MessageComponentTypes.ACTION_ROW,
              components: [{
                type: MessageComponentTypes.STRING_SELECT,
                custom_id: "student_select_" + id,
                options: studentsOptions,
                placeholder: 'Select a student',
                min_values: 1,
                max_values: studentsOptions.length,
                required: true,
              }]
            }]
        },
        });
    }

    if (name === 'getexams') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: await formatExams(await getExams(db)),
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
