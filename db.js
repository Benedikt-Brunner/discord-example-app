import fs from 'fs';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// you would have to import / invoke this in another file
export async function openDb () {
  return open({
    filename: '/home/container/discord-example-app/db/database.db',
    driver: sqlite3.Database
  })
}

export async function setupDb (db) {
    const migration = fs.readFileSync('/home/container/discord-example-app/migrations/init.sql', 'utf-8');

    await db.exec(migration);
}

export async function addStudent (db, student) {
  await db.run('INSERT INTO Student (name, emote) VALUES (?, ?)', student.name, student.emote)
}

export async function addExam (db, exam) {
    const id = await db.run('INSERT INTO Exam (subject, date) VALUES (?, ?) RETURNING id', exam.subject, exam.date)

    return id.lastID
}

export async function addStudentToExam (db, student, exam) {
    await db.run('INSERT INTO StudentWritingExam (student_id, exam_id) VALUES (?, ?)', student, exam)
}

export async function getStudents (db) {
  return db.all('SELECT * FROM Student')
}

export async function getStudent (db, id) {
  return db.get('SELECT * FROM Student WHERE id = ?', id)
}

export async function getExams (db) {
    return db.all('SELECT * FROM Exam')
}

export async function getStudentsWritingExam (db, exam) {
    return db.all('SELECT (emote) FROM StudentWritingExam LEFT JOIN Student ON Student.id = StudentWritingExam.student_id WHERE exam_id = ?', exam)
}

export async function getExamsForStudent (db, student) {
    return db.all('SELECT * FROM StudentWritingExam LEFT JOIN Exam ON Exam.id = StudentWritingExam.exam_id WHERE student_id = ?', student)
}

export async function removeExam (db, exam) {
    await db.run('DELETE FROM Exam WHERE id = ?', exam)
    await db.run('DELETE FROM StudentWritingExam WHERE exam_id = ?', exam)
}