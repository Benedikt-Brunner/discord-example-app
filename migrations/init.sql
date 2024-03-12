CREATE TABLE IF NOT EXISTS Student (
    id Integer PRIMARY KEY,
  name Text NOT NULL,
  emote Text NOT NULL
);

CREATE TABLE IF NOT EXISTS Exam (
  id Integer PRIMARY KEY,
  subject Text NOT NULL,
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS StudentWritingExam (
  student_id INT REFERENCES Student(id) ON DELETE CASCADE,
  exam_id INT REFERENCES Exam(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, exam_id)
);