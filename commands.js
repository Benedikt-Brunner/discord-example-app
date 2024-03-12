import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const ADD_STUDENT_COMMAND = {
  name: 'addstudent',
  description: 'Add a student to the database',
  options: [
    {
      type: 3,
      name: 'name',
      description: 'Name of the student to add',
      required: true,
    },
    {
      type: 3,
      name: 'emote',
      description: 'Emote for the student to add',
      required: true,
    },
  ],
  type: 1,
};

const ADD_EXAM_COMMAND = {
  name: 'addexam',
  description: 'Add an exam to the database',
  options: [
    {
      type: 3,
      name: 'subject',
      description: 'Name of the exam to add',
      required: true,
    },
    {
      type: 3,
      name: 'date',
      description: 'Date of the exam to add (YYYY-MM-DD)',
      required: true,
    },
  ],
  type: 1,
};

const GET_EXAMS_COMMAND = {
  name: 'getexams',
  description: 'Get all exams from the database',
  type: 1,
};

const ALL_COMMANDS = [ADD_STUDENT_COMMAND, ADD_EXAM_COMMAND, GET_EXAMS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);