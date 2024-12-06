
import styles from './styles.module.css';

interface FloatingQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export default function FloatingQuestions({ onQuestionClick }: FloatingQuestionsProps) {
  const questions = [
    "Tell me about us",
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