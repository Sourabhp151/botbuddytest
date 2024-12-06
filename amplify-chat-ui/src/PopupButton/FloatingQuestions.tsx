import styles from './styles.module.css';

interface FloatingQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export default function FloatingQuestions({ onQuestionClick }: FloatingQuestionsProps) {
  const questions = [
    "About Us",
    "Company Address"
  ];

  return (
    <div className={styles.floatingQuestions}>
      {questions.map((question, index) => (
        <button
          key={index}
          className={styles.floatingQuestion}
          onClick={() => onQuestionClick(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
}